import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const money = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 2,
});

export default async function SalesPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
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
    .select("restaurant_id")
    .eq("id", user.id)
    .eq("role", "owner")
    .single();

  if (profileError || !profile?.restaurant_id) {
    redirect("/login");
  }

  const params = searchParams ? await searchParams : {};
  const error = params.error;

  const todays = new Date();
  const dayStart = new Date(todays.getFullYear(), todays.getMonth(), todays.getDate(), 0, 0, 0, 0).toISOString();
  const dayEnd = new Date(todays.getFullYear(), todays.getMonth(), todays.getDate(), 23, 59, 59, 999).toISOString();

  const { data: sales, error: salesError } = await supabase
    .from("sales")
    .select("id, sold_at, product_name_snapshot, quantity, selling_price_snapshot, cost_price_snapshot, profit, restaurant_id")
    .eq("restaurant_id", profile.restaurant_id)
    .order("sold_at", { ascending: false })
    .limit(80);

  if (salesError) {
    return (
      <main className="min-h-screen bg-stone-50 px-5 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Sales</h1>
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to load sales: {salesError.message}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const todaysSales = (sales ?? []).filter((sale) => sale.sold_at >= dayStart && sale.sold_at <= dayEnd);
  const summary = todaysSales.reduce(
    (acc, sale) => {
      acc.sales += 1;
      acc.quantity += sale.quantity;
      acc.revenue += sale.selling_price_snapshot * sale.quantity;
      acc.profit += sale.profit;
      return acc;
    },
    { sales: 0, quantity: 0, revenue: 0, profit: 0 }
  );

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">Sales</h1>
              <p className="mt-1 text-sm text-stone-500">Sales management</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/sales/new" className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
                Record Sale
              </Link>
              <Link href="/dashboard" className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
                Dashboard
              </Link>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error === "missing-product" ? "Choose a product." :
                error === "invalid-quantity" ? "Quantity must be a whole number greater than zero." :
                error === "quantity-must-be-positive" ? "Quantity must be greater than zero." :
                error === "invalid-sold-at" ? "Enter a valid sale date/time." :
                error === "invalid-product" ? "Invalid product selection." :
                error === "inactive-product" ? "Inactive products cannot be sold." :
                decodeURIComponent(error)}
            </div>
          )}

          <section className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">Today’s summary</h2>
                <p className="text-xs text-stone-500">{todays.toLocaleDateString("en-ET")}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl bg-white px-4 py-3">
                  <div className="text-xs font-medium text-stone-500">Sales</div>
                  <div className="mt-1 text-lg font-bold text-stone-900">{summary.sales}</div>
                </div>
                <div className="rounded-xl bg-white px-4 py-3">
                  <div className="text-xs font-medium text-stone-500">Qty sold</div>
                  <div className="mt-1 text-lg font-bold text-stone-900">{summary.quantity}</div>
                </div>
                <div className="rounded-xl bg-white px-4 py-3">
                  <div className="text-xs font-medium text-stone-500">Revenue</div>
                  <div className="mt-1 text-lg font-bold text-stone-900">{money.format(summary.revenue)}</div>
                </div>
                <div className="rounded-xl bg-white px-4 py-3">
                  <div className="text-xs font-medium text-stone-500">Profit</div>
                  <div className="mt-1 text-lg font-bold text-green-700">{money.format(summary.profit)}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">Recent sales</h2>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                {sales?.length ?? 0} sales
              </span>
            </div>

            {(sales ?? []).length === 0 ? (
              <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-500">
                No sales yet. Record your first sale.
              </div>
            ) : (
              <div className="space-y-3">
                {(sales ?? []).map((sale) => (
                  <div key={sale.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
                    <div className="min-w-[190px]">
                      <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">{new Date(sale.sold_at).toLocaleString("en-ET")}</div>
                      <div className="mt-2 font-semibold text-stone-900">
                        <Link href={`/dashboard/sales/${sale.id}`} className="hover:text-stone-700">
                          {sale.product_name_snapshot}
                        </Link>
                      </div>
                    </div>
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Qty:</span> {sale.quantity}
                    </div>
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Selling:</span> {money.format(sale.selling_price_snapshot)}
                    </div>
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Cost:</span> {money.format(sale.cost_price_snapshot)}
                    </div>
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Revenue:</span> {money.format(sale.selling_price_snapshot * sale.quantity)}
                    </div>
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Profit:</span> <span className="text-green-700">{money.format(sale.profit)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
