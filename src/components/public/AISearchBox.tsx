"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Search, Loader2 } from "lucide-react";

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
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) throw new Error("AI search failed");

      const data = await res.json();
      const params = new URLSearchParams(data.params ?? {});

      // Always pass the raw query as q for display / fallback
      params.set("q", q);
      params.set("ai", "1");

      router.push(`/search?${params.toString()}`);
    } catch {
      setError("");
      // Graceful fallback: plain text search
      const params = new URLSearchParams({ q });
      router.push(`/search?${params.toString()}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-cream rounded-2xl shadow-lg border border-border/50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-1">
            <Sparkles className="w-4 h-4 text-emerald-brand shrink-0" />
            <span className="text-xs font-medium text-emerald-brand whitespace-nowrap hidden sm:block">
              AI Search
            </span>
          </div>
          <div className="w-px h-8 bg-border" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-4 py-3.5 bg-transparent text-ink placeholder:text-muted-foreground/60 text-sm focus:outline-none"
            disabled={loading}
            aria-label="AI-powered property search"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 bg-emerald-brand hover:bg-leaf disabled:opacity-50 disabled:cursor-not-allowed text-cream px-5 py-3.5 font-semibold text-sm transition-colors shrink-0"
            aria-label="Search"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{loading ? "Thinking…" : "Search"}</span>
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-500 px-1">{error}</p>
        )}
      </form>
      <p className="mt-2 text-xs text-mist/60 text-center">
        Powered by AI · Try: &ldquo;3 BHK flat in Thrissur under 60 lakhs&rdquo; or &ldquo;land near beach in Kozhikode&rdquo;
      </p>
    </div>
  );
}
