import { createClient } from "@/lib/supabase/server";

const money = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 0,
});

export default async function PublicRestaurantMenuPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const supabase = await createClient();
  const { restaurantId } = await params;

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("id", restaurantId)
    .maybeSingle();

  if (restaurantError || !restaurant) {
    return (
      <main className="min-h-screen bg-[#f8f4ee] px-3 py-8">
        <div className="mx-auto w-full max-w-[480px] rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <section className="border-b border-stone-100 px-5 py-5">
            <div className="text-[22px] font-black tracking-tight text-stone-900">Restaurant menu</div>
            <div className="mt-1 text-[11px] font-semibold text-stone-500">Public menu</div>
          </section>

          <section className="px-5 py-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-center">
              <div className="text-sm font-black text-stone-900">Public menu unavailable</div>
              <div className="mt-2 text-[11px] font-medium text-stone-600">
                This restaurant’s public menu is currently blocked by the existing Supabase RLS rules for anonymous restaurant/product reads.
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, category, description, image_url, selling_price, active")
    .eq("restaurant_id", restaurant.id)
    .eq("active", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (productsError) {
    return (
      <main className="min-h-screen bg-[#f8f4ee] px-3 py-8">
        <div className="mx-auto w-full max-w-[480px] rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <section className="border-b border-stone-100 px-5 py-5">
            <div className="text-[22px] font-black tracking-tight text-stone-900">{restaurant.name}</div>
            <div className="mt-1 text-[11px] font-semibold text-stone-500">Public menu</div>
          </section>

          <section className="px-5 py-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-center">
              <div className="text-sm font-black text-stone-900">Public menu unavailable</div>
              <div className="mt-2 text-[11px] font-medium text-stone-600">
                This restaurant’s public menu is currently blocked by the existing Supabase RLS rules for anonymous product reads.
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const activeProducts = products ?? [];
  const categories = Array.from(new Set(activeProducts.map((product) => product.category).filter(Boolean))) as string[];

  return (
    <main className="min-h-screen bg-[#f8f4ee] px-3 py-8">
      <div className="mx-auto w-full max-w-[480px] rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <section className="border-b border-stone-100 px-5 py-5">
          <div className="text-[22px] font-black tracking-tight text-stone-900">{restaurant.name}</div>
          <div className="mt-1 text-[11px] font-semibold text-stone-500">Public menu</div>
        </section>

        <section className="px-5 py-4">
          {activeProducts.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-center">
              <div className="text-sm font-black text-stone-900">Menu coming soon</div>
            </div>
          ) : categories.length === 0 ? (
            <div className="space-y-3">
              {activeProducts.map((product) => (
                <article key={product.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-xl object-cover" />
                    ) : (
                      <div className="h-16 w-16 rounded-xl border border-stone-200 bg-stone-50" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-black text-stone-900">{product.name}</div>
                        <div className="text-sm font-black text-green-700">{money.format(product.selling_price)}</div>
                      </div>
                      {product.category && <div className="mt-1 text-[11px] font-bold text-stone-500">{product.category}</div>}
                      {product.description && <div className="mt-2 text-[11px] font-medium text-stone-600">{product.description}</div>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <section key={category} className="space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wide text-stone-700">{category}</div>
                  <div className="space-y-3">
                    {activeProducts
                      .filter((product) => product.category === category)
                      .map((product) => (
                        <article key={product.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                          <div className="flex items-center gap-3">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-xl object-cover" />
                            ) : (
                              <div className="h-16 w-16 rounded-xl border border-stone-200 bg-stone-50" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-black text-stone-900">{product.name}</div>
                                <div className="text-sm font-black text-green-700">{money.format(product.selling_price)}</div>
                              </div>
                              {product.description && <div className="mt-2 text-[11px] font-medium text-stone-600">{product.description}</div>}
                            </div>
                          </div>
                        </article>
                      ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
