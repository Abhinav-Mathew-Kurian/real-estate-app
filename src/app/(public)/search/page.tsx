import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchContent } from "./SearchContent";

export const metadata: Metadata = {
  title: "Search Properties",
  description: "Browse and filter properties for sale, rent, and lease across Kerala.",
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className="min-h-screen bg-mist pt-16">
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
