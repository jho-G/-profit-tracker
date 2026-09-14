import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const money = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 2,
});

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

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

  const { data: product, error } = await supabase
    .from("products")
    .select("id,name,category,cost_price,selling_price,active,image_url,description,restaurant_id")
    .eq("id", id)
    .eq("restaurant_id", profile.restaurant_id)
    .maybeSingle();

  if (error || !product) {
    redirect("/dashboard/products");
  }

  const profit = product.selling_price - product.cost_price;

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">{product.name}</h1>
              <p className="mt-1 text-sm text-stone-500">{product.category || "Uncategorized"}</p>
            </div>
            <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
              {product.active ? "Active" : "Inactive"}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-xl bg-stone-50 px-4 py-4">
              <span className="text-sm font-medium text-stone-500">Cost price:</span>
              <div className="mt-1 text-lg font-semibold text-stone-900">{money.format(product.cost_price)}</div>
            </div>

            <div className="rounded-xl bg-stone-50 px-4 py-4">
              <span className="text-sm font-medium text-stone-500">Selling price:</span>
              <div className="mt-1 text-lg font-semibold text-stone-900">{money.format(product.selling_price)}</div>
            </div>

            <div className="rounded-xl bg-stone-50 px-4 py-4">
              <span className="text-sm font-medium text-stone-500">Profit per unit:</span>
              <div className={`mt-1 text-lg font-semibold ${profit < 0 ? "text-red-700" : "text-green-700"}`}>{money.format(profit)}</div>
            </div>

            {product.description && (
              <div className="rounded-xl bg-stone-50 px-4 py-4">
                <span className="text-sm font-medium text-stone-500">Description:</span>
                <p className="mt-2 text-sm text-stone-700">{product.description}</p>
              </div>
            )}

            {product.image_url && (
              <div className="rounded-xl bg-stone-50 px-4 py-4">
                <span className="text-sm font-medium text-stone-500">Image URL:</span>
                <p className="mt-2 break-all text-sm text-stone-700">{product.image_url}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Link href={`/dashboard/products/${product.id}/edit`} className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
                Edit Product
              </Link>
              <Link href="/dashboard/products" className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
