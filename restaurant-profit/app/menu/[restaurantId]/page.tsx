import { createClient } from "@/lib/supabase/server";

type MenuItem = {
  restaurant_id: string;
  restaurant_name: string;
  product_id: string;
  product_name: string;
  selling_price: number;
  category: string | null;
  description: string | null;
  image_url: string | null;
};

const money = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const drinkWords = ["drink", "beverage", "juice", "coffee", "tea", "water", "መጠጥ"];

export default async function PublicRestaurantMenuPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const supabase = await createClient();
  const { restaurantId } = await params;

  const { data, error } = await supabase
    .from("public_menu_items")
    .select("restaurant_id, restaurant_name, product_id, product_name, selling_price, category, description, image_url")
    .eq("restaurant_id", restaurantId)
    .order("category", { ascending: true })
    .order("product_name", { ascending: true });

  if (error) {
    return <UnavailableMenu />;
  }

  const items = (data ?? []) as MenuItem[];
  const restaurantName = items[0]?.restaurant_name ?? "Restaurant menu";
  const heroImage = items.find((item) => item.image_url)?.image_url ?? null;
  const groups = groupMenuItems(items);
  const categories = groups.map((group) => group.label);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6efe5] text-[#3c251b] selection:bg-[#e56b2f] selection:text-white">
      <section
        className={`relative isolate flex min-h-[620px] items-end overflow-hidden sm:min-h-[680px] ${heroImage ? "bg-[#553126]" : "bg-[#643828]"}`}
        style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}
      >
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(44,22,14,0.04)_18%,rgba(44,22,14,0.32)_52%,rgba(44,22,14,0.94)_100%)]" />
        {!heroImage && (
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_24%,rgba(235,137,69,0.44),transparent_24%),radial-gradient(circle_at_16%_76%,rgba(123,67,41,0.8),transparent_35%)]" />
        )}
        <div className="absolute left-1/2 top-7 flex -translate-x-1/2 items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#f8d8ac] sm:top-10">
          <span className="h-px w-8 bg-[#e98743]/80" />
          Liyu Shiro
          <span className="h-px w-8 bg-[#e98743]/80" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-5 pb-16 text-center sm:px-8 sm:pb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f7c58e]">A taste of home</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.035em] text-[#fffaf2] sm:text-7xl md:text-8xl">
            {restaurantName}
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#f4dfc7] sm:text-base">
            Warm plates, generous flavors, and the simple joy of sharing a good meal.
          </p>
          <a
            href="#menu"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#e87531] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(102,38,12,0.28)] transition hover:bg-[#f1843b] focus:outline-none focus:ring-2 focus:ring-[#ffd2a1] focus:ring-offset-2 focus:ring-offset-[#643828]"
          >
            Explore the menu
            <span aria-hidden="true" className="text-lg leading-none">↓</span>
          </a>
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#f7d6b0]">
          <span>Scroll</span>
          <span className="h-8 w-px bg-[#f7d6b0]/70" />
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-6xl px-5 pb-24 pt-20 sm:px-8 sm:pt-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#b65b2a]">Liyu Shiro</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] text-[#3c251b] sm:text-6xl">Our menu</h2>
          <div className="mx-auto mt-5 h-1 w-14 rounded-full bg-[#e87531]" />
          <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-[#785f50] sm:text-base">
            Made with care, served with warmth. Find your next favorite plate below.
          </p>
        </div>

        {categories.length > 1 && (
          <nav aria-label="Menu categories" className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
            {groups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-full border border-[#d9b99c] bg-[#fbf6ef] px-4 py-2 text-xs font-bold text-[#6b4939] transition hover:border-[#e87531] hover:bg-[#fffaf4] hover:text-[#b64e20] focus:outline-none focus:ring-2 focus:ring-[#e87531]/40"
              >
                {group.label}
              </a>
            ))}
          </nav>
        )}

        {items.length === 0 ? (
          <div className="mx-auto mt-16 max-w-xl rounded-[24px] border border-[#e5cfb9] bg-[#fbf6ef] px-6 py-12 text-center shadow-[0_18px_50px_rgba(91,51,29,0.06)]">
            <div className="text-2xl font-black text-[#3c251b]">Menu coming soon</div>
            <p className="mt-3 text-sm text-[#785f50]">We are preparing something delicious for you.</p>
          </div>
        ) : (
          <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-28">
            {groups.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-8">
                <div className="mb-7 flex items-end justify-between gap-4 border-b border-[#dfc4aa] pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c65d27]">From the kitchen</p>
                    <h3 className="mt-2 text-3xl font-black tracking-[-0.025em] text-[#3c251b] sm:text-4xl">{group.label}</h3>
                  </div>
                  <span className="pb-1 text-xs font-semibold text-[#987765]">{group.items.length} items</span>
                </div>

                <div className={`grid gap-5 sm:gap-7 ${group.isDrinks ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                  {group.items.map((item) => (
                    <MenuCard key={item.product_id} item={item} compact={group.isDrinks} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <section className="mx-5 mb-8 overflow-hidden rounded-[30px] bg-[#4a2b20] sm:mx-8">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center sm:px-10 sm:py-20">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ed9b5b]">Good food, good company</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-[-0.025em] text-[#fff8ee] sm:text-5xl">Come hungry. Leave happy.</h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#e8cbb2]">Visit us and enjoy a meal made for sharing.</p>
          <a href="#menu" className="mt-8 inline-flex rounded-full bg-[#e87531] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#f1843b] focus:outline-none focus:ring-2 focus:ring-[#ffd2a1] focus:ring-offset-2 focus:ring-offset-[#4a2b20]">View the menu</a>
        </div>
      </section>

      <footer className="bg-[#2d1b16] px-5 py-8 text-center text-xs text-[#c9a895] sm:px-8">
        <div className="font-black uppercase tracking-[0.25em] text-[#f0c08b]">Liyu Shiro</div>
        <p className="mt-3">A table worth gathering around.</p>
      </footer>
    </main>
  );
}

function MenuCard({ item, compact = false }: { item: MenuItem; compact?: boolean }) {
  return (
    <article className={`group overflow-hidden rounded-[22px] border border-[#ead6c3] bg-[#fffdf9] shadow-[0_14px_38px_rgba(91,51,29,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(91,51,29,0.14)] ${compact ? "rounded-[18px]" : ""}`}>
      <div className={`relative overflow-hidden bg-[#ead9c7] ${compact ? "aspect-[1.35]" : "aspect-[1.18]"}`}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.product_name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_28%_22%,#f7d8ae,transparent_24%),linear-gradient(135deg,#c47b48,#75402c)] px-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#fff1db]">
            {item.category || "Liyu Shiro"}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#2c1a13]/35 to-transparent" />
      </div>
      <div className={`${compact ? "p-4" : "p-5"}`}>
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-lg font-black leading-tight tracking-[-0.015em] text-[#3c251b]">{item.product_name}</h4>
          <span className="shrink-0 rounded-full bg-[#fff0df] px-2.5 py-1 text-xs font-black text-[#b64e20]">{money.format(item.selling_price)}</span>
        </div>
        {item.description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#806758]">{item.description}</p>}
      </div>
    </article>
  );
}

function groupMenuItems(items: MenuItem[]) {
  const groups = new Map<string, { id: string; label: string; items: MenuItem[]; isDrinks: boolean }>();

  for (const item of items) {
    const rawCategory = item.category?.trim() || "";
    const label = rawCategory || "ምግብ";
    const key = rawCategory.toLowerCase() || "food";
    const isDrinks = drinkWords.some((word) => key.includes(word));
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, { id: `${slugify(label)}-${groups.size}`, label, items: [item], isDrinks });
    }
  }

  return Array.from(groups.values());
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\u1200-\u137f]+/g, "-").replace(/(^-|-$)/g, "") || "menu";
}

function UnavailableMenu() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6efe5] px-5 py-12 text-center text-[#3c251b]">
      <div className="w-full max-w-md rounded-[28px] border border-[#e5cfb9] bg-[#fffaf4] px-6 py-12 shadow-[0_20px_60px_rgba(91,51,29,0.1)]">
        <div className="text-[11px] font-black uppercase tracking-[0.3em] text-[#b65b2a]">Liyu Shiro</div>
        <h1 className="mt-4 text-3xl font-black">Menu unavailable</h1>
        <p className="mt-4 text-sm leading-7 text-[#785f50]">Menu unavailable right now. Please try again.</p>
      </div>
    </main>
  );
}
