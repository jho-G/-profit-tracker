"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createSale } from "./sales/actions";
import { toggleProductStatus } from "./products/actions";
import LogoutButton from "./LogoutButton";

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
  sales: Sale[];
  restaurantId: string;
}

export default function DashboardClient({
  restaurant,
  products,
  sales,
  restaurantId,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("sell");
  const [historyFilter, setHistoryFilter] = useState<string>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const activeProducts = products.filter((p) => p.active);
  const inactiveProducts = products.filter((p) => !p.active);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
  const todaySales = sales.filter((sale) => sale.sold_at >= todayStart && sale.sold_at <= todayEnd);

  const todayProfit = todaySales.reduce((sum, sale) => sum + Number(sale.profit ?? 0), 0);
  const todayRevenue = todaySales.reduce(
    (sum, sale) => sum + Number(sale.selling_price_snapshot ?? 0) * Number(sale.quantity ?? 0),
    0
  );

  const allProfit = sales.reduce((sum, sale) => sum + Number(sale.profit ?? 0), 0);

  const productGroups = new Map<string, { quantity: number; profit: number }>();
  for (const sale of todaySales) {
    const key = String(sale.product_name_snapshot || "Meal");
    const existing = productGroups.get(key) ?? { quantity: 0, profit: 0 };
    existing.quantity += Number(sale.quantity);
    existing.profit += Number(sale.profit ?? 0);
    productGroups.set(key, existing);
  }

  const historyData = historyRecordsForFilter(sales, historyFilter, customStart, customEnd);
  const historyProfit = historyData.reduce((sum, sale) => sum + Number(sale.profit ?? 0), 0);
  const historyMeals = historyData.reduce((sum, sale) => sum + Number(sale.quantity ?? 0), 0);

  const generateQr = useCallback(async () => {
    if (qrDataUrl || qrLoading) return;
    setQrLoading(true);
    try {
      const QRCode = await import("qrcode");
      const url = `${window.location.origin}/menu/${restaurantId}`;
      const dataUrl = await QRCode.toDataURL(url);
      setQrDataUrl(dataUrl);
    } catch {
      console.error("Failed to generate QR code");
    } finally {
      setQrLoading(false);
    }
  }, [qrDataUrl, qrLoading, restaurantId]);

  useEffect(() => {
    if (activeTab === "qr") {
      generateQr();
    }
  }, [activeTab, generateQr]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f4ee] px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-[480px] rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="min-w-0">
            <div className="text-[22px] font-black leading-tight tracking-tight text-stone-900">ልዩ ሽሮ Profit Tracker</div>
            <div className="text-[11px] font-medium text-stone-500">Profit tracker</div>
          </div>
          <div className="flex items-center gap-2">
            <LogoutButton />
          </div>
        </div>

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

        {/* Tabs - client-side switching */}
        <section className="px-5">
          <div className="grid grid-cols-4 rounded-2xl bg-stone-100 p-1">
            {([["sell", "Sell"], ["menu", "Menu"], ["history", "History"], ["qr", "QR Menu"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-black transition ${
                  activeTab === key
                    ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Tab Content - no page reload */}
        <section className="px-5 py-4">
          {activeTab === "sell" && (
            <SellTab
              activeProducts={activeProducts}
              productGroups={productGroups}
              sales={sales}
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
              historyData={historyData}
              historyFilter={historyFilter}
              historyMeals={historyMeals}
              historyProfit={historyProfit}
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
   SELL TAB
============================================================ */

function SellTab({
  activeProducts,
  productGroups,
  sales,
  money,
}: {
  activeProducts: Product[];
  productGroups: Map<string, { quantity: number; profit: number }>;
  sales: Sale[];
  money: Intl.NumberFormat;
}) {
  return (
    <div className="space-y-4">
      {activeProducts.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">No active products available.</div>
      ) : (
        <div className="space-y-3">
          {activeProducts.map((product) => (
            <div key={product.id} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-black text-stone-900">{product.name}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-semibold text-stone-500">
                    <span>cost {money.format(product.cost_price)}</span>
                    <span>·</span>
                    <span>sell {money.format(product.selling_price)}</span>
                    <span>·</span>
                    <span>profit {money.format(product.selling_price - product.cost_price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={createSale} className="flex items-center gap-2">
                    <input type="hidden" name="product_id" value={product.id} />
                    <input type="hidden" name="sold_at" value={new Date().toISOString()} />
                    <label className="sr-only" htmlFor={`quantity-${product.id}`}>Quantity</label>
                    <input id={`quantity-${product.id}`} name="quantity" type="number" min="1" step="1" defaultValue={1} required className="w-14 rounded-xl border border-stone-300 bg-white px-2 py-2 text-center text-sm font-semibold text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
                    <button type="submit" className="rounded-xl bg-green-700 px-4 py-2 text-xs font-black text-white transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700/30">Log sale</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-sm font-black text-stone-900">Recent sales</div>
          <Link href="/dashboard/sales" className="text-[11px] font-bold text-stone-600 hover:text-stone-900">View all</Link>
        </div>

        {sales.length === 0 ? (
          <div className="text-xs text-stone-500">No sales yet.</div>
        ) : (
          <div className="space-y-2">
            {sales.slice(0, 5).map((sale) => (
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

/* ============================================================
   MENU TAB
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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-stone-900">Menu</h3>
        <Link href="/dashboard/products/new" className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/30">Add product</Link>
      </div>

      <div className="space-y-3">
        {activeProducts.map((product) => (
          <div key={product.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-black text-stone-900">{product.name}</div>
                <div className="text-[11px] font-semibold text-stone-500">cost {money.format(product.cost_price)} · sell {money.format(product.selling_price)} · profit {money.format(product.selling_price - product.cost_price)}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/dashboard/products/${product.id}`} className="rounded-lg border border-stone-300 px-2 py-2 text-[11px] font-bold text-stone-700 transition hover:bg-stone-50">Price history</Link>
                <Link href={`/dashboard/products/${product.id}/edit`} className="rounded-lg border border-stone-300 px-2 py-2 text-[11px] font-bold text-stone-700 transition hover:bg-stone-50">Edit</Link>
                <form action={toggleProductStatus.bind(null, product.id, false)} method="POST">
                  <button type="submit" className="rounded-lg bg-amber-700 px-2 py-2 text-[11px] font-bold text-white transition hover:bg-amber-800">Deactivate</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {inactiveProducts.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <div className="text-sm font-black text-stone-900">Inactive products</div>
          <div className="mt-3 space-y-3">
            {inactiveProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-stone-900">{product.name}</div>
                  <div className="text-[11px] font-semibold text-stone-500">inactive</div>
                </div>
                <form action={toggleProductStatus.bind(null, product.id, true)} method="POST">
                  <button type="submit" className="rounded-xl bg-green-700 px-3 py-2 text-[11px] font-black text-white transition hover:bg-green-800">Reactivate</button>
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
   HISTORY TAB
============================================================ */

function HistoryTab({
  allProfit,
  historyData,
  historyFilter,
  historyMeals,
  historyProfit,
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
          <a href={exportUrl} className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-white">Export this view as CSV</a>
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
              className={`rounded-full px-3 py-1 text-[11px] font-black transition ${
                historyFilter === value
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
          <div className="text-sm font-black text-stone-900">{historyMeals} meals sold</div>
          <div className="text-sm font-black text-green-700">{money.format(historyProfit)} profit</div>
        </div>
      </div>

      <div className="space-y-2">
        {historyData.length === 0 ? (
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
   QR TAB - generates QR on demand
============================================================ */

function QRTab({
  qrDataUrl,
  qrLoading,
  restaurantId,
}: {
  qrDataUrl: string | null;
  qrLoading: boolean;
  restaurantId: string;
}) {
  const publicMenuUrl = typeof window !== "undefined"
    ? `${window.location.origin}/menu/${restaurantId}`
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
                <a href={qrDataUrl} download="restaurant-public-menu-qr.png" className="rounded-xl bg-stone-900 px-4 py-2 text-[11px] font-black text-white transition hover:bg-stone-800">Download QR</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function historyRecordsForFilter(sales: Sale[], filter: string, start?: string, end?: string) {
  if (!sales) return [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0).toISOString();
  const sevenStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0).toISOString();

  let result = [...sales];
  if (filter === "today") result = result.filter((sale) => sale.sold_at >= todayStart && sale.sold_at <= todayEnd);
  else if (filter === "yesterday") result = result.filter((sale) => sale.sold_at >= yesterdayStart && sale.sold_at < todayStart);
  else if (filter === "7d") result = result.filter((sale) => sale.sold_at >= sevenStart);
  else if (filter === "custom") {
    const startDate = start ? new Date(start).toISOString() : null;
    const endDate = end ? new Date(end + "T23:59:59").toISOString() : null;
    result = result.filter((sale) => {
      if (startDate && sale.sold_at < startDate) return false;
      if (endDate && sale.sold_at > endDate) return false;
      return true;
    });
  } else if (filter === "all") {
    result = result;
  }

  return result;
}
