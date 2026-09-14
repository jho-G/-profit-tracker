import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addProduct } from "../actions";

export default async function NewProductPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
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

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                Add Product
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                Create a product for your restaurant.
              </p>
            </div>
            <Link href="/dashboard/products" className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
              Back to products
            </Link>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error === "name-required" ? "Name is required." : error === "invalid-price" ? "Enter valid numeric prices." : error === "negative-price" ? "Cost and selling prices must be >= 0." : decodeURIComponent(error)}
            </div>
          )}

          <form action={addProduct} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Product name <span className="text-red-600">*</span>
              </label>
              <input name="name" required className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Category
              </label>
              <input name="category" className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Description
              </label>
              <textarea name="description" rows={4} className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Cost price <span className="text-red-600">*</span>
                </label>
                <input name="cost_price" type="number" min="0" step="0.01" required className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Selling price <span className="text-red-600">*</span>
                </label>
                <input name="selling_price" type="number" min="0" step="0.01" required className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Image URL
              </label>
              <input name="image_url" className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="rounded-xl bg-stone-900 px-5 py-3 font-medium text-white hover:bg-stone-800">
                Create Product
              </button>
              <Link href="/dashboard/products" className="rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-700 hover:bg-stone-50">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
