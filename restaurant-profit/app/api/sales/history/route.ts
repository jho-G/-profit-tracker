import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("restaurant_id")
      .eq("id", user.id)
      .eq("role", "owner")
      .single();

    if (profileError || !profile?.restaurant_id) {
      return NextResponse.json({ error: "Owner profile not found" }, { status: 403 });
    }

    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") ?? "today";
    const start = url.searchParams.get("start") ?? "";
    const end = url.searchParams.get("end") ?? "";
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100);
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const offset = (page - 1) * limit;

    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const startToday = base.toISOString();
    const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
    const startYesterday = new Date(base.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const startSeven = new Date(base.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();

    let startDate: string | null = null;
    let endDate: string | null = null;

    if (filter === "today") {
      startDate = startToday;
      endDate = endToday;
    } else if (filter === "yesterday") {
      startDate = startYesterday;
      endDate = startToday;
    } else if (filter === "7d") {
      startDate = startSeven;
    } else if (filter === "custom") {
      if (start) startDate = new Date(start).toISOString();
      if (end) endDate = new Date(end + "T23:59:59.999").toISOString();
    }

    // Try calculating exact stats via PostgreSQL RPC first
    let totalProfit = 0;
    let totalMeals = 0;
    let totalSales = 0;
    let usedRpc = false;

    const { data: rpcStats, error: rpcError } = await supabase.rpc("get_sales_aggregates", {
      p_restaurant_id: profile.restaurant_id,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (!rpcError && rpcStats) {
      totalProfit = Number(rpcStats.total_profit ?? 0);
      totalMeals = Number(rpcStats.total_meals ?? 0);
      totalSales = Number(rpcStats.total_sales ?? 0);
      usedRpc = true;
    }

    // Build the query for sales rows
    let query = supabase
      .from("sales")
      .select("id, sold_at, product_name_snapshot, quantity, cost_price_snapshot, selling_price_snapshot, profit, restaurant_id")
      .eq("restaurant_id", profile.restaurant_id)
      .order("sold_at", { ascending: false });

    if (startDate) query = query.gte("sold_at", startDate);
    if (endDate) {
      if (filter === "yesterday") {
        query = query.lt("sold_at", endDate);
      } else {
        query = query.lte("sold_at", endDate);
      }
    }

    // If RPC was not available, run a lightweight sum query over the filtered range
    if (!usedRpc) {
      let statsQuery = supabase
        .from("sales")
        .select("quantity, profit")
        .eq("restaurant_id", profile.restaurant_id);

      if (startDate) statsQuery = statsQuery.gte("sold_at", startDate);
      if (endDate) {
        if (filter === "yesterday") {
          statsQuery = statsQuery.lt("sold_at", endDate);
        } else {
          statsQuery = statsQuery.lte("sold_at", endDate);
        }
      }

      const { data: statsRows } = await statsQuery;
      if (statsRows) {
        totalSales = statsRows.length;
        totalMeals = statsRows.reduce((sum, r) => sum + Number(r.quantity ?? 0), 0);
        totalProfit = statsRows.reduce((sum, r) => sum + Number(r.profit ?? 0), 0);
      }
    }

    // Paginate results efficiently
    const { data: sales, error: salesError } = await query.range(offset, offset + limit - 1);

    if (salesError) {
      return NextResponse.json({ error: salesError.message }, { status: 500 });
    }

    const items = sales ?? [];
    const hasMore = offset + items.length < totalSales;

    return NextResponse.json({
      sales: items,
      totalProfit,
      totalMeals,
      totalSales,
      page,
      hasMore,
    });
  } catch (err) {
    console.error("Sales history error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
