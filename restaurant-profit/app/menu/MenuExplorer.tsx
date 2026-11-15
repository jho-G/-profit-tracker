"use client";

import { useState, useMemo, useEffect } from "react";

export type MenuItem = {
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

const CATEGORY_ICONS: Record<string, string> = {
  "የጾም ቁርስ": "🥗",
  "የጾም ምሳ": "🍲",
  "የፍስክ ቁርስ": "🥩",
  "የፍስክ ምሳ": "🍖",
  "መጠጦች": "🥤",
  "ትኩስ ነገሮች": "☕",
};

interface MenuExplorerProps {
  initialItems: MenuItem[];
  categories: string[];
}

export default function MenuExplorer({ initialItems, categories }: MenuExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return initialItems.filter((item) => {
      const matchCategory =
        selectedCategory === "all" ||
        (item.category && item.category.trim() === selectedCategory);
      if (!matchCategory) return false;

      if (!query) return true;

      const nameMatch = item.product_name.toLowerCase().includes(query);
      const descMatch = item.description?.toLowerCase().includes(query);
      const catMatch = item.category?.toLowerCase().includes(query);

      return nameMatch || descMatch || catMatch;
    });
  }, [initialItems, selectedCategory, searchQuery]);

  // Group filtered items by category if "all" is selected, or single section if specific category selected
  const groupedSections = useMemo(() => {
    const map = new Map<string, MenuItem[]>();

    for (const item of filteredItems) {
      const cat = item.category?.trim() || "ሌሎች";
      const existing = map.get(cat) ?? [];
      existing.push(item);
      map.set(cat, existing);
    }

    const order = [
      "የጾም ቁርስ",
      "የጾም ምሳ",
      "የፍስክ ቁርስ",
      "የፍስክ ምሳ",
      "መጠጦች",
      "ትኩስ ነገሮች",
    ];

    return Array.from(map.entries())
      .sort(([a], [b]) => {
        const aIdx = order.indexOf(a);
        const bIdx = order.indexOf(b);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.localeCompare(b);
      })
      .map(([category, items]) => ({
        category,
        items,
        isDrinks: category === "መጠጦች" || category === "ትኩስ ነገሮች",
      }));
  }, [filteredItems]);

  return (
    <div id="menu-explorer" className="scroll-mt-4">
      {/* STICKY SEARCH & CATEGORY BAR (Mobile-Optimized) */}
      <div className="sticky top-0 z-30 -mx-5 border-b border-[#e2ccb8] bg-[#f6efe5]/95 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="mx-auto max-w-4xl space-y-2.5">
          {/* SEARCH BAR */}
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-base text-[#967764]">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ምግብ ወይም መጠጥ ይፈልጉ... (ሽሮ፣ ዱለት፣ ጥብስ፣ ቡና...)"
              className="w-full rounded-full border border-[#d9ba9d] bg-[#fffcf7] py-2.5 pl-10 pr-9 text-xs font-bold text-[#3c251b] placeholder:text-[#a08573] shadow-sm transition focus:border-[#e87531] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e87531]/30 sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="ፍለጋ አጽዳ"
                className="absolute inset-y-0 right-3 flex items-center text-xs font-bold text-[#987765] hover:text-[#3c251b]"
              >
                ✕
              </button>
            )}
          </div>

          {/* HORIZONTAL SCROLLABLE CATEGORY PILLS */}
          <nav
            aria-label="የምግብ ምድቦች"
            className="flex gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black transition active:scale-95 ${
                selectedCategory === "all"
                  ? "bg-[#e87531] text-white shadow-md shadow-[#e87531]/30"
                  : "border border-[#d9ba9d] bg-[#fffaf3] text-[#6b4939] hover:bg-white"
              }`}
            >
              🌟 ሁሉም ({initialItems.length})
            </button>
            {categories.map((cat) => {
              const icon = CATEGORY_ICONS[cat] || "🍽️";
              const count = initialItems.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black transition active:scale-95 ${
                    selectedCategory === cat
                      ? "bg-[#e87531] text-white shadow-md shadow-[#e87531]/30"
                      : "border border-[#d9ba9d] bg-[#fffaf3] text-[#6b4939] hover:bg-white"
                  }`}
                >
                  {icon} {cat} ({count})
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* SEARCH OR FILTER RESULTS STATS */}
      {(searchQuery || selectedCategory !== "all") && (
        <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#7d5f4e]">
          <span>
            {filteredItems.length} ምግቦች ተገኝተዋል{" "}
            {selectedCategory !== "all" ? `በ${selectedCategory}` : ""}
          </span>
          {(searchQuery || selectedCategory !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-[#c65826] underline hover:text-[#9e3f16]"
            >
              ሁሉንም አሳይ
            </button>
          )}
        </div>
      )}

      {/* ITEMS LISTING */}
      {filteredItems.length === 0 ? (
        <div className="mx-auto my-14 max-w-sm rounded-[24px] border border-[#e5cfb9] bg-[#fffaf4] p-8 text-center shadow-sm">
          <div className="text-3xl">🔍</div>
          <h4 className="mt-3 text-base font-black text-[#3c251b]">ምንም ምግብ አልተገኘም</h4>
          <p className="mt-1.5 text-xs text-[#806758]">
            የተለየ ስም በመጻፍ እንደገና ይሞክሩ።
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-4 inline-flex rounded-full bg-[#e87531] px-5 py-2 text-xs font-black text-white hover:bg-[#d66523]"
          >
            ሁሉንም ምግቦች አሳይ
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-12 sm:mt-12 sm:space-y-16">
          {groupedSections.map((section) => (
            <section key={section.category} className="scroll-mt-28">
              {/* Category Header */}
              <div className="mb-4 flex items-center justify-between border-b border-[#dfc4aa] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {CATEGORY_ICONS[section.category] || "🍽️"}
                  </span>
                  <h3 className="text-xl font-black tracking-tight text-[#3c251b] sm:text-2xl">
                    {section.category}
                  </h3>
                </div>
                <span className="rounded-full bg-[#faefe3] px-2.5 py-0.5 text-[11px] font-bold text-[#a05b34]">
                  {section.items.length}
                </span>
              </div>

              {/* Mobile-Friendly Grid: 1 col on small phones, 2 col on tablet, 3 on desktop */}
              <div
                className={`grid gap-3 sm:gap-5 ${
                  section.isDrinks
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {section.items.map((item) => (
                  <article
                    key={item.product_id}
                    className="flex flex-col justify-between rounded-[20px] border border-[#ecd9c6] bg-[#fffdf9] p-4 shadow-[0_4px_16px_rgba(91,51,29,0.04)] transition duration-200 active:scale-[0.99] hover:border-[#dfba9a] hover:shadow-[0_8px_24px_rgba(91,51,29,0.08)]"
                  >
                    <div>
                      {item.image_url && (
                        <div className="relative mb-3 aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#faefe3]">
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-base font-black leading-snug text-[#3c251b] sm:text-lg">
                          {item.product_name}
                        </h4>
                        <span className="shrink-0 rounded-full bg-[#fff0df] px-3 py-1 text-xs font-black text-[#b64e20] shadow-xs">
                          {money.format(item.selling_price)}
                        </span>
                      </div>

                      {item.description && (
                        <p className="mt-2 text-xs leading-5 text-[#7e6556] line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#f3e5d7] pt-2 text-[10px] font-bold text-[#a68673]">
                      <span>{item.category}</span>
                      <span className="text-[#c65d27] font-semibold">ልዩ ሽሮ</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* FLOATING ACTION BAR FOR MOBILE */}
      <div className="fixed bottom-4 inset-x-4 z-40 mx-auto flex max-w-sm items-center justify-between gap-2 rounded-full border border-white/40 bg-[#3a2118]/90 p-2 shadow-2xl backdrop-blur-md sm:hidden">
        <a
          href="tel:0960174018"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#e87531] py-2.5 px-4 text-xs font-black text-white shadow-md active:bg-[#f1843b]"
        >
          <span>📞</span>
          <span>ደውሉ 0960174018</span>
        </a>

        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="ወደ ላይ ሂድ"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-black text-white hover:bg-white/30 active:scale-95"
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
}
