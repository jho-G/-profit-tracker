import { createPublicClient } from "@/lib/supabase/public";
import { DEFAULT_MENU_ITEMS } from "@/lib/menu-data";
import MenuExplorer, { MenuItem } from "./MenuExplorer";

export default async function PublicMenuPage({
  searchParams,
}: {
  searchParams?: Promise<{ restaurantId?: string }>;
}) {
  const supabase = createPublicClient();
  const params = searchParams ? await searchParams : {};

  let query = supabase
    .from("public_menu_items")
    .select(
      "restaurant_id, restaurant_name, product_id, product_name, selling_price, category, description, image_url"
    )
    .order("category", { ascending: true })
    .order("product_name", { ascending: true });

  if (params.restaurantId) {
    query = query.eq("restaurant_id", params.restaurantId);
  }

  let items: MenuItem[] = [];
  try {
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      items = data as MenuItem[];
    } else {
      items = DEFAULT_MENU_ITEMS;
    }
  } catch {
    items = DEFAULT_MENU_ITEMS;
  }

  if (items.length === 0) {
    return <UnavailableMenu />;
  }

  const heroImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr7Q9kL2MkGXz5q_s_Y5sJ3a_iIy39r5htgFYXqAdpC9enCumSX8xjld8&s=10";

  const categoryOrder = [
    "የጾም ቁርስ",
    "የጾም ምሳ",
    "የፍስክ ቁርስ",
    "የፍስክ ምሳ",
    "መጠጦች",
    "ትኩስ ነገሮች",
  ];

  const uniqueCategories = Array.from(
    new Set(
      items
        .map((i) => i.category?.trim())
        .filter((c): c is string => Boolean(c && c.length > 0))
    )
  ).sort((a, b) => {
    const aIdx = categoryOrder.indexOf(a);
    const bIdx = categoryOrder.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6efe5] text-[#3c251b] selection:bg-[#e56b2f] selection:text-white">
      {/* HERO SECTION (Mobile-First Responsive) */}
      <section
        className="relative isolate flex min-h-[460px] w-full items-center justify-center overflow-hidden bg-[#3a2118] sm:min-h-[560px] lg:min-h-[640px]"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark Overlays for Strong Typography Contrast */}
        <div className="absolute inset-0 -z-10 bg-black/45" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(25,12,8,0.65)_0%,rgba(25,12,8,0.30)_35%,rgba(25,12,8,0.70)_70%,rgba(33,18,14,0.98)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-[45%] bg-gradient-to-t from-[#21120e] via-[#21120e]/60 to-transparent" />

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-12 text-center sm:px-8 sm:pb-24 sm:pt-20">
          <div className="mb-4 sm:mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/30 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.04em] text-white/95 shadow-sm backdrop-blur-sm sm:px-5 sm:py-2 sm:text-xs">
              <span>🍲</span>
              <span>ኢትዮጵያዊ ምግቦች</span>
            </span>
          </div>

          <p className="text-xs font-semibold tracking-[0.05em] text-white/90 sm:text-sm">
            እንኳን ደህና መጡ
          </p>

          <h1 className="mx-auto mt-2 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] sm:text-6xl md:text-7xl">
            ወደ ልዩ ሽሮ
          </h1>

          <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-white/90 drop-shadow sm:mt-5 sm:text-base sm:leading-7">
            ጣፋጭ፣ ትኩስ እና በፍቅር የተዘጋጁ የኢትዮጵያ ባህላዊ ምግቦች
          </p>

          {/* Quick Action Buttons for Mobile Users */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
            <a
              href="#menu-explorer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#e87531] px-6 py-3 text-xs font-black text-white shadow-[0_8px_25px_rgba(86,34,12,0.45)] transition active:scale-95 hover:bg-[#f1843b] sm:min-h-[54px] sm:px-8 sm:text-sm"
            >
              <span>የምግብ ማውጫ ይመልከቱ</span>
              <span aria-hidden="true" className="text-lg">↓</span>
            </a>

            <a
              href="tel:0960174018"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/40 bg-black/25 px-5 py-3 text-xs font-black text-white backdrop-blur-sm transition active:scale-95 hover:bg-black/40 sm:min-h-[54px] sm:px-6 sm:text-sm"
            >
              <span>📞</span>
              <span>0960174018</span>
            </a>
          </div>

          {/* Quick Address Summary on Mobile */}
          <p className="mt-5 text-[11px] font-medium text-white/80 sm:text-xs">
            📍 አራት ኪሎ ከቱሪስት ሆቴል ጀርባ ፣ አዲስ ብርሃን የገበያ ማእከል ፩ኛ ፎቅ
          </p>
        </div>
      </section>

      {/* MAIN MENU CONTENT */}
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-8 sm:pb-28 sm:pt-12">
        <div className="mx-auto mb-8 max-w-xl text-center sm:mb-12">
          <p className="text-[11px] font-black tracking-[0.16em] text-[#b65b2a] uppercase">
            Liyu Shiro Menu
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-[#3c251b] sm:text-4xl md:text-5xl">
            የምግብና የመጠጥ ማውጫ
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#e87531]" />
        </div>

        {/* Client-Side Interactive Explorer */}
        <MenuExplorer initialItems={items} categories={uniqueCategories} />
      </section>

      {/* FOOTER & ADDRESS INFO */}
      <section className="mx-4 mb-6 overflow-hidden rounded-[24px] bg-[#4a2b20] sm:mx-8 sm:rounded-[32px]">
        <div className="mx-auto max-w-4xl px-5 py-10 text-center sm:px-8 sm:py-16">
          <span className="rounded-full bg-[#ed9b5b]/20 px-3 py-1 text-[11px] font-black text-[#ed9b5b]">
            ልዩ ሽሮ
          </span>
          <div className="mt-4 text-lg font-black text-[#fff1db] sm:text-2xl">
            <p className="text-xs font-semibold leading-relaxed text-[#ed9b5b] sm:text-sm">
              አድራሻ: አራት ኪሎ ከቱሪስት ሆቴል ጀርባ ፣ አዲስ ብርሃን የገበያ ማእከል ፩ኛ ፎቅ ላይ
            </p>
            <p className="mt-2 text-sm font-black text-white sm:text-base">
              ስልክ: <a href="tel:0960174018" className="underline hover:text-[#ed9b5b]">0960174018</a>
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="tel:0960174018"
              className="inline-flex items-center gap-2 rounded-full bg-[#e87531] px-5 py-2.5 text-xs font-bold text-white transition active:scale-95 hover:bg-[#f1843b]"
            >
              <span>📞</span>
              <span>ደውሉልን</span>
            </a>
            <a
              href="#menu-explorer"
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-[#fff1db] transition active:scale-95 hover:bg-white/20"
            >
              <span>ማውጫውን ይመልከቱ</span>
              <span>↑</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#2d1b16] px-4 py-6 text-center text-xs text-[#c9a895] sm:px-8">
        <div className="font-black uppercase tracking-[0.25em] text-[#f0c08b]">
          ልዩ ሽሮ (Liyu Shiro)
        </div>
        <p className="mt-2 text-[11px]">
          መልካም ምግብ ይሁንልዎ!
        </p>
      </footer>
    </main>
  );
}

function UnavailableMenu() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6efe5] px-4 py-12 text-center text-[#3c251b]">
      <div className="w-full max-w-sm rounded-[24px] border border-[#e5cfb9] bg-[#fffaf4] p-8 shadow-sm">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b65b2a]">
          Liyu Shiro
        </div>
        <h1 className="mt-3 text-2xl font-black">Menu Unavailable</h1>
        <p className="mt-3 text-xs leading-6 text-[#785f50]">
          ምናሌው አሁን አይገኝም። እባክዎ ቆይተው እንደገና ይሞክሩ።
        </p>
      </div>
    </main>
  );
}
