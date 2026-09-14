import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const money = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 2,
});

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("restaurant_id")
    .eq("id", user.id)
    .eq("role", "owner")
    .single();

  if (profileError || !profile?.restaurant_id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") ?? "all";
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const startToday = base.toISOString();
  const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
  const startYesterday = new Date(base.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const startSeven = new Date(base.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("sales")
    .select("sold_at, product_name_snapshot, quantity, cost_price_snapshot, selling_price_snapshot, profit")
    .eq("restaurant_id", profile.restaurant_id)
    .order("sold_at", { ascending: false });

  if (filter === "today") {
    query = query.gte("sold_at", startToday).lte("sold_at", endToday);
  } else if (filter === "yesterday") {
    query = query.gte("sold_at", startYesterday).lt("sold_at", startToday);
  } else if (filter === "7d") {
    query = query.gte("sold_at", startSeven);
  } else if (filter === "custom") {
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");
    if (start) query = query.gte("sold_at", new Date(start).toISOString());
    if (end) query = query.lte("sold_at", new Date(end).toISOString());
  }

  const { data: sales, error } = await query;

  if (error || !sales) {
    return NextResponse.json({ error: "Sales export unavailable" }, { status: 400 });
  }

  const header = ["Date", "Meal/Product", "Quantity", "Cost per unit", "Price per unit", "Profit"];
  const rows = sales.map((sale) => [
    new Date(sale.sold_at).toLocaleString("en-ET"),
    sale.product_name_snapshot,
    String(sale.quantity),
    money.format(sale.cost_price_snapshot),
    money.format(sale.selling_price_snapshot),
    money.format(sale.profit),
  ]);

  const csv = [
    header.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sales-${filter}.csv"`,
    },
  });
}
