import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toggleProductStatus } from "./actions";

const money = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 2,
});

function profit(product: {
  cost_price: number;
  selling_price: number;
}) {
  return product.selling_price - product.cost_price;
}

export default async function ProductsPage() {
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

  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id,name,category,cost_price,selling_price,active,image_url,description")
    .eq("restaurant_id", profile.restaurant_id)
    .order("name", { ascending: true });

  if (productError) {
    return (
      <main className="min-h-screen bg-stone-50 px-5 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
            <h1 className="text-2xl font-bold text-stone-900">Products</h1>
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to load products: {productError.message}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const activeProducts = (products ?? []).filter((product) => product.active);
  const inactiveProducts = (products ?? []).filter((product) => !product.active);

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                Liyu Shiro Products
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                Product management
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/products/new"
                className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
              >
                Add Product
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Dashboard
              </Link>
            </div>
          </div>

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">
                Active Products
              </h2>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                {activeProducts.length} active
              </span>
            </div>

            {activeProducts.length === 0 ? (
              <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-500">
                No active products yet.
              </div>
            ) : (
              <div className="space-y-3">
                {activeProducts.map((product) => (
                  <div key={product.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
                    <div className="min-w-[180px]">
                      <p className="font-semibold text-stone-900">{product.name}</p>
                      <p className="text-xs text-stone-500">{product.category || "Uncategorized"}</p>
                    </div>
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Cost:</span> {money.format(product.cost_price)}
                    </div>
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Selling:</span> {money.format(product.selling_price)}
                    </div>
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Profit/unit:</span>{" "}
                      <span className={profit(product) < 0 ? "text-red-700" : "text-green-700"}>
                        {money.format(profit(product))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-white"
                      >
                        Detail
                      </Link>
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-white"
                      >
                        Edit
                      </Link>
                      <form action={toggleProductStatus.bind(null, product.id, false)} method="POST">
                        <button type="submit" className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700">
                          Deactivate
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">
                Inactive Products
              </h2>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                {inactiveProducts.length} inactive
              </span>
            </div>

            {inactiveProducts.length === 0 ? (
              <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-500">
                No inactive products.
              </div>
            ) : (
              <div className="space-y-3">
                {inactiveProducts.map((product) => (
                  <div key={product.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
                    <div className="min-w-[180px]">
                      <p className="font-semibold text-stone-900">{product.name}</p>
                      <p className="text-xs text-stone-500">{product.category || "Uncategorized"}</p>
                    </div>
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Cost:</span> {money.format(product.cost_price)}
                    </div>
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Selling:</span> {money.format(product.selling_price)}
                    </div>
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Profit/unit:</span>{" "}
                      <span className={profit(product) < 0 ? "text-red-700" : "text-green-700"}>
                        {money.format(profit(product))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-white"
                      >
                        Detail
                      </Link>
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-white"
                      >
                        Edit
                      </Link>
                      <form action={toggleProductStatus.bind(null, product.id, true)} method="POST">
                        <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                          Reactivate
                        </button>
                      </form>
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
