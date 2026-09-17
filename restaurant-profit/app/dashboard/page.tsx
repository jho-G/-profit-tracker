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

  const [restaurantResult, productsResult, salesResult] = await Promise.all([
    supabase
      .from("restaurants")
      .select("id, name")
      .eq("id", profile.restaurant_id)
      .maybeSingle(),
    supabase
      .from("products")
      .select("id,name,cost_price,selling_price,active,category,description,image_url")
      .eq("restaurant_id", profile.restaurant_id)
      .order("name", { ascending: true }),
    supabase
      .from("sales")
      .select("id,sold_at,product_name_snapshot,quantity,cost_price_snapshot,selling_price_snapshot,profit,restaurant_id")
      .eq("restaurant_id", profile.restaurant_id)
      .order("sold_at", { ascending: false })
      .limit(500),
  ]);

  return (
    <DashboardClient
      restaurant={restaurantResult.data}
      products={productsResult.data ?? []}
      sales={salesResult.data ?? []}
      restaurantId={profile.restaurant_id}
    />
  );
}
