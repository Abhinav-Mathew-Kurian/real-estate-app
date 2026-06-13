import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchContent } from "./SearchContent";
import { AISearchBox } from "@/components/search/AISearchBox";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Search Properties",
  description: "Browse and filter properties for sale, rent, and lease across Kerala.",
};

export default async function SearchPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="min-h-screen bg-mist pt-28">
      {/* AI search header bar */}
      <div className="bg-cream border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-brand" />
            <span className="text-xs font-semibold text-emerald-brand uppercase tracking-[0.12em]">
              AI-Powered Search
            </span>
          </div>
          <AISearchBox
            variant="page"
            placeholder="Try: '2 BHK flat in Kochi under 50 lakhs near hospital' or 'agricultural land in Wayanad'…"
          />
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-muted-foreground">Loading properties…</div>
          </div>
        }
      >
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
