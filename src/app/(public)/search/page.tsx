import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchContent } from "./SearchContent";
import { AISearchBox } from "@/components/search/AISearchBox";

export const metadata: Metadata = {
  title: "Search Properties",
  description: "Browse and filter properties for sale, rent, and lease across Kerala.",
};

export default async function SearchPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="min-h-screen bg-mist pt-16">
      <div className="bg-forest/5 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <AISearchBox placeholder="Try AI search: '2 BHK flat in Kochi under 50 lakhs near hospital'…" />
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
