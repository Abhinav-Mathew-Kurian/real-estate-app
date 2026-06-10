"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Search, Loader2, AlertCircle } from "lucide-react";

type AISearchBoxProps = {
  placeholder?: string;
  className?: string;
};

export function AISearchBox({
  placeholder = "Describe what you're looking for… e.g. '3 BHK villa in Kochi under 1 crore near school'",
  className = "",
}: AISearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ai" | "keyword" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      const params = new URLSearchParams(data.params ?? {});
      params.set("q", q);
      params.set("ai", "1");
      if (data.isSuggestion) params.set("suggestion", "1");

      const hasIntent = !!(
        data.intent?.type ||
        data.intent?.district ||
        data.intent?.category ||
        data.intent?.minPrice ||
        data.intent?.maxPrice ||
        data.intent?.bedrooms
      );

      setStatus(hasIntent ? "ai" : "keyword");
      router.push(`/search?${params.toString()}`);
    } catch {
      // Graceful fallback to plain text search
      setStatus("keyword");
      router.push(`/search?${new URLSearchParams({ q }).toString()}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-cream rounded-2xl shadow-xl border border-white/20 overflow-hidden ring-1 ring-white/10">
          {/* AI badge */}
          <div className="flex items-center gap-1.5 px-4 py-1 shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-brand shrink-0" />
            <span className="text-xs font-semibold text-emerald-brand whitespace-nowrap hidden sm:block">
              AI
            </span>
          </div>
          <div className="w-px h-8 bg-border/60" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setStatus("idle"); }}
            placeholder={placeholder}
            className="flex-1 px-4 py-3.5 bg-transparent text-ink placeholder:text-muted-foreground/50 text-sm focus:outline-none"
            disabled={loading}
            aria-label="AI-powered property search"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 bg-emerald-brand hover:bg-leaf disabled:opacity-50 disabled:cursor-not-allowed text-cream px-5 py-3.5 font-semibold text-sm transition-colors shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{loading ? "Searching…" : "Search"}</span>
          </button>
        </div>

        {/* Status hint */}
        {loading && (
          <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-1.5 text-[11px] text-cream/70">
            <Sparkles className="w-3 h-3 animate-pulse" />
            AI is analyzing your query…
          </div>
        )}
      </form>

      {!loading && status === "idle" && (
        <p className="mt-2 text-[11px] text-cream/40 text-center">
          Try: &ldquo;3 BHK flat in Thrissur under 60 lakhs&rdquo; · &ldquo;land near beach in Kozhikode&rdquo;
        </p>
      )}

      {status === "error" && (
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          Search failed. Please try again.
        </div>
      )}
    </div>
  );
}
