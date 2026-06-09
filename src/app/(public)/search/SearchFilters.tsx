"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

type SearchFiltersProps = {
  currentType: string;
  currentDistrict: string;
  currentTaluk: string;
  currentMinPrice: string;
  currentMaxPrice: string;
  currentMinArea: string;
  currentMaxArea: string;
  currentBeds: string;
  currentCategory: string;
  currentQ: string;
  currentSort: string;
  districts: string[];
  taluks: string[];
};

const TYPES = [
  { label: "Buy Home", value: "SELL_HOME" },
  { label: "Buy Land", value: "SELL_LAND" },
  { label: "Rent", value: "RENT" },
  { label: "Lease", value: "LEASE" },
];

const CATEGORIES = [
  { label: "Villa", value: "villa" },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Plot", value: "plot" },
  { label: "Commercial", value: "commercial" },
  { label: "Agricultural", value: "agricultural" },
];

const PRICE_OPTIONS = [
  { label: "Any", value: "" },
  { label: "₹10L", value: "1000000" },
  { label: "₹25L", value: "2500000" },
  { label: "₹50L", value: "5000000" },
  { label: "₹75L", value: "7500000" },
  { label: "₹1Cr", value: "10000000" },
  { label: "₹2Cr", value: "20000000" },
  { label: "₹5Cr", value: "50000000" },
];

export function SearchFilters({
  currentType,
  currentDistrict,
  currentTaluk,
  currentMinPrice,
  currentMaxPrice,
  currentMinArea,
  currentMaxArea,
  currentBeds,
  currentCategory,
  currentQ,
  currentSort,
  districts,
  taluks,
}: SearchFiltersProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(currentType);
  const [district, setDistrict] = useState(currentDistrict);
  const [taluk, setTaluk] = useState(currentTaluk);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [minArea, setMinArea] = useState(currentMinArea);
  const [maxArea, setMaxArea] = useState(currentMaxArea);
  const [beds, setBeds] = useState(currentBeds);
  const [category, setCategory] = useState(currentCategory);
  const [q, setQ] = useState(currentQ);

  function buildAndNavigate(overrides?: Record<string, string>) {
    const params = new URLSearchParams();
    const vals = { type, district, taluk, minPrice, maxPrice, minArea, maxArea, beds, category, q, sort: currentSort, ...overrides };
    Object.entries(vals).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`/search?${params.toString()}`);
  }

  function handleApply() {
    buildAndNavigate();
    setOpen(false);
  }

  function handleClear() {
    setType(""); setDistrict(""); setTaluk(""); setMinPrice(""); setMaxPrice("");
    setMinArea(""); setMaxArea(""); setBeds(""); setCategory(""); setQ("");
    router.push("/search");
    setOpen(false);
  }

  const hasFilters = !!(type || district || taluk || minPrice || maxPrice || minArea || maxArea || beds || category || q);

  const filterBody = (
    <div className="space-y-5">
      {/* Keyword */}
      <div>
        <label className="block text-xs font-semibold text-ink mb-2 uppercase tracking-wide">Keyword</label>
        <input
          type="text"
          placeholder="e.g. 3 BHK villa Thrissur"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-semibold text-ink mb-2 uppercase tracking-wide">Property Type</label>
        <div className="space-y-1.5">
          {TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value={t.value}
                checked={type === t.value}
                onChange={() => setType(t.value)}
                className="accent-emerald-brand"
              />
              <span className="text-sm text-ink">{t.label}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value=""
              checked={type === ""}
              onChange={() => setType("")}
              className="accent-emerald-brand"
            />
            <span className="text-sm text-ink">All Types</span>
          </label>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-ink mb-2 uppercase tracking-wide">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* District */}
      <div>
        <label className="block text-xs font-semibold text-ink mb-2 uppercase tracking-wide">District</label>
        <select
          value={district}
          onChange={(e) => { setDistrict(e.target.value); setTaluk(""); }}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand"
        >
          <option value="">All Kerala</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Taluk (only if district selected) */}
      {taluks.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-ink mb-2 uppercase tracking-wide">Taluk</label>
          <select
            value={taluk}
            onChange={(e) => setTaluk(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand"
          >
            <option value="">All Taluks</option>
            {taluks.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold text-ink mb-2 uppercase tracking-wide">Price Range</label>
        <div className="grid grid-cols-2 gap-2">
          <select value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
            className="border border-border rounded-lg px-2 py-2 text-xs bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand">
            <option value="">Min</option>
            {PRICE_OPTIONS.filter(o => o.value).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
            className="border border-border rounded-lg px-2 py-2 text-xs bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand">
            <option value="">Max</option>
            {PRICE_OPTIONS.filter(o => o.value).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Area Range */}
      <div>
        <label className="block text-xs font-semibold text-ink mb-2 uppercase tracking-wide">Area (Cent)</label>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Min" value={minArea} onChange={(e) => setMinArea(e.target.value)} min={0}
            className="border border-border rounded-lg px-3 py-2 text-xs bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand" />
          <input type="number" placeholder="Max" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} min={0}
            className="border border-border rounded-lg px-3 py-2 text-xs bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand" />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-xs font-semibold text-ink mb-2 uppercase tracking-wide">Min Bedrooms</label>
        <div className="flex gap-1.5">
          {["", "1", "2", "3", "4", "5"].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBeds(b)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                beds === b
                  ? "bg-emerald-brand text-cream border-emerald-brand"
                  : "border-border bg-cream text-ink hover:bg-mist"
              }`}
            >
              {b === "" ? "Any" : `${b}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={handleApply}
          className="w-full py-2.5 rounded-xl bg-emerald-brand hover:bg-leaf text-cream text-sm font-semibold transition-colors"
        >
          Apply Filters
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="w-full py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-ink hover:bg-mist transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-cream text-sm font-medium text-ink hover:bg-mist transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-brand text-cream text-xs">
              Active
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
        </button>

        {open && (
          <div className="mt-3 p-4 bg-cream rounded-2xl border border-border shadow-sm">
            {filterBody}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-20">
        <div className="bg-cream rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-forest flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </h2>
            {hasFilters && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
          {filterBody}
        </div>
      </div>
    </>
  );
}
