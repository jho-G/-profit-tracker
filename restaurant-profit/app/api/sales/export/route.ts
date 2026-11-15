import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatEthiopianDate } from "@/lib/ethiopian-calendar";

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
  const start = url.searchParams.get("start") ?? "";
  const end = url.searchParams.get("end") ?? "";

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
  } else if (filter === "custom" || filter === "month" || start || end) {
    if (start) {
      const s = start.includes("T") ? new Date(start) : new Date(start + "T00:00:00.000");
      if (!isNaN(s.getTime())) query = query.gte("sold_at", s.toISOString());
    }
    if (end) {
      const e = end.includes("T") ? new Date(end) : new Date(end + "T23:59:59.999");
      if (!isNaN(e.getTime())) query = query.lte("sold_at", e.toISOString());
    }
  }

  const { data: sales, error } = await query;

  if (error || !sales) {
    return NextResponse.json({ error: "Sales export unavailable" }, { status: 400 });
  }

  // Header with clear columns and currency indication
  const headers = [
    "#",
    "Ethiopian Date (የኢትዮጵያ ቀን)",
    "Time (ሰዓት)",
    "Gregorian Date (G.C.)",
    "Meal Name (የምግብ ስም)",
    "Quantity (ብዛት)",
    "Unit Cost ETB (የአንዱ ወጪ)",
    "Unit Price ETB (የአንዱ መሸጫ)",
    "Total Revenue ETB (ጠቅላላ ገቢ)",
    "Total Cost ETB (ጠቅላላ ወጪ)",
    "Total Profit ETB (የተጣራ ትርፍ)",
  ];

  let sumQuantity = 0;
  let sumRevenue = 0;
  let sumCost = 0;
  let sumProfit = 0;

  const rows = sales.map((sale, index) => {
    const qty = Number(sale.quantity || 0);
    const unitCost = Number(sale.cost_price_snapshot || 0);
    const unitPrice = Number(sale.selling_price_snapshot || 0);
    const totalRev = unitPrice * qty;
    const totalCost = unitCost * qty;
    const profit = Number(sale.profit ?? (totalRev - totalCost));

    sumQuantity += qty;
    sumRevenue += totalRev;
    sumCost += totalCost;
    sumProfit += profit;

    const dateObj = new Date(sale.sold_at);
    const ethDate = formatEthiopianDate(sale.sold_at, true);
    const timeStr = dateObj.toLocaleTimeString("en-ET", { hour: "2-digit", minute: "2-digit" });
    const gregDate = dateObj.toISOString().replace("T", " ").slice(0, 19);

    return [
      String(index + 1),
      ethDate,
      timeStr,
      gregDate,
      sale.product_name_snapshot,
      qty.toString(),
      unitCost.toFixed(2),
      unitPrice.toFixed(2),
      totalRev.toFixed(2),
      totalCost.toFixed(2),
      profit.toFixed(2),
    ];
  });

  // Summary row at the bottom for instant Excel auditing
  const summaryRow = [
    "TOTAL (ድምር)",
    "",
    "",
    "",
    `${sales.length} Sales Records`,
    sumQuantity.toString(),
    "",
    "",
    sumRevenue.toFixed(2),
    sumCost.toFixed(2),
    sumProfit.toFixed(2),
  ];

  const escapeCell = (val: string) => `"${val.replace(/"/g, '""')}"`;

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
    summaryRow.map(escapeCell).join(","),
  ].join("\r\n");

  // \uFEFF is UTF-8 Byte Order Mark (BOM), required by Microsoft Excel to display Amharic/Ge'ez text without corruption
  const csvWithBom = `\uFEFF${csvContent}`;

  const todayStr = new Date().toISOString().slice(0, 10);
  const filename = `liyu-shiro-sales-${filter}-${todayStr}.csv`;

  return new NextResponse(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
