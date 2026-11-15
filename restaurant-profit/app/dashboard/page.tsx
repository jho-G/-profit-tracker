import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, restaurant_id")
    .eq("id", user.id)
    .eq("role", "owner")
    .single();

  if (profileError || !profile?.restaurant_id) {
    redirect("/login");
  }

  const restaurantId = profile.restaurant_id;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

  // Optimized scalable queries for the single restaurant:
  // 1. Restaurant identity
  // 2. Active & inactive products
  // 3. Today's sales (for accurate today profit, revenue, and meal groups)
  // 4. Recent sales (for Sell tab display)
  // 5. Database aggregation RPC for all-time profit
  const [restaurantResult, productsResult, todaySalesResult, recentSalesResult, rpcStatsResult] = await Promise.all([
    supabase
      .from("restaurants")
      .select("id, name")
      .eq("id", restaurantId)
      .maybeSingle(),
    supabase
      .from("products")
      .select("id,name,cost_price,selling_price,active,category,description,image_url")
      .eq("restaurant_id", restaurantId)
      .order("name", { ascending: true }),
    supabase
      .from("sales")
      .select("id,sold_at,product_name_snapshot,quantity,cost_price_snapshot,selling_price_snapshot,profit,restaurant_id")
      .eq("restaurant_id", restaurantId)
      .gte("sold_at", todayStart)
      .lte("sold_at", todayEnd)
      .order("sold_at", { ascending: false }),
    supabase
      .from("sales")
      .select("id,sold_at,product_name_snapshot,quantity,cost_price_snapshot,selling_price_snapshot,profit,restaurant_id")
      .eq("restaurant_id", restaurantId)
      .order("sold_at", { ascending: false })
      .limit(10),
    supabase.rpc("get_sales_aggregates", {
      p_restaurant_id: restaurantId,
    }),
  ]);

  let allProfit = 0;
  if (!rpcStatsResult.error && rpcStatsResult.data && typeof rpcStatsResult.data === "object") {
    const stats = rpcStatsResult.data as { total_profit?: number };
    if (stats.total_profit != null) {
      allProfit = Number(stats.total_profit);
    }
  } else {
    // Lightweight fallback if database RPC has not been executed yet
    const { data: profitRows } = await supabase
      .from("sales")
      .select("profit")
      .eq("restaurant_id", restaurantId);
    allProfit = (profitRows ?? []).reduce((acc, row) => acc + Number(row.profit ?? 0), 0);
  }

  const todaySales = todaySalesResult.data ?? [];
  const todayProfit = todaySales.reduce((sum, s) => sum + Number(s.profit ?? 0), 0);
  const todayRevenue = todaySales.reduce(
    (sum, s) => sum + Number(s.selling_price_snapshot ?? 0) * Number(s.quantity ?? 0),
    0
  );

  return (
    <DashboardClient
      restaurant={restaurantResult.data}
      products={productsResult.data ?? []}
      todaySales={todaySales}
      recentSales={recentSalesResult.data ?? []}
      restaurantId={restaurantId}
      initialAllProfit={allProfit}
      initialTodayProfit={todayProfit}
      initialTodayRevenue={todayRevenue}
    />
  );
}
