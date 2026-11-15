"use client";

import { useState } from "react";

export const DEFAULT_PRODUCT_CATEGORIES = [
  "የጾም ቁርስ",
  "የፆም ምሳ",
  "የፍስክ ምሳ",
  "የፍስክ ቁርስ",
  "መጠጦች",
  "ትኩስ ነገሮች",
] as const;

interface CategorySelectProps {
  defaultValue?: string;
  name?: string;
}

export default function CategorySelect({
  defaultValue = "የፆም ምሳ",
  name = "category",
}: CategorySelectProps) {
  // Find match or match with flexible ጾ/ፆ spelling
  const matchedCategory = DEFAULT_PRODUCT_CATEGORIES.find(
    (c) => c === defaultValue
  ) || DEFAULT_PRODUCT_CATEGORIES.find(
    (c) => c.replace("የፆም", "የጾም") === defaultValue?.replace("የፆም", "የጾም")
  );

  const [selected, setSelected] = useState<string>(
    defaultValue
      ? matchedCategory || "__custom__"
      : DEFAULT_PRODUCT_CATEGORIES[0]
  );
  const [customValue, setCustomValue] = useState<string>(
    matchedCategory ? "" : defaultValue || ""
  );

  const finalValue = selected === "__custom__" ? customValue.trim() : selected;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-stone-700">
          ምድብ (Category)
        </label>
        {selected === "__custom__" && (
          <button
            type="button"
            onClick={() => {
              setSelected(DEFAULT_PRODUCT_CATEGORIES[0]);
              setCustomValue("");
            }}
            className="text-xs font-bold text-amber-800 underline hover:text-amber-950"
          >
            ወደ ዝርዝር ተመለስ (Back to list)
          </button>
        )}
      </div>

      <div className="relative">
        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            if (e.target.value !== "__custom__") {
              setCustomValue("");
            }
          }}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-900 shadow-xs outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 cursor-pointer"
        >
          {DEFAULT_PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="__custom__">➕ አዲስ ምድብ ጨምር... (Add New Category)</option>
        </select>
      </div>

      {selected === "__custom__" && (
        <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50/60 p-3 shadow-xs">
          <label className="mb-1 block text-xs font-bold text-amber-950">
            አዲሱን የምድብ ስም ያስገቡ (New Category Name)
          </label>
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="ምሳሌ፡ መክሰስ፣ ጣፋጭ... (New Category Name)"
            required={selected === "__custom__"}
            autoFocus
            className="w-full rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
          />
          <p className="mt-1 text-[11px] font-semibold text-stone-500">
            አዲስ ምድብ ካስገቡ በኋላ በራስ-ሰር በምናሌው ላይ አዲስ ክፍል ይፈጠራል።
          </p>
        </div>
      )}

      {/* Hidden input passed to server action */}
      <input type="hidden" name={name} value={finalValue} />
    </div>
  );
}
