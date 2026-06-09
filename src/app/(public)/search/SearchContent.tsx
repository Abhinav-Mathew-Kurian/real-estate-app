import Link from "next/link";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";

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
import { ListingCard } from "@/components/public/ListingCard";
import { SearchFilters } from "./SearchFilters";
import { SortSelect } from "./SortSelect";
import type { IListing } from "@/models/Listing";

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
    const re = { $regex: q, $options: "i" };
    filter.$or = [{ title: re }, { description: re }, { village: re }, { district: re }];
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

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Listing.countDocuments(filter),
  ]);

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

          {/* Grid */}
          {plainListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-mist border border-border flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </div>
              <h2 className="text-xl font-semibold text-forest mb-2">
                No properties found
              </h2>
              <p className="text-muted-foreground max-w-xs mb-6">
                Try broadening your search by removing some filters or changing
                the district.
              </p>
              <Link
                href="/search"
                className="px-5 py-2.5 rounded-xl bg-emerald-brand text-cream text-sm font-medium hover:bg-leaf transition-colors"
              >
                Clear all filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {plainListings.map((listing) => (
                <ListingCard
                  key={listing._id?.toString()}
                  listing={listing}
                />
              ))}
            </div>
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
