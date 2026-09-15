import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteSale } from "../actions";

const money = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 2,
});

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select("id, restaurant_id, product_id, quantity, sold_at, created_by, product_name_snapshot, cost_price_snapshot, selling_price_snapshot, profit, updated_at")
    .eq("id", id)
    .eq("restaurant_id", profile.restaurant_id)
    .maybeSingle();

  if (saleError || !sale) {
    redirect("/dashboard/sales?error=missing-sale");
  }

  const { data: creator } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", sale.created_by)
    .maybeSingle();

  const revenue = sale.selling_price_snapshot * sale.quantity;

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">Sale Detail</h1>
              <p className="mt-1 text-sm text-stone-500">{sale.product_name_snapshot}</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/dashboard/sales/${sale.id}/edit`} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
                Edit sale
              </Link>
              <form action={deleteSale.bind(null, sale.id)}>
                <button type="submit" className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
                  Delete sale
                </button>
              </form>
              <Link href="/dashboard/sales" className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
                Back to sales
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-stone-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Product</div>
              <div className="mt-2 text-sm font-semibold text-stone-900">{sale.product_name_snapshot}</div>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Quantity</div>
              <div className="mt-2 text-sm font-semibold text-stone-900">{sale.quantity}</div>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Sale date/time</div>
              <div className="mt-2 text-sm font-semibold text-stone-900">{new Date(sale.sold_at).toLocaleString("en-ET")}</div>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Created by</div>
              <div className="mt-2 text-sm font-semibold text-stone-900">{creator?.full_name || sale.created_by}</div>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Cost price at sale</div>
              <div className="mt-2 text-sm font-semibold text-stone-900">{money.format(sale.cost_price_snapshot)}</div>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Selling price at sale</div>
              <div className="mt-2 text-sm font-semibold text-stone-900">{money.format(sale.selling_price_snapshot)}</div>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Total revenue</div>
              <div className="mt-2 text-sm font-semibold text-stone-900">{money.format(revenue)}</div>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Profit</div>
              <div className="mt-2 text-sm font-semibold text-stone-900">{money.format(sale.profit)}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
