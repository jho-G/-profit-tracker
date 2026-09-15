import { createPublicClient } from "@/lib/supabase/public";

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

const drinkWords = [
  "drink",
  "beverage",
  "juice",
  "coffee",
  "tea",
  "water",
  "መጠጥ",
];

export default async function PublicRestaurantMenuPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const supabase = createPublicClient();
  const { restaurantId } = await params;

  const { data, error } = await supabase
    .from("public_menu_items")
    .select(
      "restaurant_id, restaurant_name, product_id, product_name, selling_price, category, description, image_url"
    )
    .eq("restaurant_id", restaurantId)
    .order("category", { ascending: true })
    .order("product_name", { ascending: true });

  if (error) {
    return <UnavailableMenu />;
  }

  const items = (data ?? []) as MenuItem[];
  const restaurantName = items[0]?.restaurant_name ?? "Restaurant menu";

  const heroImage =
    items.find((item) => item.image_url)?.image_url ?? null;

  const groups = groupMenuItems(items);
  const categories = groups.map((group) => group.label);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6efe5] text-[#3c251b] selection:bg-[#e56b2f] selection:text-white">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section
        className="relative isolate flex min-h-[720px] w-full items-center justify-center overflow-hidden bg-[#3a2118] sm:min-h-[760px] lg:min-h-[800px]"
        style={
          heroImage
            ? {
                backgroundImage: `url(${heroImage})`,
                backgroundPosition: "center center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }
            : undefined
        }
      >
        {/* Fallback background */}
        {!heroImage && (
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_20%,rgba(235,137,69,0.42),transparent_28%),linear-gradient(145deg,#75402c,#2d1811)]" />
        )}

        {/* Background tint */}
        <div className="absolute inset-0 -z-10 bg-[#2b1811]/20" />

        {/* Dark cinematic gradient */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(31,16,11,0.18)_0%,rgba(31,16,11,0.10)_30%,rgba(31,16,11,0.30)_58%,rgba(31,16,11,0.94)_100%)]" />

        {/* Extra bottom darkness for screenshot-style fade */}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-[45%] bg-gradient-to-t from-[#21120e]/75 via-[#21120e]/25 to-transparent" />

        {/* =====================================================
            HERO CONTENT
        ====================================================== */}
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 pb-28 pt-24 text-center sm:px-8 sm:pb-32">
          {/* Top badge */}
          <div className="mb-7">
            <div className="rounded-full border border-white/30 bg-black/20 px-5 py-2 text-[11px] font-semibold tracking-[0.04em] text-white/95 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:px-6 sm:py-2.5 sm:text-xs">
              ኢትዮጵያዊ ምግቦች
            </div>
          </div>

          {/* Eyebrow */}
          <p className="text-sm font-medium tracking-[0.04em] text-white/90 sm:text-base">
            እንኳን ደህና መጡ
          </p>

          {/* Restaurant name */}
          <h1 className="mx-auto mt-5 max-w-4xl text-6xl font-black leading-[0.95] tracking-[-0.045em] text-white drop-shadow-[0_5px_24px_rgba(0,0,0,0.35)] sm:mt-6 sm:text-7xl md:text-8xl lg:text-[7rem]">
            ወደ ልዩ ሽሮ
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] sm:mt-7 sm:text-base">
            ጣፋጭ፣ ትኩስ እና በፍቅር የተዘጋጁ የኢትዮጵያ ምግቦች
          </p>

          {/* CTA */}
          <a
            href="#menu"
            className="mt-9 inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full bg-[#e87531] px-8 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(86,34,12,0.42)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f1843b] hover:shadow-[0_18px_42px_rgba(86,34,12,0.5)] focus:outline-none focus:ring-2 focus:ring-[#ffd2a1] focus:ring-offset-2 focus:ring-offset-[#3a2118] sm:min-h-[60px] sm:px-10 sm:text-base"
          >
            ማውጫውን ይመልከቱ

            <span
              aria-hidden="true"
              className="text-2xl font-normal leading-none"
            >
              ↓
            </span>
          </a>
        </div>

        {/* =====================================================
            SCROLL INDICATOR
        ====================================================== */}
        <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-center">
          <span
            aria-hidden="true"
            className="h-10 w-px bg-white/65 sm:h-12"
          />

          <span className="whitespace-nowrap text-[9px] font-medium tracking-[0.08em] text-white/85 sm:text-[10px]">
            ወደ ታች ይሂዱ
          </span>
        </div>
      </section>

      {/* =========================================================
          MENU
      ========================================================== */}
      <section
        id="menu"
        className="mx-auto max-w-6xl px-5 pb-24 pt-20 sm:px-8 sm:pt-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-black tracking-[0.16em] text-[#b65b2a]">
            ልዩ ሽሮ
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] text-[#3c251b] sm:text-6xl">
            የምግብ ማውጫ
          </h2>

          <div className="mx-auto mt-5 h-1 w-14 rounded-full bg-[#e87531]" />

          
        </div>

        {/* Category navigation */}
        {categories.length > 1 && (
          <nav
            aria-label="የምግብ ምድቦች"
            className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2"
          >
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

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="mx-auto mt-16 max-w-xl rounded-[24px] border border-[#e5cfb9] bg-[#fbf6ef] px-6 py-12 text-center shadow-[0_18px_50px_rgba(91,51,29,0.06)]">
            <div className="text-2xl font-black text-[#3c251b]">
              ምግብ አይነቶች
            </div>

            <p className="mt-3 text-sm text-[#785f50]">
              ጣፋጭ ምግቦችን እናዘጋጃለን
            </p>
          </div>
        ) : (
          <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-28">
            {groups.map((group) => (
              <section
                key={group.id}
                id={group.id}
                className="scroll-mt-8"
              >
                {/* Category heading */}
                <div className="mb-7 flex items-end justify-between gap-4 border-b border-[#dfc4aa] pb-4">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.16em] text-[#c65d27]">
                      ከኩሽናችን
                    </p>

                    <h3 className="mt-2 text-3xl font-black tracking-[-0.025em] text-[#3c251b] sm:text-4xl">
                      {group.label}
                    </h3>
                  </div>

                  <span className="pb-1 text-xs font-semibold text-[#987765]">
                    {group.items.length} ምግቦች
                  </span>
                </div>

                {/* Product grid */}
                <div
                  className={`grid gap-5 sm:gap-7 ${
                    group.isDrinks
                      ? "sm:grid-cols-2 lg:grid-cols-4"
                      : "sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {group.items.map((item) => (
                    <MenuCard
                      key={item.product_id}
                      item={item}
                      compact={group.isDrinks}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================
          BOTTOM CTA
      ========================================================== */}
      <section className="mx-5 mb-8 overflow-hidden rounded-[30px] bg-[#4a2b20] sm:mx-8">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center sm:px-10 sm:py-20">
         <h2  className="text-2xl font-black tracking-[-0.02em] text-[#fff1db] sm:text-3xl">
          <p className="text-[10px] font-black tracking-[0.16em] text-[#ed9b5b]">
            ኣድራሻ: ኣራት ኪሎ ከቱሪስት ሆቴል ጀርባ ፣ አዲስ ብርሃን የገብያ ማእከል ፩ኛ ፎቅ ላይ
          </p>

          <p className="text-[10px] font-black tracking-[0.16em] text-[#ed9b5b]">
            ስልክ: 0960174018
          </p>
        </h2>  
          


          <a
            href="#menu"
            className="mt-8 inline-flex rounded-full bg-[#e87531] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#f1843b] focus:outline-none focus:ring-2 focus:ring-[#ffd2a1] focus:ring-offset-2 focus:ring-offset-[#4a2b20]"
          >
            ማውጫውን ይመልከቱ
          </a>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="bg-[#2d1b16] px-5 py-8 text-center text-xs text-[#c9a895] sm:px-8">
        <div className="font-black uppercase tracking-[0.25em] text-[#f0c08b]">
          Liyu Shiro
        </div>

        <p className="mt-3">
          መልካም ምግብ
        </p>
      </footer>
    </main>
  );
}

/* ===============================================================
   MENU CARD
================================================================ */

function MenuCard({
  item,
  compact = false,
}: {
  item: MenuItem;
  compact?: boolean;
}) {
  return (
    <article
      className={`group overflow-hidden rounded-[22px] border border-[#ead6c3] bg-[#fffdf9] shadow-[0_14px_38px_rgba(91,51,29,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(91,51,29,0.14)] ${
        compact ? "rounded-[18px]" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-[#ead9c7] ${
          compact ? "aspect-[1.35]" : "aspect-[1.18]"
        }`}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.product_name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_28%_22%,#f7d8ae,transparent_24%),linear-gradient(135deg,#c47b48,#75402c)] px-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#fff1db]">
            {item.category || "Liyu Shiro"}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#2c1a13]/35 to-transparent" />
      </div>

      <div className={`${compact ? "p-4" : "p-5"}`}>
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-lg font-black leading-tight tracking-[-0.015em] text-[#3c251b]">
            {item.product_name}
          </h4>

          <span className="shrink-0 rounded-full bg-[#fff0df] px-2.5 py-1 text-xs font-black text-[#b64e20]">
            {money.format(item.selling_price)}
          </span>
        </div>

        {item.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#806758]">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}

/* ===============================================================
   GROUP MENU ITEMS
================================================================ */

function groupMenuItems(items: MenuItem[]) {
  const groups = new Map<
    string,
    {
      id: string;
      label: string;
      items: MenuItem[];
      isDrinks: boolean;
    }
  >();

  for (const item of items) {
    const rawCategory = item.category?.trim() || "";
    const label = rawCategory || "ምግብ";
    const key = rawCategory.toLowerCase() || "food";
    const isDrinks = drinkWords.some((word) => key.includes(word));

    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, {
        id: `${slugify(label)}-${groups.size}`,
        label,
        items: [item],
        isDrinks,
      });
    }
  }

  return Array.from(groups.values());
}

/* ===============================================================
   SLUGIFY
================================================================ */

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9\u1200-\u137f]+/g, "-")
      .replace(/(^-|-$)/g, "") || "menu"
  );
}

/* ===============================================================
   UNAVAILABLE MENU
================================================================ */

function UnavailableMenu() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6efe5] px-5 py-12 text-center text-[#3c251b]">
      <div className="w-full max-w-md rounded-[28px] border border-[#e5cfb9] bg-[#fffaf4] px-6 py-12 shadow-[0_20px_60px_rgba(91,51,29,0.1)]">
        <div className="text-[11px] font-black uppercase tracking-[0.3em] text-[#b65b2a]">
          Liyu Shiro
        </div>

        <h1 className="mt-4 text-3xl font-black">
          Menu unavailable
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#785f50]">
          ምናሌው አሁን አይገኝም። እባክዎ ቆይተው እንደገና ይሞክሩ።
        </p>
      </div>
    </main>
  );
}