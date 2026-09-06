import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, TrendingUp, UtensilsCrossed, History, X, CalendarDays, Pencil, Clock, Download, Lock, LogOut } from "lucide-react";

const CURRENCY = "Birr";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export default function ProfitTracker() {
  const [meals, setMeals] = useState(null);
  const [sales, setSales] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [tab, setTab] = useState("sell");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: "", cost: "", price: "" });
  const [editingId, setEditingId] = useState(null);
  const [editMeal, setEditMeal] = useState({ name: "", cost: "", price: "" });
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  const [qtyInputs, setQtyInputs] = useState({});
  const [historyFilter, setHistoryFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");

  const [authStatus, setAuthStatus] = useState("checking"); // checking | setup | locked | unlocked
  const [storedPin, setStoredPin] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [authError, setAuthError] = useState("");

  const checkAuth = useCallback(async () => {
    setAuthStatus("checking");
    setAuthError("");
    try {
      const r = await window.storage.get("authPin", true);
      if (r && r.value) {
        setStoredPin(r.value);
        setAuthStatus("locked");
      } else {
        setAuthStatus("setup");
      }
    } catch {
      setAuthStatus("setup");
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  async function handleSetupPin() {
    setAuthError("");
    if (pinInput.length < 4) {
      setAuthError("Use at least 4 digits.");
      return;
    }
    if (pinInput !== pinConfirm) {
      setAuthError("PINs don't match.");
      return;
    }
    try {
      await window.storage.set("authPin", pinInput, true);
      setStoredPin(pinInput);
      setAuthStatus("unlocked");
      setPinInput("");
      setPinConfirm("");
    } catch {
      setAuthError("Could not save PIN. Check your connection and try again.");
    }
  }

  function handleUnlock() {
    setAuthError("");
    if (pinInput === storedPin) {
      setAuthStatus("unlocked");
      setPinInput("");
    } else {
      setAuthError("Wrong PIN.");
      setPinInput("");
    }
  }

  function handleLock() {
    setAuthStatus("locked");
    setPinInput("");
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let mealsVal = [];
      try {
        const r = await window.storage.get("meals", true);
        mealsVal = r ? JSON.parse(r.value) : [];
      } catch {
        mealsVal = [];
      }
      let salesVal = [];
      try {
        const r = await window.storage.get("sales", true);
        salesVal = r ? JSON.parse(r.value) : [];
      } catch {
        salesVal = [];
      }
      let priceHistVal = [];
      try {
        const r = await window.storage.get("priceHistory", true);
        priceHistVal = r ? JSON.parse(r.value) : [];
      } catch {
        priceHistVal = [];
      }
      setMeals(mealsVal);
      setSales(salesVal);
      setPriceHistory(priceHistVal);
    } catch (e) {
      setError("Could not load data. Pull to refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveMeals(next) {
    setMeals(next);
    try {
      await window.storage.set("meals", JSON.stringify(next), true);
    } catch {
      setError("Could not save. Check your connection and try again.");
    }
  }

  async function saveSales(next) {
    setSales(next);
    try {
      await window.storage.set("sales", JSON.stringify(next), true);
    } catch {
      setError("Could not save. Check your connection and try again.");
    }
  }

  async function savePriceHistory(next) {
    setPriceHistory(next);
    try {
      await window.storage.set("priceHistory", JSON.stringify(next), true);
    } catch {
      setError("Could not save. Check your connection and try again.");
    }
  }

  function addMeal() {
    const name = newMeal.name.trim();
    const cost = parseFloat(newMeal.cost);
    const price = parseFloat(newMeal.price);
    if (!name || isNaN(cost) || isNaN(price) || cost < 0 || price < 0) return;
    const meal = { id: uid(), name, cost, price };
    saveMeals([...(meals || []), meal]);
    setNewMeal({ name: "", cost: "", price: "" });
    setShowAddMeal(false);
  }

  function removeMeal(id) {
    saveMeals((meals || []).filter((m) => m.id !== id));
  }

  function startEdit(meal) {
    setEditingId(meal.id);
    setEditMeal({ name: meal.name, cost: String(meal.cost), price: String(meal.price) });
    setShowAddMeal(false);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit() {
    const name = editMeal.name.trim();
    const cost = parseFloat(editMeal.cost);
    const price = parseFloat(editMeal.price);
    if (!name || isNaN(cost) || isNaN(price) || cost < 0 || price < 0) return;
    const original = (meals || []).find((m) => m.id === editingId);
    saveMeals((meals || []).map((m) => (m.id === editingId ? { ...m, name, cost, price } : m)));
    if (original && (original.cost !== cost || original.price !== price)) {
      const entry = {
        id: uid(),
        mealId: editingId,
        mealName: name,
        oldCost: original.cost,
        oldPrice: original.price,
        newCost: cost,
        newPrice: price,
        date: new Date().toISOString(),
      };
      savePriceHistory([...(priceHistory || []), entry]);
    }
    setEditingId(null);
  }

  function logSale(meal) {
    const qty = parseInt(qtyInputs[meal.id] || "1", 10);
    if (!qty || qty < 1) return;
    const sale = {
      id: uid(),
      mealId: meal.id,
      mealName: meal.name,
      cost: meal.cost,
      price: meal.price,
      qty,
      date: new Date().toISOString(),
    };
    saveSales([...(sales || []), sale]);
    setQtyInputs((q) => ({ ...q, [meal.id]: "" }));
  }

  function deleteSale(id) {
    saveSales((sales || []).filter((s) => s.id !== id));
  }

  function exportSalesCSV() {
    const rows = [["Date", "Meal", "Quantity", "Cost per unit", "Price per unit", "Profit"]];
    filteredSales.forEach((s) => {
      rows.push([
        new Date(s.date).toLocaleString(),
        s.mealName,
        s.qty,
        Math.round(s.cost),
        Math.round(s.price),
        Math.round((s.price - s.cost) * s.qty),
      ]);
    });
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-history-${historyFilter}-${todayKey()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const todaysSales = (sales || []).filter((s) => todayKey(new Date(s.date)) === todayKey());
  const todayProfit = todaysSales.reduce((sum, s) => sum + (s.price - s.cost) * s.qty, 0);
  const todayRevenue = todaysSales.reduce((sum, s) => sum + s.price * s.qty, 0);
  const allTimeProfit = (sales || []).reduce((sum, s) => sum + (s.price - s.cost) * s.qty, 0);

  const byMealToday = {};
  todaysSales.forEach((s) => {
    byMealToday[s.mealName] = byMealToday[s.mealName] || { qty: 0, profit: 0 };
    byMealToday[s.mealName].qty += s.qty;
    byMealToday[s.mealName].profit += (s.price - s.cost) * s.qty;
  });

  const fmt = (n) =>
    Math.round(n).toLocaleString() + " " + CURRENCY;

  function inRange(dateStr, filter) {
    const d = new Date(dateStr);
    const now = new Date();
    if (filter === "today") return todayKey(d) === todayKey(now);
    if (filter === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return todayKey(d) === todayKey(y);
    }
    if (filter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo && d <= now;
    }
    if (filter === "custom") {
      if (!customDate) return false;
      return todayKey(d) === customDate;
    }
    return true; // "all"
  }

  const filteredSales = (sales || []).filter((s) => inRange(s.date, historyFilter));
  const filteredProfit = filteredSales.reduce((sum, s) => sum + (s.price - s.cost) * s.qty, 0);

  if (authStatus === "checking") {
    return (
      <div style={styles.page}>
        <div style={styles.centerNote}>Loading…</div>
      </div>
    );
  }

  if (authStatus === "setup") {
    return (
      <div style={styles.page}>
        <div style={styles.authWrap}>
          <div style={styles.authIconCircle}>
            <Lock size={22} color="#4a3a2a" />
          </div>
          <div style={styles.authTitle}>Set a PIN for ልዩ ሽሮ Profit Tracker</div>
          <div style={styles.authSub}>
            Both owners will use this same PIN to open the app. Anyone with the link and this PIN can view and edit
            the data — this is a simple lock, not full security.
          </div>
          <input
            type="password"
            inputMode="numeric"
            placeholder="Create PIN (min 4 digits)"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
            style={styles.authInput}
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder="Confirm PIN"
            value={pinConfirm}
            onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))}
            style={styles.authInput}
          />
          {authError && <div style={styles.authError}>{authError}</div>}
          <button style={styles.authButton} onClick={handleSetupPin}>Save PIN & continue</button>
        </div>
      </div>
    );
  }

  if (authStatus === "locked") {
    return (
      <div style={styles.page}>
        <div style={styles.authWrap}>
          <div style={styles.authIconCircle}>
            <Lock size={22} color="#4a3a2a" />
          </div>
          <div style={styles.authTitle}>ልዩ ሽሮ Profit Tracker</div>
          <div style={styles.authSub}>Enter the PIN to continue.</div>
          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            style={styles.authInput}
            autoFocus
          />
          {authError && <div style={styles.authError}>{authError}</div>}
          <button style={styles.authButton} onClick={handleUnlock}>Unlock</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.centerNote}>Loading your data…</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.brandName}>ልዩ ሽሮ Profit Tracker</div>
          <div style={styles.brandSub}>Profit tracker</div>
        </div>
        <button aria-label="Lock app" style={styles.lockButton} onClick={handleLock}>
          <LogOut size={16} />
        </button>
      </header>

      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button style={styles.errorRetry} onClick={load}>Retry</button>
        </div>
      )}

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Today's profit</div>
          <div style={styles.statValue}>{fmt(todayProfit)}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Today's sales</div>
          <div style={styles.statValue}>{fmt(todayRevenue)}</div>
        </div>
      </div>

      <div style={styles.tabs}>
        <TabButton active={tab === "sell"} onClick={() => setTab("sell")} icon={<TrendingUp size={16} />} label="Sell" />
        <TabButton active={tab === "menu"} onClick={() => setTab("menu")} icon={<UtensilsCrossed size={16} />} label="Menu" />
        <TabButton active={tab === "history"} onClick={() => setTab("history")} icon={<History size={16} />} label="History" />
      </div>

      {tab === "sell" && (
        <div style={styles.section}>
          {(!meals || meals.length === 0) ? (
            <EmptyState
              text="No meals yet. Add a meal in the Menu tab to start logging sales."
              onAction={() => setTab("menu")}
              actionLabel="Go to menu"
            />
          ) : (
            <>
              <div style={styles.mealList}>
                {meals.map((m) => (
                  <div key={m.id} style={styles.sellCard}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.mealName}>{m.name}</div>
                      <div style={styles.mealMeta}>
                        cost {Math.round(m.cost)} · sell {Math.round(m.price)} · profit {Math.round(m.price - m.cost)}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={qtyInputs[m.id] || ""}
                      onChange={(e) => setQtyInputs((q) => ({ ...q, [m.id]: e.target.value }))}
                      style={styles.qtyInput}
                    />
                    <button style={styles.sellButton} onClick={() => logSale(m)}>Log sale</button>
                  </div>
                ))}
              </div>

              {Object.keys(byMealToday).length > 0 && (
                <div style={styles.breakdownCard}>
                  <div style={styles.breakdownTitle}>Today by meal</div>
                  {Object.entries(byMealToday).map(([name, v]) => (
                    <div key={name} style={styles.breakdownRow}>
                      <span>{name} × {v.qty}</span>
                      <span style={styles.breakdownProfit}>+{fmt(v.profit)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "menu" && (
        <div style={styles.section}>
          {(!meals || meals.length === 0) ? (
            <EmptyState text="Your menu is empty. Add your first meal below." />
          ) : (
            <div style={styles.mealList}>
              {meals.map((m) =>
                editingId === m.id ? (
                  <div key={m.id} style={styles.addMealForm}>
                    <div style={styles.formHeader}>
                      <span style={styles.formTitle}>Edit meal</span>
                      <button aria-label="Close" style={styles.iconButtonPlain} onClick={cancelEdit}>
                        <X size={16} />
                      </button>
                    </div>
                    <label style={styles.label}>Meal name</label>
                    <input
                      style={styles.input}
                      value={editMeal.name}
                      onChange={(e) => setEditMeal((n) => ({ ...n, name: e.target.value }))}
                    />
                    <label style={styles.label}>Cost to make ({CURRENCY})</label>
                    <input
                      style={styles.input}
                      type="number"
                      value={editMeal.cost}
                      onChange={(e) => setEditMeal((n) => ({ ...n, cost: e.target.value }))}
                    />
                    <label style={styles.label}>Selling price ({CURRENCY})</label>
                    <input
                      style={styles.input}
                      type="number"
                      value={editMeal.price}
                      onChange={(e) => setEditMeal((n) => ({ ...n, price: e.target.value }))}
                    />
                    <button style={styles.saveMealButton} onClick={saveEdit}>Save changes</button>
                  </div>
                ) : (
                  <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={styles.menuCard}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.mealName}>{m.name}</div>
                        <div style={styles.mealMeta}>
                          cost {Math.round(m.cost)} {CURRENCY} · sell {Math.round(m.price)} {CURRENCY} · profit {Math.round(m.price - m.cost)} {CURRENCY}
                        </div>
                      </div>
                      <button
                        aria-label="Price history"
                        style={styles.iconButtonPlain}
                        onClick={() => setExpandedHistoryId(expandedHistoryId === m.id ? null : m.id)}
                      >
                        <Clock size={16} />
                      </button>
                      <button aria-label="Edit meal" style={styles.iconButtonPlain} onClick={() => startEdit(m)}>
                        <Pencil size={16} />
                      </button>
                      <button aria-label="Remove meal" style={styles.iconButton} onClick={() => removeMeal(m.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {expandedHistoryId === m.id && (
                      <div style={styles.priceHistoryBox}>
                        {(priceHistory || []).filter((h) => h.mealId === m.id).length === 0 ? (
                          <div style={styles.priceHistoryEmpty}>No price changes recorded yet.</div>
                        ) : (
                          [...(priceHistory || [])]
                            .filter((h) => h.mealId === m.id)
                            .reverse()
                            .map((h) => (
                              <div key={h.id} style={styles.priceHistoryRow}>
                                <span style={styles.priceHistoryDate}>
                                  {new Date(h.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                </span>
                                <span>
                                  cost {Math.round(h.oldCost)} → {Math.round(h.newCost)}, sell {Math.round(h.oldPrice)} → {Math.round(h.newPrice)}
                                </span>
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {!showAddMeal ? (
            <button style={styles.addMealButton} onClick={() => { setShowAddMeal(true); setEditingId(null); }}>
              <Plus size={16} /> Add meal
            </button>
          ) : (
            <div style={styles.addMealForm}>
              <div style={styles.formHeader}>
                <span style={styles.formTitle}>New meal</span>
                <button aria-label="Close" style={styles.iconButtonPlain} onClick={() => setShowAddMeal(false)}>
                  <X size={16} />
                </button>
              </div>
              <label style={styles.label}>Meal name</label>
              <input
                style={styles.input}
                placeholder="Pizza"
                value={newMeal.name}
                onChange={(e) => setNewMeal((n) => ({ ...n, name: e.target.value }))}
              />
              <label style={styles.label}>Cost to make ({CURRENCY})</label>
              <input
                style={styles.input}
                type="number"
                placeholder="200"
                value={newMeal.cost}
                onChange={(e) => setNewMeal((n) => ({ ...n, cost: e.target.value }))}
              />
              <label style={styles.label}>Selling price ({CURRENCY})</label>
              <input
                style={styles.input}
                type="number"
                placeholder="300"
                value={newMeal.price}
                onChange={(e) => setNewMeal((n) => ({ ...n, price: e.target.value }))}
              />
              <button style={styles.saveMealButton} onClick={addMeal}>Save meal</button>
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div style={styles.section}>
          <div style={styles.allTimeCard}>
            <div style={styles.statLabel}>All-time profit</div>
            <div style={styles.statValueLarge}>{fmt(allTimeProfit)}</div>
          </div>

          <div style={styles.filterRow}>
            {[
              { key: "today", label: "Today" },
              { key: "yesterday", label: "Yesterday" },
              { key: "week", label: "Last 7 days" },
              { key: "all", label: "All time" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setHistoryFilter(f.key)}
                style={{ ...styles.filterButton, ...(historyFilter === f.key ? styles.filterButtonActive : {}) }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={styles.dateRow}>
            <CalendarDays size={16} style={{ color: "#8a8778", flexShrink: 0 }} />
            <input
              type="date"
              value={customDate}
              max={todayKey()}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setHistoryFilter("custom");
              }}
              style={styles.dateInput}
            />
          </div>

          <div style={styles.filteredSummary}>
            <span>{filteredSales.reduce((n, s) => n + s.qty, 0)} meals sold</span>
            <span style={styles.breakdownProfit}>{fmt(filteredProfit)} profit</span>
          </div>

          <button style={styles.exportButton} onClick={exportSalesCSV} disabled={filteredSales.length === 0}>
            <Download size={15} /> Export this view as CSV
          </button>

          {filteredSales.length === 0 ? (
            <EmptyState
              text={
                historyFilter === "custom" && !customDate
                  ? "Pick a date above to see that day's sales."
                  : "No sales in this period."
              }
            />
          ) : (
            <div style={styles.mealList}>
              {[...filteredSales].reverse().map((s) => (
                <div key={s.id} style={styles.historyRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.mealName}>{s.mealName} × {s.qty}</div>
                    <div style={styles.mealMeta}>
                      {new Date(s.date).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div style={styles.historyProfit}>+{fmt((s.price - s.cost) * s.qty)}</div>
                  <button aria-label="Delete sale" style={styles.iconButtonPlain} onClick={() => deleteSale(s.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={styles.sharedNote}>Data is shared with anyone using this link.</div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{ ...styles.tabButton, ...(active ? styles.tabButtonActive : {}) }}>
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ text, onAction, actionLabel }) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyText}>{text}</div>
      {onAction && (
        <button style={styles.emptyAction} onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    maxWidth: 480,
    margin: "0 auto",
    padding: "16px 16px 40px",
    color: "#1c1c1a",
    background: "#faf8f4",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  centerNote: { textAlign: "center", padding: "60px 0", color: "#8a8778" },
  authWrap: {
    maxWidth: 340,
    margin: "60px auto 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 10,
    padding: "0 8px",
  },
  authIconCircle: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#f0ece2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  authTitle: { fontSize: 17, fontWeight: 600, color: "#2d2a20" },
  authSub: { fontSize: 13, color: "#8a8778", lineHeight: 1.4, marginBottom: 6 },
  authInput: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #ddd6c5",
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 2,
    boxSizing: "border-box",
  },
  authError: { fontSize: 13, color: "#a33" },
  authButton: {
    width: "100%",
    background: "#2d2a20",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    marginTop: 4,
  },
  lockButton: {
    border: "1px solid #ece7db",
    background: "#fff",
    color: "#6b6858",
    borderRadius: 10,
    padding: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  brandName: { fontSize: 17, fontWeight: 600, color: "#4a3a2a", lineHeight: 1.3 },
  brandSub: { fontSize: 13, color: "#8a8778" },
  errorBanner: {
    background: "#fdecea",
    color: "#a33",
    fontSize: 13,
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  errorRetry: { border: "none", background: "none", color: "#a33", fontWeight: 600, cursor: "pointer" },
  statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 },
  statCard: { background: "#fff", border: "1px solid #ece7db", borderRadius: 12, padding: "12px 14px" },
  statLabel: { fontSize: 12, color: "#8a8778", marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 600, color: "#2d6a4f" },
  statValueLarge: { fontSize: 26, fontWeight: 600, color: "#2d6a4f" },
  tabs: { display: "flex", gap: 6, marginBottom: 16, background: "#f0ece2", padding: 4, borderRadius: 10 },
  tabButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "9px 6px",
    border: "none",
    borderRadius: 8,
    background: "transparent",
    color: "#6b6858",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  tabButtonActive: { background: "#fff", color: "#2d2a20", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" },
  section: { display: "flex", flexDirection: "column", gap: 12 },
  mealList: { display: "flex", flexDirection: "column", gap: 8 },
  sellCard: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid #ece7db",
    borderRadius: 12,
    padding: "10px 12px",
  },
  menuCard: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid #ece7db",
    borderRadius: 12,
    padding: "10px 12px",
  },
  historyRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid #ece7db",
    borderRadius: 12,
    padding: "10px 12px",
  },
  mealName: { fontSize: 14, fontWeight: 500, color: "#2d2a20" },
  mealMeta: { fontSize: 12, color: "#8a8778", marginTop: 2 },
  qtyInput: {
    width: 44,
    padding: "8px 6px",
    borderRadius: 8,
    border: "1px solid #ddd6c5",
    fontSize: 14,
    textAlign: "center",
  },
  sellButton: {
    background: "#2d6a4f",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  iconButton: {
    border: "none",
    background: "#fdecea",
    color: "#a33",
    borderRadius: 8,
    padding: 8,
    cursor: "pointer",
    display: "flex",
  },
  iconButtonPlain: {
    border: "none",
    background: "transparent",
    color: "#8a8778",
    cursor: "pointer",
    display: "flex",
    padding: 4,
  },
  priceHistoryBox: {
    background: "#f5f2e9",
    border: "1px solid #ece7db",
    borderRadius: 10,
    padding: "8px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  priceHistoryRow: { display: "flex", flexDirection: "column", fontSize: 12, color: "#4a473c" },
  priceHistoryDate: { fontSize: 11, color: "#8a8778", marginBottom: 2 },
  priceHistoryEmpty: { fontSize: 12, color: "#8a8778" },
  breakdownCard: { background: "#fff", border: "1px solid #ece7db", borderRadius: 12, padding: "12px 14px" },
  breakdownTitle: { fontSize: 13, fontWeight: 600, color: "#4a3a2a", marginBottom: 8 },
  breakdownRow: { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", color: "#4a473c" },
  breakdownProfit: { color: "#2d6a4f", fontWeight: 500 },
  addMealButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "1px dashed #c9c2a8",
    background: "transparent",
    color: "#6b6858",
    borderRadius: 12,
    padding: "12px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  addMealForm: { background: "#fff", border: "1px solid #ece7db", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 6 },
  formHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  formTitle: { fontSize: 14, fontWeight: 600, color: "#2d2a20" },
  label: { fontSize: 12, color: "#8a8778", marginTop: 6 },
  input: {
    padding: "9px 10px",
    borderRadius: 8,
    border: "1px solid #ddd6c5",
    fontSize: 14,
  },
  saveMealButton: {
    marginTop: 10,
    background: "#2d2a20",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  allTimeCard: { background: "#fff", border: "1px solid #ece7db", borderRadius: 12, padding: "16px 18px" },
  filterRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  filterButton: {
    border: "1px solid #ddd6c5",
    background: "#fff",
    color: "#6b6858",
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
  filterButtonActive: { background: "#2d2a20", color: "#fff", borderColor: "#2d2a20" },
  dateRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid #ece7db",
    borderRadius: 10,
    padding: "8px 12px",
  },
  dateInput: {
    border: "none",
    outline: "none",
    fontSize: 14,
    flex: 1,
    color: "#2d2a20",
    background: "transparent",
  },
  filteredSummary: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#6b6858",
    padding: "2px 2px 4px",
  },
  exportButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "1px solid #ddd6c5",
    background: "#fff",
    color: "#4a3a2a",
    borderRadius: 10,
    padding: "10px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  historyProfit: { color: "#2d6a4f", fontWeight: 500, fontSize: 13, whiteSpace: "nowrap" },
  emptyState: { textAlign: "center", padding: "24px 12px", color: "#8a8778", fontSize: 14 },
  emptyText: { marginBottom: 10 },
  emptyAction: {
    border: "1px solid #c9c2a8",
    background: "#fff",
    color: "#4a3a2a",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  sharedNote: { textAlign: "center", fontSize: 11, color: "#b3ae9c", marginTop: 20 },
};
