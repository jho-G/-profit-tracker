import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteSale, updateSale } from "../../actions";

export default async function EditSalePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
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

  const { id } = await params;
  const { data: sale, error } = await supabase
    .from("sales")
    .select("id, restaurant_id, product_name_snapshot, quantity, sold_at, cost_price_snapshot, selling_price_snapshot")
    .eq("id", id)
    .eq("restaurant_id", profile.restaurant_id)
    .maybeSingle();

  if (error || !sale) {
    redirect("/dashboard/sales");
  }

  const paramsValue = searchParams ? await searchParams : {};
  const errorMessage = paramsValue.error;

  const soldAtValue = new Date(sale.sold_at).toISOString().slice(0, 16);

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">Edit Sale</h1>
              <p className="mt-1 text-sm text-stone-500">Correct this sale entry</p>
            </div>
            <Link href="/dashboard/sales" className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
              Back to sales
            </Link>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage === "invalid-quantity" ? "Quantity must be a whole number greater than zero." :
                errorMessage === "quantity-must-be-positive" ? "Quantity must be greater than zero." :
                errorMessage === "invalid-sold-at" ? "Enter a valid sale date/time." :
                decodeURIComponent(errorMessage)}
            </div>
          )}

          <form action={updateSale.bind(null, sale.id)} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Product</label>
              <input
                value={sale.product_name_snapshot}
                readOnly
                className="w-full rounded-xl border border-stone-300 bg-stone-100 px-4 py-3 text-stone-800 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Quantity <span className="text-red-600">*</span>
              </label>
              <input
                name="quantity"
                type="number"
                min="1"
                step="1"
                defaultValue={sale.quantity}
                required
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 shadow-sm outline-none placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Sale date/time <span className="text-red-600">*</span>
              </label>
              <input
                name="sold_at"
                type="datetime-local"
                required
                defaultValue={soldAtValue}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 shadow-sm outline-none placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
              />
            </div>

            <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
              Original sale snapshot: {sale.product_name_snapshot} • Cost {sale.cost_price_snapshot} • Selling {sale.selling_price_snapshot}
            </div>

            <div className="flex gap-3">
              <button type="submit" className="rounded-xl bg-stone-900 px-5 py-3 font-medium text-white hover:bg-stone-800">
                Save Changes
              </button>
              <form action={deleteSale.bind(null, sale.id)}>
                <button type="submit" className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-medium text-red-700 hover:bg-red-100">
                  Delete sale
                </button>
              </form>
              <Link href={`/dashboard/sales/${sale.id}`} className="rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-700 hover:bg-stone-50">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
