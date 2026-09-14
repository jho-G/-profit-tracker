import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSale } from "../actions";

export default async function NewSalePage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
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

  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id, name")
    .eq("restaurant_id", profile.restaurant_id)
    .eq("active", true)
    .order("name", { ascending: true });

  if (productError) {
    return (
      <main className="min-h-screen bg-stone-50 px-5 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Record Sale</h1>
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to load products: {productError.message}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const current = new Date();
  const soldAtValue = new Date(current.getTime() - current.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">Record Sale</h1>
              <p className="mt-1 text-sm text-stone-500">Create a sale snapshot from the selected product.</p>
            </div>
            <Link href="/dashboard/sales" className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
              Back to sales
            </Link>
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

          <form action={createSale} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Product <span className="text-red-600">*</span>
              </label>
              <select name="product_id" required className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10">
                <option value="">Select active product</option>
                {(products ?? []).map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Quantity <span className="text-red-600">*</span>
              </label>
              <input name="quantity" type="number" min="1" step="1" required className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Sale date/time <span className="text-red-600">*</span>
              </label>
              <input name="sold_at" type="datetime-local" required defaultValue={soldAtValue} className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="rounded-xl bg-stone-900 px-5 py-3 font-medium text-white hover:bg-stone-800">
                Record Sale
              </button>
              <Link href="/dashboard/sales" className="rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-700 hover:bg-stone-50">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
