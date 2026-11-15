import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProduct, deleteProduct } from "../../actions";

export default async function EditProductPage({
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
  const { data: product, error } = await supabase
    .from("products")
    .select("id,name,category,cost_price,selling_price,image_url,description,active")
    .eq("id", id)
    .eq("restaurant_id", profile.restaurant_id)
    .maybeSingle();

  if (error || !product) {
    redirect("/dashboard/products");
  }

  const query = searchParams ? await searchParams : {};
  const errorMessage = query.error;

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                Edit Product
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                Update product details.
              </p>
            </div>
            <Link href="/dashboard/products" className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
              Back to products
            </Link>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage === "name-required" ? "Name is required." : errorMessage === "invalid-price" ? "Enter valid numeric prices." : errorMessage === "negative-price" ? "Cost and selling prices must be >= 0." : decodeURIComponent(errorMessage)}
            </div>
          )}

          <form action={updateProduct.bind(null, product.id)} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Product name <span className="text-red-600">*</span>
              </label>
              <input name="name" defaultValue={product.name} required className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Category
              </label>
              <input name="category" defaultValue={product.category || ""} className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Description
              </label>
              <textarea name="description" defaultValue={product.description || ""} rows={4} className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Cost price <span className="text-red-600">*</span>
                </label>
                <input name="cost_price" type="number" min="0" step="0.01" defaultValue={product.cost_price} required className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Selling price <span className="text-red-600">*</span>
                </label>
                <input name="selling_price" type="number" min="0" step="0.01" defaultValue={product.selling_price} required className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Image URL <span className="text-xs font-normal text-stone-400">(አማራጭ / Optional)</span>
              </label>
              <input
                name="image_url"
                defaultValue={product.image_url || ""}
                placeholder="https://... ወይም ባዶ ይተዉት (optional)"
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
              />
            </div>

            <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
              Active status: <span className="font-semibold text-stone-800">{product.active ? "Active" : "Inactive"}</span>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="rounded-xl bg-stone-900 px-5 py-3 font-medium text-white hover:bg-stone-800">
                Save Changes
              </button>
              <Link href="/dashboard/products" className="rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-700 hover:bg-stone-50">
                Cancel
              </Link>
            </div>
          </form>

          <div className="mt-8 border-t border-stone-200 pt-6">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <div>
                <h4 className="text-sm font-bold text-red-900">Delete Product</h4>
                <p className="text-xs text-red-700">Permanently delete this food item from the menu and inventory.</p>
              </div>
              <form action={deleteProduct.bind(null, product.id, "/dashboard/products")} method="POST">
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 active:scale-95"
                >
                  Delete Permanently
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
