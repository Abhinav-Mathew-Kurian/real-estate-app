"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { KERALA_DISTRICTS } from "@/lib/geo-data";

type SearchBarProps = {
  defaultType?: string;
  defaultDistrict?: string;
  defaultMaxPrice?: string;
  compact?: boolean;
};

const PRICE_OPTIONS = [
  { label: "Any Price", value: "" },
  { label: "Up to ₹25 Lakh", value: "2500000" },
  { label: "Up to ₹50 Lakh", value: "5000000" },
  { label: "Up to ₹1 Crore", value: "10000000" },
  { label: "Up to ₹2 Crore", value: "20000000" },
  { label: "Up to ₹5 Crore", value: "50000000" },
];

const TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Buy Home", value: "SELL_HOME" },
  { label: "Buy Land", value: "SELL_LAND" },
  { label: "Rent", value: "RENT" },
  { label: "Lease", value: "LEASE" },
];

export function SearchBar({
  defaultType = "",
  defaultDistrict = "",
  defaultMaxPrice = "",
  compact = false,
}: SearchBarProps) {
  const router = useRouter();
  const [type, setType] = useState(defaultType);
  const [district, setDistrict] = useState(defaultDistrict);
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (district) params.set("district", district);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/search?${params.toString()}`);
  }

  const selectClass = `h-full bg-transparent border-0 text-ink text-sm focus:outline-none cursor-pointer pr-2 ${compact ? "py-2 text-xs" : "py-3"}`;

  return (
    <form
      onSubmit={handleSearch}
      className={`flex flex-col sm:flex-row items-stretch sm:items-center bg-cream rounded-2xl shadow-lg overflow-hidden border border-border/50 ${compact ? "text-sm" : ""}`}
    >
      {/* Type */}
      <div className={`flex-1 flex items-center gap-2 px-4 border-b sm:border-b-0 sm:border-r border-border ${compact ? "py-1.5" : "py-2"}`}>
        <span className="text-muted-foreground text-xs font-medium whitespace-nowrap">Type</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={selectClass}
          aria-label="Property type"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div className={`flex-1 flex items-center gap-2 px-4 border-b sm:border-b-0 sm:border-r border-border ${compact ? "py-1.5" : "py-2"}`}>
        <span className="text-muted-foreground text-xs font-medium whitespace-nowrap">District</span>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className={selectClass}
          aria-label="District"
        >
          <option value="">All Kerala</option>
          {KERALA_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Max Price */}
      <div className={`flex-1 flex items-center gap-2 px-4 border-b sm:border-b-0 sm:border-r border-border ${compact ? "py-1.5" : "py-2"}`}>
        <span className="text-muted-foreground text-xs font-medium whitespace-nowrap">Budget</span>
        <select
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className={selectClass}
          aria-label="Max price"
        >
          {PRICE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Button */}
      <button
        type="submit"
        className={`flex items-center justify-center gap-2 bg-emerald-brand hover:bg-leaf text-cream font-semibold transition-colors ${compact ? "px-4 py-2 text-sm" : "px-6 py-4"}`}
      >
        <Search className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
        Search
      </button>
    </form>
  );
}
