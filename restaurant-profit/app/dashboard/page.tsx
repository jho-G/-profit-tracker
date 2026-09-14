import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import { createSale } from "./sales/actions";
import { toggleProductStatus } from "./products/actions";

const money = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 0,
});

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; filter?: string; start?: string; end?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const allParams = searchParams ? await searchParams : {};
  const tab = allParams.tab === "menu" ? "menu" : allParams.tab === "history" ? "history" : "sell";
  const filter = allParams.filter ?? "today";

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
    return (
      <main className="min-h-screen bg-[#f8f4ee] px-4 py-8">
        <div className="mx-auto w-full max-w-[480px] rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">ልዩ ሽሮ Profit Tracker</h1>
          <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Authenticated owner profile or restaurant mapping is missing.
          </div>
          <div className="mt-5">
            <LogoutButton />
          </div>
        </div>
      </main>
    );
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("id", profile.restaurant_id)
    .maybeSingle();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id,name,cost_price,selling_price,active,category,description,image_url")
    .eq("restaurant_id", profile.restaurant_id)
    .order("name", { ascending: true });

  const activeProducts = (products ?? []).filter((p) => p.active);
  const inactiveProducts = (products ?? []).filter((p) => !p.active);

  const { data: sales, error: salesError } = await supabase
    .from("sales")
    .select("id,sold_at,product_name_snapshot,quantity,cost_price_snapshot,selling_price_snapshot,profit,restaurant_id")
    .eq("restaurant_id", profile.restaurant_id)
    .order("sold_at", { ascending: false });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
  const todaySales = (sales ?? []).filter((sale) => sale.sold_at >= todayStart && sale.sold_at <= todayEnd);

  const todayProfit = todaySales.reduce((sum, sale) => sum + Number(sale.profit ?? 0), 0);
  const todayRevenue = todaySales.reduce(
    (sum, sale) => sum + Number(sale.selling_price_snapshot ?? 0) * Number(sale.quantity ?? 0),
    0
  );

  const allProfit = (sales ?? []).reduce((sum, sale) => sum + Number(sale.profit ?? 0), 0);

  const lines = (sales ?? []).filter((sale) => sale.sold_at >= todayStart && sale.sold_at <= todayEnd);
  const productGroups = new Map<string, { quantity: number; profit: number }>();
  for (const sale of lines) {
    const key = String(sale.product_name_snapshot || "Meal");
    const existing = productGroups.get(key) ?? { quantity: 0, profit: 0 };
    existing.quantity += Number(sale.quantity);
    existing.profit += Number(sale.profit ?? 0);
    productGroups.set(key, existing);
  }

  const historyFilter = filter;
  const historyData = historyRecordsForFilter(sales ?? [], historyFilter, allParams.start, allParams.end);
  const historyProfit = historyData.reduce((sum, sale) => sum + Number(sale.profit ?? 0), 0);
  const historyMeals = historyData.reduce((sum, sale) => sum + Number(sale.quantity ?? 0), 0);

  return (
    <main className="min-h-screen bg-[#f8f4ee] px-4 py-8">
      <div className="mx-auto w-full max-w-[480px] rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <div className="text-[22px] font-black tracking-tight text-stone-900">ልዩ ሽሮ Profit Tracker</div>
            <div className="text-[11px] font-medium text-stone-500">Profit tracker</div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-full border border-stone-200 bg-white p-2 text-stone-700 hover:bg-stone-50">
              <svg aria-label="lock" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6z" /></svg>
            </button>
            <LogoutButton />
          </div>
        </div>

        <section className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-stone-200 bg-[#fbf7f1] p-3">
              <div className="text-[11px] font-semibold text-stone-500">Today’s profit</div>
              <div className="mt-1 text-[24px] font-black leading-none text-green-700">{money.format(todayProfit)}</div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-[#fbf7f1] p-3">
              <div className="text-[11px] font-semibold text-stone-500">Today’s sales</div>
              <div className="mt-1 text-[24px] font-black leading-none text-stone-900">{money.format(todayRevenue)}</div>
            </div>
          </div>
        </section>

        <section className="px-5">
          <div className="flex rounded-2xl bg-stone-100 p-1">
            <a href="/dashboard?tab=sell" className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-bold ${tab === "sell" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>Sell</a>
            <a href="/dashboard?tab=menu" className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-bold ${tab === "menu" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>Menu</a>
            <a href="/dashboard?tab=history" className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-bold ${tab === "history" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>History</a>
          </div>
        </section>

        <section className="px-5 py-4">
          {tab === "sell" && (
            <div className="space-y-4">
              {(activeProducts ?? []).length === 0 ? (
                <div className="rounded-2xl border border-stone-200 p-4 text-sm text-stone-500">No active products available.</div>
              ) : (
                <div className="space-y-3">
                  {(activeProducts ?? []).map((product) => (
                    <div key={product.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-black text-stone-900">{product.name}</div>
                          <div className="mt-1 text-[11px] font-semibold text-stone-500">
                            cost {money.format(product.cost_price)} · sell {money.format(product.selling_price)} · profit {money.format(product.selling_price - product.cost_price)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <form action={createSale} className="flex items-center gap-2">
                            <input type="hidden" name="product_id" value={product.id} />
                            <input type="hidden" name="sold_at" value={new Date().toISOString()} />
                            <input name="quantity" type="number" min="1" step="1" defaultValue={1} required className="w-14 rounded-xl border border-stone-300 px-2 py-2 text-center text-sm font-semibold outline-none focus:border-stone-900" />
                            <button type="submit" className="rounded-xl bg-green-700 px-4 py-2 text-xs font-black text-white hover:bg-green-800">Log sale</button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="text-sm font-black text-stone-900">Today by product</div>
                <div className="mt-3 space-y-2">
                  {Array.from(productGroups.entries()).length === 0 ? (
                    <div className="text-xs text-stone-500">No sales recorded today.</div>
                  ) : (
                    Array.from(productGroups.entries()).map(([name, group]) => (
                      <div key={name} className="flex items-center justify-between text-xs text-stone-700">
                        <span>{name} × {group.quantity}</span>
                        <span className="font-black text-green-700">+{money.format(group.profit)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "menu" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-stone-900">Menu</h3>
                <Link href="/dashboard/products/new" className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800">Add product</Link>
              </div>

              <div className="space-y-3">
                {activeProducts.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-black text-stone-900">{product.name}</div>
                        <div className="text-[11px] font-semibold text-stone-500">cost {money.format(product.cost_price)} · sell {money.format(product.selling_price)} · profit {money.format(product.selling_price - product.cost_price)} Birr</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/dashboard/products/${product.id}`} className="rounded-lg border border-stone-300 px-2 py-2 text-[11px] font-bold text-stone-700 hover:bg-stone-50">Price history</Link>
                        <Link href={`/dashboard/products/${product.id}/edit`} className="rounded-lg border border-stone-300 px-2 py-2 text-[11px] font-bold text-stone-700 hover:bg-stone-50">Edit</Link>
                        <form action={toggleProductStatus.bind(null, product.id, false)} method="POST">
                          <button type="submit" className="rounded-lg bg-amber-700 px-2 py-2 text-[11px] font-bold text-white hover:bg-amber-800">Deactivate</button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {inactiveProducts.length > 0 && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="text-sm font-black text-stone-900">Inactive products</div>
                  <div className="mt-3 space-y-3">
                    {inactiveProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-black text-stone-900">{product.name}</div>
                          <div className="text-[11px] font-semibold text-stone-500">inactive</div>
                        </div>
                        <form action={toggleProductStatus.bind(null, product.id, true)} method="POST">
                          <button type="submit" className="rounded-xl bg-green-700 px-3 py-2 text-[11px] font-black text-white hover:bg-green-800">Reactivate</button>
                        </form>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-stone-900">All-time profit</div>
                    <div className="mt-1 text-[28px] font-black text-green-700">{money.format(allProfit)}</div>
                  </div>
                  <a href="/api/sales/export?filter=" className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-white">Export this view as CSV</a>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    ["today", "Today"],
                    ["yesterday", "Yesterday"],
                    ["7d", "Last 7 days"],
                    ["all", "All time"],
                  ].map(([value, label]) => (
                    <a key={value} href={`/dashboard?tab=history&filter=${value}`} className={`rounded-full px-3 py-1 text-[11px] font-black ${filter === value ? "bg-stone-900 text-white" : "border border-stone-300 bg-white text-stone-700"}`}>{label}</a>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-[11px] font-bold text-stone-500">Custom date</span>
                  <form className="flex gap-2" action="/dashboard" method="GET">
                    <input type="hidden" name="tab" value="history" />
                    <input type="date" name="start" className="rounded-xl border border-stone-300 px-2 py-2 text-xs" />
                    <input type="date" name="end" className="rounded-xl border border-stone-300 px-2 py-2 text-xs" />
                    <button className="rounded-xl bg-stone-900 px-3 py-2 text-[11px] font-black text-white">Apply</button>
                  </form>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-stone-900">{historyMeals} meals sold</div>
                  <div className="text-sm font-black text-green-700">{money.format(historyProfit)} profit</div>
                </div>
              </div>

              <div className="space-y-2">
                {historyData.length === 0 ? (
                  <div className="rounded-2xl border border-stone-200 p-4 text-sm text-stone-500">No sales in this history view.</div>
                ) : (
                  historyData.map((sale) => (
                    <div key={sale.id} className="rounded-2xl border border-stone-200 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-black text-stone-900">{sale.product_name_snapshot} × {sale.quantity}</div>
                          <div className="text-[11px] font-semibold text-stone-500">{new Date(sale.sold_at).toLocaleString("en-ET")}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-green-700">+{money.format(Number(sale.profit))}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function historyRecordsForFilter(sales: any[], filter: string, start?: string, end?: string) {
  if (!sales) return [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0).toISOString();
  const sevenStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0).toISOString();

  let result = [...sales];
  if (filter === "today") result = result.filter((sale) => sale.sold_at >= todayStart && sale.sold_at <= todayEnd);
  else if (filter === "yesterday") result = result.filter((sale) => sale.sold_at >= yesterdayStart && sale.sold_at < todayStart);
  else if (filter === "7d") result = result.filter((sale) => sale.sold_at >= sevenStart);
  else if (filter === "custom" && start && end) {
    const s = new Date(start).toISOString();
    const e = new Date(end).toISOString();
    result = result.filter((sale) => sale.sold_at >= s && sale.sold_at <= e);
  }

  return result;
}
