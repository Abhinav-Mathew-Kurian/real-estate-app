import Link from "next/link";
import { connectDB } from "@/lib/db";
import Listing from "@/lib/db/models/Listing";

const TYPE_LABELS: Record<string, string> = {
  SELL_HOME: "Buy Home",
  SELL_LAND: "Buy Land",
  RENT: "For Rent",
  LEASE: "For Lease",
};

const CATEGORY_LABELS: Record<string, string> = {
  villa: "Villa",
  apartment: "Apartment",
  house: "House",
  plot: "Plot",
  commercial: "Commercial",
  agricultural: "Agricultural",
};
import { KERALA_DISTRICTS, TALUKS_BY_DISTRICT } from "@/lib/geo-data";
import { SearchFilters } from "./SearchFilters";
import { SortSelect } from "./SortSelect";
import { SearchResultsView } from "./SearchResultsView";
import type { IListing } from "@/lib/db/models/Listing";

type SearchContentProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function getParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const val = params[key];
  if (Array.isArray(val)) return val[0] ?? "";
  return val ?? "";
}


export async function SearchContent({ searchParams }: SearchContentProps) {
  await connectDB();

  const type = getParam(searchParams, "type");
  const district = getParam(searchParams, "district");
  const taluk = getParam(searchParams, "taluk");
  const minPrice = getParam(searchParams, "minPrice");
  const maxPrice = getParam(searchParams, "maxPrice");
  const minArea = getParam(searchParams, "minArea");
  const maxArea = getParam(searchParams, "maxArea");
  const beds = getParam(searchParams, "beds");
  const category = getParam(searchParams, "category");
  const q = getParam(searchParams, "q");
  const isSuggestion = getParam(searchParams, "suggestion") === "1";
  const sort = getParam(searchParams, "sort") || "newest";
  const featured = getParam(searchParams, "featured");
  const page = Math.max(1, parseInt(getParam(searchParams, "page") || "1"));
  const limit = 12;

  // Build MongoDB filter
  const filter: Record<string, unknown> = { status: "published" };
  if (type) filter.type = type;
  if (district) filter.district = district;
  if (taluk) filter.taluk = taluk;
  if (category) filter.category = category;
  if (featured === "true") filter.isFeatured = true;
  if (beds) filter.bedrooms = { $gte: parseInt(beds) };
  if (q) {
    const tokens = q.split(/\s+/).map(t => t.replace(/[^\w]/g, "")).filter(t => t.length >= 3);
    const fields = ["title", "description", "village", "district", "taluk", "category"];
    if (tokens.length > 1) {
      // Each token must appear in at least one searchable field (AND of ORs)
      filter.$and = tokens.map(t => ({
        $or: fields.map(f => ({ [f]: { $regex: t, $options: "i" } })),
      }));
    } else {
      // Single word — simple OR across fields
      const re = { $regex: q, $options: "i" };
      filter.$or = fields.map(f => ({ [f]: re }));
    }
  }

  if (minPrice || maxPrice) {
    const priceFilter: Record<string, number> = {};
    if (minPrice) priceFilter.$gte = parseInt(minPrice);
    if (maxPrice) priceFilter.$lte = parseInt(maxPrice);
    filter.askingPrice = priceFilter;
  }

  if (minArea || maxArea) {
    const areaFilter: Record<string, number> = {};
    if (minArea) areaFilter.$gte = parseFloat(minArea);
    if (maxArea) areaFilter.$lte = parseFloat(maxArea);
    filter["area.value"] = areaFilter;
  }

  // Sort
  let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "price_asc") sortQuery = { askingPrice: 1 };
  if (sort === "price_desc") sortQuery = { askingPrice: -1 };
  if (sort === "area_asc") sortQuery = { "area.value": 1 };

  const isAiSearch = getParam(searchParams, "ai") === "1";

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Listing.countDocuments(filter),
  ]);

  // AI search fallback: if strict filters returned nothing, broaden progressively
  let fallbackListings: IListing[] | null = null;
  let fallbackLabel = "";
  if (isAiSearch && listings.length === 0) {
    // Try keyword-only if there's a query
    if (q) {
      const tokens = q.split(/\s+/).map((t: string) => t.replace(/[^\w]/g, "")).filter((t: string) => t.length >= 3);
      if (tokens.length > 0) {
        const orClauses = tokens.flatMap((t: string) =>
          ["title", "description", "village", "district", "taluk", "category"].map((f) => ({
            [f]: { $regex: t, $options: "i" },
          }))
        );
        const kw = await Listing.find({ status: "published", $or: orClauses })
          .sort({ isFeatured: -1, createdAt: -1 }).limit(12).lean();
        if (kw.length > 0) {
          fallbackListings = JSON.parse(JSON.stringify(kw)) as IListing[];
          fallbackLabel = `No exact match — showing properties related to "${q}"`;
        }
      }
    }
    // Final fallback: featured/recent
    if (!fallbackListings) {
      const recent = await Listing.find({ status: "published" })
        .sort({ isFeatured: -1, createdAt: -1 }).limit(12).lean();
      fallbackListings = JSON.parse(JSON.stringify(recent)) as IListing[];
      fallbackLabel = "No exact match — showing our latest listings";
    }
  }

  const totalPages = Math.ceil(total / limit);

  const plainListings = JSON.parse(JSON.stringify(listings)) as IListing[];

  // Build pagination URL helper
  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (district) params.set("district", district);
    if (taluk) params.set("taluk", taluk);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minArea) params.set("minArea", minArea);
    if (maxArea) params.set("maxArea", maxArea);
    if (beds) params.set("beds", beds);
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (featured) params.set("featured", featured);
    if (p > 1) params.set("page", String(p));
    return `/search?${params.toString()}`;
  }

  const taluks = district ? (TALUKS_BY_DISTRICT[district] ?? []) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar ──────────────────────────── */}
        <aside className="lg:w-72 shrink-0">
          <SearchFilters
            currentType={type}
            currentDistrict={district}
            currentTaluk={taluk}
            currentMinPrice={minPrice}
            currentMaxPrice={maxPrice}
            currentMinArea={minArea}
            currentMaxArea={maxArea}
            currentBeds={beds}
            currentCategory={category}
            currentQ={q}
            currentSort={sort}
            districts={[...KERALA_DISTRICTS]}
            taluks={taluks}
          />
        </aside>

        {/* ── Results ──────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Suggestion banner */}
          {isSuggestion && q && total > 0 && (
            <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              No exact match for &ldquo;{q}&rdquo; — showing closest available properties.
            </div>
          )}

          {/* Top bar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-semibold text-ink">
                {total === 0
                  ? "No properties found"
                  : `${total} propert${total === 1 ? "y" : "ies"} found`}
              </h1>
              {(type || district || category || beds) && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {type && (
                    <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-brand/10 text-emerald-brand">
                      {TYPE_LABELS[type] ?? type}
                    </span>
                  )}
                  {category && (
                    <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-forest/10 text-forest">
                      {CATEGORY_LABELS[category] ?? category}
                    </span>
                  )}
                  {district && (
                    <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-mist border border-border text-ink">
                      {district}
                    </span>
                  )}
                  {beds && (
                    <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-mist border border-border text-ink">
                      {beds}+ BHK
                    </span>
                  )}
                </div>
              )}
            </div>

            <SortSelect defaultValue={sort} />
          </div>

          {/* Results or empty state */}
          {plainListings.length === 0 && !fallbackListings ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-mist border border-border flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </div>
              <h2 className="text-xl font-semibold text-forest mb-2">No properties found</h2>
              <p className="text-muted-foreground max-w-xs mb-6">
                Try broadening your search by removing some filters or changing the district.
              </p>
              <Link href="/search" className="px-5 py-2.5 rounded-xl bg-emerald-brand text-cream text-sm font-medium hover:bg-leaf transition-colors">
                Clear all filters
              </Link>
            </div>
          ) : (
            <>
              {fallbackListings && (
                <div className="flex items-start gap-3 mb-5 px-4 py-3.5 rounded-xl bg-emerald-brand/6 border border-emerald-brand/15 text-sm text-forest">
                  <svg className="w-4 h-4 shrink-0 mt-0.5 text-emerald-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  <span className="font-medium">{fallbackLabel}</span>
                </div>
              )}
              <SearchResultsView listings={fallbackListings ?? plainListings} />
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <Link
                  href={pageUrl(page - 1)}
                  className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-mist transition-colors"
                >
                  ← Prev
                </Link>
              )}

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p: number;
                if (totalPages <= 5) {
                  p = i + 1;
                } else if (page <= 3) {
                  p = i + 1;
                } else if (page >= totalPages - 2) {
                  p = totalPages - 4 + i;
                } else {
                  p = page - 2 + i;
                }
                return (
                  <Link
                    key={p}
                    href={pageUrl(p)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-emerald-brand text-cream"
                        : "border border-border hover:bg-mist text-ink"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}

              {page < totalPages && (
                <Link
                  href={pageUrl(page + 1)}
                  className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-mist transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
