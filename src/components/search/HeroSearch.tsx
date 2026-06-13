"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Loader2, MapPin, ChevronDown } from "lucide-react";
import { KERALA_DISTRICTS } from "@/lib/geo-data";

const PROPERTY_TABS = [
  { label: "Buy Home", type: "SELL_HOME" },
  { label: "Buy Land", type: "SELL_LAND" },
  { label: "Rent",     type: "RENT" },
  { label: "Lease",    type: "LEASE" },
];

const PRICE_OPTIONS = [
  { label: "Any Budget",  value: "" },
  { label: "Up to ₹25 L", value: "2500000" },
  { label: "Up to ₹50 L", value: "5000000" },
  { label: "Up to ₹75 L", value: "7500000" },
  { label: "Up to ₹1 Cr", value: "10000000" },
  { label: "Up to ₹2 Cr", value: "20000000" },
  { label: "Up to ₹5 Cr", value: "50000000" },
];

export function HeroSearch() {
  const router = useRouter();
  const [mode, setMode]           = useState<"quick" | "ai">("quick");
  const [activeType, setActiveType] = useState("SELL_HOME");
  const [district, setDistrict]   = useState("");
  const [maxPrice, setMaxPrice]   = useState("");
  const [aiQuery, setAiQuery]     = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  function handleQuickSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    p.set("type", activeType);
    if (district) p.set("district", district);
    if (maxPrice)  p.set("maxPrice",  maxPrice);
    router.push(`/search?${p.toString()}`);
  }

  async function handleAISearch(e: React.FormEvent) {
    e.preventDefault();
    const q = aiQuery.trim();
    if (!q) return;
    setAiLoading(true);
    try {
      const res  = await fetch("/api/ai/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
      const data = await res.json();
      const p    = new URLSearchParams(data.params ?? {});
      p.set("q", q); p.set("ai", "1");
      if (data.isSuggestion) p.set("suggestion", "1");
      router.push(`/search?${p.toString()}`);
    } catch {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.22)] overflow-hidden">

        {/* Mode bar */}
        <div className="flex border-b border-border/40">
          <button
            type="button"
            onClick={() => setMode("quick")}
            className={`flex-1 sm:flex-none px-6 py-3.5 text-sm font-bold transition-all duration-200 border-b-2 cursor-pointer ${
              mode === "quick"
                ? "text-forest border-forest bg-white"
                : "text-muted-foreground border-transparent bg-mist/50 hover:text-ink"
            }`}
          >
            Quick Search
          </button>
          <button
            type="button"
            onClick={() => setMode("ai")}
            className={`flex-1 sm:flex-none px-6 py-3.5 text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 border-b-2 cursor-pointer ${
              mode === "ai"
                ? "text-emerald-brand border-emerald-brand bg-white"
                : "text-muted-foreground border-transparent bg-mist/50 hover:text-ink"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Search
          </button>
        </div>

        {mode === "quick" ? (
          <form onSubmit={handleQuickSearch}>
            {/* Property type tabs */}
            <div className="flex gap-1.5 px-4 pt-3 pb-2">
              {PROPERTY_TABS.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setActiveType(t.type)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeType === t.type
                      ? "bg-forest text-cream shadow-sm"
                      : "bg-mist text-ink/60 hover:bg-sage/25 hover:text-forest"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search fields row */}
            <div className="flex flex-col sm:flex-row gap-2 px-4 pb-4">
              {/* District */}
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 pointer-events-none" />
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 bg-mist border border-border/50 rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand/30 cursor-pointer appearance-none"
                >
                  <option value="">All Kerala</option>
                  {KERALA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Budget */}
              <div className="relative sm:w-44">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 pointer-events-none" />
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-4 pr-8 py-3 bg-mist border border-border/50 rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand/30 cursor-pointer appearance-none"
                >
                  {PRICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-forest hover:bg-emerald-brand text-cream font-bold text-sm rounded-xl transition-colors duration-200 cursor-pointer shrink-0 sm:w-auto"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAISearch} className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Describe what you need in plain English — our AI will find the best matches.
            </p>
            <div className="flex gap-2">
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder={"3 BHK flat in Kochi under 80 lakhs near metro…\nor: agricultural land in Wayanad with water source"}
                rows={2}
                className="flex-1 px-4 py-3 bg-mist border border-border/50 rounded-xl text-sm text-ink placeholder:text-muted-foreground/55 focus:outline-none focus:ring-2 focus:ring-emerald-brand/30 resize-none"
                disabled={aiLoading}
              />
              <button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-emerald-brand hover:bg-leaf disabled:opacity-50 disabled:cursor-not-allowed text-cream font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 w-16"
              >
                {aiLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Sparkles className="w-4 h-4" />
                }
                {aiLoading ? "…" : "Search"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
