"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toggleProductStatus } from "./products/actions";
import LogoutButton from "./LogoutButton";
import ChangePasswordModal from "./ChangePasswordModal";

const money = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 0,
});

type Product = {
  id: string;
  name: string;
  cost_price: number;
  selling_price: number;
  active: boolean;
  category: string | null;
  description: string | null;
  image_url: string | null;
};

type Sale = {
  id: string;
  sold_at: string;
  product_name_snapshot: string;
  quantity: number;
  cost_price_snapshot: number;
  selling_price_snapshot: number;
  profit: number;
  restaurant_id: string;
};

type Restaurant = {
  id: string;
  name: string;
};

type Tab = "sell" | "menu" | "history" | "qr";

interface DashboardClientProps {
  restaurant: Restaurant | null;
  products: Product[];
  todaySales: Sale[];
  recentSales: Sale[];
  restaurantId: string;
  initialAllProfit: number;
  initialTodayProfit: number;
  initialTodayRevenue: number;
}

export type OptimisticSaleLog = {
  productId: string;
  quantity: number;
};

export default function DashboardClient({
  products,
  todaySales,
  recentSales,
  restaurantId,
  initialAllProfit,
  initialTodayProfit,
  initialTodayRevenue,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("sell");
  const [historyFilter, setHistoryFilter] = useState<string>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const [todayProfit, setTodayProfit] = useState(initialTodayProfit);
  const [todayRevenue, setTodayRevenue] = useState(initialTodayRevenue);
  const [allProfit, setAllProfit] = useState(initialAllProfit);
  const [todaySalesState, setTodaySalesState] = useState<Sale[]>(todaySales);
  const [recentSalesState, setRecentSalesState] = useState<Sale[]>(recentSales);
  const [toast, setToast] = useState<{ id: number; message: string; type: "success" | "error" } | null>(null);

  // Dynamic history state (scalable: fetched on-demand per filter)
  const initialTodayMeals = todaySalesState.reduce((sum, s) => sum + Number(s.quantity ?? 0), 0);
  const [queriedHistory, setQueriedHistory] = useState<{
    sales: Sale[];
    profit: number;
    meals: number;
  } | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const activeProducts = products.filter((p) => p.active);
  const inactiveProducts = products.filter((p) => !p.active);

  const isInitialToday = historyFilter === "today" && !customStart && !customEnd;
  const historySales = isInitialToday ? todaySalesState : (queriedHistory?.sales ?? []);
  const historyProfit = isInitialToday ? todayProfit : (queriedHistory?.profit ?? 0);
  const historyMeals = isInitialToday ? initialTodayMeals : (queriedHistory?.meals ?? 0);

  const productGroups = new Map<string, { quantity: number; profit: number }>();
  for (const sale of todaySalesState) {
    const key = String(sale.product_name_snapshot || "Meal");
    const existing = productGroups.get(key) ?? { quantity: 0, profit: 0 };
    existing.quantity += Number(sale.quantity);
    existing.profit += Number(sale.profit ?? 0);
    productGroups.set(key, existing);
  }

  // Fetch history data dynamically when filter is not default today
  useEffect(() => {
    if (historyFilter === "today" && !customStart && !customEnd) {
      return;
    }

    let isCancelled = false;
    const controller = new AbortController();

    async function loadHistory() {
      setHistoryLoading(true);
      try {
        const params = new URLSearchParams({ filter: historyFilter });
        if (customStart) params.set("start", customStart);
        if (customEnd) params.set("end", customEnd);
        const res = await fetch(`/api/sales/history?${params.toString()}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setQueriedHistory({
              sales: data.sales ?? [],
              profit: Number(data.totalProfit ?? 0),
              meals: Number(data.totalMeals ?? 0),
            });
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Failed to fetch sales history:", err);
      } finally {
        if (!isCancelled) setHistoryLoading(false);
      }
    }

    loadHistory();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [historyFilter, customStart, customEnd]);

  // Generate QR code for the single restaurant public menu (/menu)
  useEffect(() => {
    if (activeTab !== "qr" || qrDataUrl) return;

    let isCancelled = false;

    async function generate() {
      setQrLoading(true);
      try {
        const QRCode = await import("qrcode");
        const url = `${window.location.origin}/menu`;
        const dataUrl = await QRCode.toDataURL(url);
        if (!isCancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch {
        console.error("Failed to generate QR code");
      } finally {
        if (!isCancelled) {
          setQrLoading(false);
        }
      }
    }

    generate();

    return () => {
      isCancelled = true;
    };
  }, [activeTab, qrDataUrl]);

  // Instant optimistic sale logging (0ms latency for cashier)
  const handleLogSale = async (product: Product, quantity: number) => {
    if (quantity <= 0) return;

    const itemProfit = (Number(product.selling_price) - Number(product.cost_price)) * quantity;
    const itemRevenue = Number(product.selling_price) * quantity;
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nowIso = new Date().toISOString();

    const tempSale: Sale = {
      id: tempId,
      sold_at: nowIso,
      product_name_snapshot: product.name,
      quantity,
      cost_price_snapshot: Number(product.cost_price),
      selling_price_snapshot: Number(product.selling_price),
      profit: itemProfit,
      restaurant_id: restaurantId,
    };

    // 1. Instant optimistic update
    setTodayProfit((prev) => prev + itemProfit);
    setTodayRevenue((prev) => prev + itemRevenue);
    setAllProfit((prev) => prev + itemProfit);
    setTodaySalesState((prev) => [tempSale, ...prev]);
    setRecentSalesState((prev) => [tempSale, ...prev.slice(0, 9)]);
    setToast({
      id: Date.now(),
      message: `Logged ${quantity} × ${product.name} (+${money.format(itemProfit)} profit)`,
      type: "success",
    });

    // 2. Background persistence
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          soldAt: nowIso,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record sale");
      }

      // Replace temporary ID with confirmed database record
      if (data.sale?.id) {
        setTodaySalesState((prev) =>
          prev.map((s) => (s.id === tempId ? { ...s, id: data.sale.id } : s))
        );
        setRecentSalesState((prev) =>
          prev.map((s) => (s.id === tempId ? { ...s, id: data.sale.id } : s))
        );
      }
    } catch (err: unknown) {
      console.error("Sale logging failed, rolling back:", err);
      // Rollback optimistic update
      setTodayProfit((prev) => prev - itemProfit);
      setTodayRevenue((prev) => prev - itemRevenue);
      setAllProfit((prev) => prev - itemProfit);
      setTodaySalesState((prev) => prev.filter((s) => s.id !== tempId));
      setRecentSalesState((prev) => prev.filter((s) => s.id !== tempId));
      setToast({
        id: Date.now(),
        message: err instanceof Error ? err.message : "Failed to record sale. Reverted.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f4ee] px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-[480px] rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="min-w-0">
            <div className="text-[22px] font-black leading-tight tracking-tight text-stone-900">ልዩ ሽሮ Profit Tracker</div>
            <div className="text-[11px] font-medium text-stone-500">Restaurant management</div>
          </div>
          <div className="flex items-center gap-2">
            <ChangePasswordModal />
            <LogoutButton />
          </div>
        </div>

        {/* Real-time Toast Feedback */}
        {toast && (
          <div className="px-5 pt-3">
            <div
              role="status"
              className={`flex items-center justify-between rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition ${
                toast.type === "success"
                  ? "bg-emerald-700 text-white"
                  : "bg-red-700 text-white"
              }`}
            >
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="ml-2 rounded-md px-1 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <section className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-stone-200 bg-[#fbf7f1] p-3">
              <div className="text-[11px] font-semibold text-stone-500">Today&apos;s profit</div>
              <div className="mt-1 text-[24px] font-black leading-none text-green-700">{money.format(todayProfit)}</div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-[#fbf7f1] p-3">
              <div className="text-[11px] font-semibold text-stone-500">Today&apos;s sales</div>
              <div className="mt-1 text-[24px] font-black leading-none text-stone-900">{money.format(todayRevenue)}</div>
            </div>
          </div>
        </section>

        {/* Tabs - client-side switching (Mobile Optimized) */}
        <section className="px-3 sm:px-5">
          <div className="grid grid-cols-4 gap-1 rounded-2xl bg-stone-100 p-1">
            {([["sell", "Sell", "💰"], ["menu", "Menu", "📋"], ["history", "History", "📊"], ["qr", "QR Menu", "📱"]] as const).map(([key, label, icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 rounded-xl py-2 px-1 text-center text-[11px] sm:text-xs font-black transition touch-manipulation active:scale-95 ${
                  activeTab === key
                    ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <span className="text-sm sm:text-xs">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Tab Content */}
        <section className="px-5 py-4">
          {activeTab === "sell" && (
            <SellTab
              activeProducts={activeProducts}
              productGroups={productGroups}
              recentSales={recentSalesState}
              onLogSale={handleLogSale}
              money={money}
            />
          )}

          {activeTab === "menu" && (
            <MenuTab
              activeProducts={activeProducts}
              inactiveProducts={inactiveProducts}
              money={money}
            />
          )}

          {activeTab === "history" && (
            <HistoryTab
              allProfit={allProfit}
              historyData={historySales}
              historyFilter={historyFilter}
              historyMeals={historyMeals}
              historyProfit={historyProfit}
              historyLoading={historyLoading}
              customStart={customStart}
              customEnd={customEnd}
              setHistoryFilter={setHistoryFilter}
              setCustomStart={setCustomStart}
              setCustomEnd={setCustomEnd}
              money={money}
            />
          )}

          {activeTab === "qr" && (
            <QRTab
              qrDataUrl={qrDataUrl}
              qrLoading={qrLoading}
              restaurantId={restaurantId}
            />
          )}
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   SELL TAB (Mobile-Optimized)
============================================================ */

function SellTab({
  activeProducts,
  productGroups,
  recentSales,
  onLogSale,
  money,
}: {
  activeProducts: Product[];
  productGroups: Map<string, { quantity: number; profit: number }>;
  recentSales: Sale[];
  onLogSale: (product: Product, quantity: number) => Promise<void>;
  money: Intl.NumberFormat;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        activeProducts
          .map((p) => p.category?.trim())
          .filter((c): c is string => Boolean(c && c.length > 0))
      )
    );
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return activeProducts.filter((p) => {
      const matchCat = selectedCat === "all" || p.category === selectedCat;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    });
  }, [activeProducts, selectedCat, searchTerm]);

  return (
    <div className="space-y-4">
      {/* MOBILE SEARCH & CATEGORY SELECTOR */}
      <div className="space-y-2">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
            🔍
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search food to sell (ሽሮ፣ ዱለት፣ ጥብስ...)..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-8 text-xs font-bold text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-2.5 flex items-center text-xs font-bold text-stone-400 hover:text-stone-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Scrollable Category Chips for fast tapping */}
        {categories.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setSelectedCat("all")}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition touch-manipulation active:scale-95 ${
                selectedCat === "all"
                  ? "bg-stone-900 text-white"
                  : "border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
              }`}
            >
              All ({activeProducts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition touch-manipulation active:scale-95 ${
                  selectedCat === cat
                    ? "bg-stone-900 text-white"
                    : "border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PRODUCTS LIST */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center text-xs font-bold text-stone-500">
          No matching products found.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProducts.map((product) => (
            <ProductSaleCard
              key={product.id}
              product={product}
              onLogSale={onLogSale}
              money={money}
            />
          ))}
        </div>
      )}

      {/* TODAY'S BREAKDOWN BY MEAL */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <div className="text-sm font-black text-stone-900">Today by meal</div>
        <div className="mt-3 space-y-2">
          {Array.from(productGroups.entries()).length === 0 ? (
            <div className="text-xs text-stone-500">No meals logged today.</div>
          ) : (
            Array.from(productGroups.entries()).map(([name, group]) => (
              <div key={name} className="flex items-center justify-between text-xs text-stone-700">
                <span>{name} × {group.quantity}</span>
                <span className="font-black text-green-700">+{money.format(group.profit)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RECENT SALES */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-sm font-black text-stone-900">Recent sales</div>
          <Link href="/dashboard/sales" className="text-[11px] font-bold text-stone-600 hover:text-stone-900">View all</Link>
        </div>

        {recentSales.length === 0 ? (
          <div className="text-xs text-stone-500">No sales yet.</div>
        ) : (
          <div className="space-y-2">
            {recentSales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-black text-stone-900">{sale.product_name_snapshot} × {sale.quantity}</div>
                  <div className="text-[10px] font-semibold text-stone-500">{new Date(sale.sold_at).toLocaleString("en-ET")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-green-700">{money.format(Number(sale.profit ?? 0))}</span>
                  <Link href={`/dashboard/sales/${sale.id}/edit`} className="rounded-lg border border-stone-300 px-2 py-1 text-[10px] font-black text-stone-700 hover:bg-white">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductSaleCard({
  product,
  onLogSale,
  money,
}: {
  product: Product;
  onLogSale: (product: Product, quantity: number) => Promise<void>;
  money: Intl.NumberFormat;
}) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || loading) return;
    const qtyToLog = quantity;
    setLoading(true);
    setJustLogged(true);
    setQuantity(1);
    await onLogSale(product, qtyToLog);
    setLoading(false);
    setTimeout(() => setJustLogged(false), 1000);
  };

  return (
    <div
      className={`rounded-2xl border p-3 sm:p-3.5 transition ${
        justLogged
          ? "border-emerald-300 bg-emerald-50/50"
          : "border-stone-200 bg-white shadow-xs"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-black text-stone-900">{product.name}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-stone-500">
            <span className="font-bold text-stone-800">{money.format(product.selling_price)}</span>
            <span>·</span>
            <span className="font-bold text-green-700">+{money.format(product.selling_price - product.cost_price)}</span>
            {product.category && (
              <>
                <span>·</span>
                <span className="text-[10px] text-stone-400">{product.category}</span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-1.5">
          <label className="sr-only" htmlFor={`quantity-${product.id}`}>Quantity</label>
          <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 shadow-xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || loading}
              className="flex h-9 w-8 touch-manipulation items-center justify-center text-sm font-black text-stone-600 hover:text-stone-900 active:bg-stone-200 rounded-l-xl disabled:opacity-25"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-6 text-center text-xs font-black text-stone-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              disabled={loading}
              className="flex h-9 w-8 touch-manipulation items-center justify-center text-sm font-black text-stone-600 hover:text-stone-900 active:bg-stone-200 rounded-r-xl"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`flex h-9 min-w-[70px] touch-manipulation items-center justify-center rounded-xl px-3 text-xs font-black text-white shadow-xs transition active:scale-95 ${
              justLogged
                ? "bg-emerald-600"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {justLogged ? "✓ Logged" : "+ Log"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   MENU TAB (Mobile-Optimized)
============================================================ */

function MenuTab({
  activeProducts,
  inactiveProducts,
  money,
}: {
  activeProducts: Product[];
  inactiveProducts: Product[];
  money: Intl.NumberFormat;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredActive = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return activeProducts;
    return activeProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [activeProducts, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-stone-900">
          Menu ({activeProducts.length} active)
        </h3>
        <Link
          href="/dashboard/products/new"
          className="rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-stone-800 touch-manipulation active:scale-95"
        >
          + Add Product
        </Link>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
          🔍
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter products..."
          className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-8 text-xs font-bold text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-2.5 flex items-center text-xs font-bold text-stone-400 hover:text-stone-700"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {filteredActive.map((product) => (
          <div key={product.id} className="rounded-2xl border border-stone-200 bg-white p-3 sm:p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="min-w-0">
                <div className="text-sm font-black text-stone-900">{product.name}</div>
                <div className="mt-0.5 flex flex-wrap gap-1.5 text-[11px] font-semibold text-stone-500">
                  <span>cost {money.format(product.cost_price)}</span>
                  <span>·</span>
                  <span>sell {money.format(product.selling_price)}</span>
                  <span>·</span>
                  <span className="font-bold text-green-700">+{money.format(product.selling_price - product.cost_price)}</span>
                  {product.category && (
                    <>
                      <span>·</span>
                      <span className="text-[10px] text-stone-400">{product.category}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <Link
                  href={`/dashboard/products/${product.id}`}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[11px] font-bold text-stone-700 transition hover:bg-stone-100 touch-manipulation"
                >
                  History
                </Link>
                <Link
                  href={`/dashboard/products/${product.id}/edit`}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[11px] font-bold text-stone-700 transition hover:bg-stone-100 touch-manipulation"
                >
                  Edit
                </Link>
                <form action={toggleProductStatus.bind(null, product.id, false)} method="POST">
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 transition hover:bg-amber-100 touch-manipulation"
                  >
                    Deactivate
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {inactiveProducts.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <div className="text-sm font-black text-stone-900">Inactive products ({inactiveProducts.length})</div>
          <div className="mt-3 space-y-2.5">
            {inactiveProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3">
                <div>
                  <div className="text-sm font-black text-stone-900">{product.name}</div>
                  <div className="text-[11px] font-semibold text-stone-500">inactive</div>
                </div>
                <form action={toggleProductStatus.bind(null, product.id, true)} method="POST">
                  <button
                    type="submit"
                    className="rounded-xl bg-green-700 px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-green-800 touch-manipulation active:scale-95"
                  >
                    Reactivate
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   HISTORY TAB - Scalable Dynamic Filtering & Server Aggregation
============================================================ */

function HistoryTab({
  allProfit,
  historyData,
  historyFilter,
  historyMeals,
  historyProfit,
  historyLoading,
  customStart,
  customEnd,
  setHistoryFilter,
  setCustomStart,
  setCustomEnd,
  money,
}: {
  allProfit: number;
  historyData: Sale[];
  historyFilter: string;
  historyMeals: number;
  historyProfit: number;
  historyLoading: boolean;
  customStart: string;
  customEnd: string;
  setHistoryFilter: (f: string) => void;
  setCustomStart: (s: string) => void;
  setCustomEnd: (s: string) => void;
  money: Intl.NumberFormat;
}) {
  const exportUrl = `/api/sales/export?filter=${encodeURIComponent(historyFilter)}${customStart ? `&start=${encodeURIComponent(customStart)}` : ""}${customEnd ? `&end=${encodeURIComponent(customEnd)}` : ""}`;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-black text-stone-900">All-time profit</div>
            <div className="mt-1 text-[28px] font-black text-green-700">{money.format(allProfit)}</div>
          </div>
          <a href={exportUrl} className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-white">Export as CSV</a>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["7d", "Last 7 days"],
            ["all", "All time"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setHistoryFilter(value)}
              className={`rounded-full px-3 py-1 text-[11px] font-black transition ${historyFilter === value
                ? "bg-stone-900 text-white"
                : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-stone-500">Custom date</span>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="start-date">Start date</label>
            <input
              id="start-date"
              type="date"
              value={customStart}
              onChange={(e) => {
                setCustomStart(e.target.value);
                if (e.target.value || customEnd) setHistoryFilter("custom");
              }}
              aria-label="Start date"
              className="rounded-xl border border-stone-300 px-2 py-2 text-xs"
            />
            <label className="sr-only" htmlFor="end-date">End date</label>
            <input
              id="end-date"
              type="date"
              value={customEnd}
              onChange={(e) => {
                setCustomEnd(e.target.value);
                if (customStart || e.target.value) setHistoryFilter("custom");
              }}
              aria-label="End date"
              className="rounded-xl border border-stone-300 px-2 py-2 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-black text-stone-900">
            {historyLoading ? "Calculating..." : `${historyMeals} meals sold`}
          </div>
          <div className="text-sm font-black text-green-700">
            {historyLoading ? "..." : `${money.format(historyProfit)} profit`}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {historyLoading ? (
          <div className="rounded-2xl border border-stone-200 p-6 text-center text-xs text-stone-500">
            Loading sales history...
          </div>
        ) : historyData.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 p-4 text-sm text-stone-500">No sales in this history view.</div>
        ) : (
          historyData.map((sale) => (
            <div key={sale.id} className="rounded-2xl border border-stone-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-stone-900">{sale.product_name_snapshot} × {sale.quantity}</div>
                  <div className="text-[11px] font-semibold text-stone-500">{new Date(sale.sold_at).toLocaleString("en-ET")}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-green-700">+{money.format(Number(sale.profit))}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ============================================================
   QR TAB - Single Restaurant Public Menu URL
============================================================ */

function QRTab({
  qrDataUrl,
  qrLoading,
}: {
  qrDataUrl: string | null;
  qrLoading: boolean;
  restaurantId: string;
}) {
  const publicMenuUrl = typeof window !== "undefined"
    ? `${window.location.origin}/menu`
    : "";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <div className="text-sm font-black text-stone-900">QR Menu</div>
        <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex flex-col items-center gap-3">
            {qrLoading ? (
              <div className="h-40 w-40 rounded-xl border border-stone-200 bg-stone-100 flex items-center justify-center">
                <div className="text-xs text-stone-500">Generating...</div>
              </div>
            ) : qrDataUrl ? (
              <img src={qrDataUrl} alt="Public menu QR code" className="h-40 w-40 rounded-xl border border-stone-200 bg-white p-2" />
            ) : (
              <div className="h-40 w-40 rounded-xl border border-stone-200 bg-stone-100 flex items-center justify-center">
                <div className="text-xs text-stone-500">Failed to generate</div>
              </div>
            )}
            <div className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="text-[11px] font-black uppercase text-stone-500">Public menu URL</div>
              <a href={publicMenuUrl} className="mt-1 block break-all text-[11px] font-semibold text-stone-700 hover:text-stone-900">{publicMenuUrl}</a>
            </div>
            <div className="flex gap-2">
              {qrDataUrl && (
                <a href={qrDataUrl} download="liyu-shiro-menu-qr.png" className="rounded-xl bg-stone-900 px-4 py-2 text-[11px] font-black text-white transition hover:bg-stone-800">Download QR</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
