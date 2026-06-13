import { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Listing from "@/lib/db/models/Listing";
import { formatINR, formatArea, formatDate } from "@/lib/format";
import { PlusCircle, Pencil, Star, ExternalLink, Search, LayoutList } from "lucide-react";
import { DeleteListingButton } from "./DeleteListingButton";

export const metadata: Metadata = { title: "Listings" };

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  draft:     { pill: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-400" },
  published: { pill: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  sold:      { pill: "bg-blue-50 text-blue-700 border-blue-200",      dot: "bg-blue-400" },
  archived:  { pill: "bg-gray-50 text-gray-500 border-gray-200",      dot: "bg-gray-300" },
};

const TYPE_LABELS: Record<string, { short: string; cls: string }> = {
  SELL_HOME: { short: "Sale",  cls: "bg-forest/8 text-forest" },
  SELL_LAND: { short: "Land",  cls: "bg-leaf/10 text-leaf" },
  RENT:      { short: "Rent",  cls: "bg-laterite/10 text-laterite" },
  LEASE:     { short: "Lease", cls: "bg-blue-50 text-blue-600" },
};

const STATUS_FILTERS = [
  { label: "All",       status: undefined },
  { label: "Published", status: "published" },
  { label: "Draft",     status: "draft" },
  { label: "Sold",      status: "sold" },
  { label: "Archived",  status: "archived" },
];

export default async function AdminListingsPage(props: {
  searchParams: Promise<{ type?: string; status?: string; q?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  await connectDB();

  const page  = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 20;
  const filter: Record<string, unknown> = {};
  if (searchParams.type)   filter.type = searchParams.type;
  if (searchParams.status) filter.status = searchParams.status;
  else                     filter.status = { $ne: "archived" };
  if (searchParams.q) {
    const q  = searchParams.q.trim();
    const re = { $regex: q, $options: "i" };
    filter.$or = [{ title: re }, { village: re }, { district: re }, { taluk: re }];
  }

  const [listings, total, countsByStatus] = await Promise.all([
    Listing.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Listing.countDocuments(filter),
    Promise.all([
      Listing.countDocuments({ status: "published" }),
      Listing.countDocuments({ status: "draft" }),
      Listing.countDocuments({ status: "sold" }),
    ]),
  ]);

  const [pubCount, draftCount, soldCount] = countsByStatus;
  const totalPages = Math.ceil(total / limit);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const base = { type: searchParams.type, status: searchParams.status, q: searchParams.q, page: searchParams.page, ...overrides };
    for (const [k, v] of Object.entries(base)) { if (v) p.set(k, v); }
    return `/admin/listings?${p.toString()}`;
  }

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink tracking-tight">Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-semibold text-emerald-brand">{pubCount}</span> published ·{" "}
            <span className="font-semibold text-amber-600">{draftCount}</span> draft ·{" "}
            <span className="font-semibold text-blue-500">{soldCount}</span> sold
          </p>
        </div>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-emerald-brand text-cream rounded-xl text-sm font-bold transition-colors shrink-0 cursor-pointer shadow-[0_2px_8px_rgba(27,67,50,0.25)]"
        >
          <PlusCircle className="w-4 h-4" />
          Add Listing
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form method="GET" action="/admin/listings" className="relative flex-1 max-w-sm">
          {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
          {searchParams.type   && <input type="hidden" name="type"   value={searchParams.type} />}
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
          <input
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="Search title, village, district…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.08] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/25 transition-all"
          />
        </form>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => {
            const active = (!f.status && !searchParams.status) || f.status === searchParams.status;
            return (
              <Link
                key={f.label}
                href={buildUrl({ status: f.status, page: undefined })}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-forest text-cream shadow-sm"
                    : "bg-white border border-black/[0.08] text-muted-foreground hover:text-ink hover:border-black/20"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
        {listings.length === 0 ? (
          <div className="py-24 text-center">
            <LayoutList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm font-semibold text-ink mb-1">
              {searchParams.q ? `No results for "${searchParams.q}"` : "No listings found"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchParams.q
                ? <Link href="/admin/listings" className="text-emerald-brand hover:underline cursor-pointer">Clear search</Link>
                : <Link href="/admin/listings/new" className="text-emerald-brand hover:underline cursor-pointer">Add your first listing →</Link>
              }
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F4F6F3] border-b border-black/[0.05]">
                <th className="text-left px-6 py-3 text-[11px] font-bold text-ink/40 uppercase tracking-wider">Property</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-ink/40 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-ink/40 uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-ink/40 uppercase tracking-wider hidden lg:table-cell">Area</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-ink/40 uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-ink/40 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-ink/40 uppercase tracking-wider hidden xl:table-cell">Added</th>
                <th className="text-right px-6 py-3 text-[11px] font-bold text-ink/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => {
                const st  = STATUS_STYLES[listing.status];
                const typ = TYPE_LABELS[listing.type];
                return (
                  <tr key={listing._id.toString()} className="border-b border-black/[0.04] hover:bg-[#F9FAF8] transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        {listing.isFeatured && <Star className="w-3.5 h-3.5 text-laterite shrink-0" />}
                        <span className="font-semibold text-ink truncate max-w-[180px]">{listing.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      {typ && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${typ.cls}`}>{typ.short}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
                      {listing.village}, {listing.district}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                      {listing.area?.value ? formatArea(listing.area.value, listing.area.unit) : "—"}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-forest whitespace-nowrap">
                      {listing.askingPrice > 0 ? formatINR(listing.askingPrice) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${st?.pill ?? ""}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st?.dot ?? "bg-gray-300"}`} />
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden xl:table-cell whitespace-nowrap">
                      {formatDate(listing.createdAt)}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {listing.status === "published" && listing.slug && (
                          <Link
                            href={`/listing/${listing.slug}`}
                            target="_blank"
                            title="View live"
                            className="p-1.5 rounded-lg border border-black/[0.08] hover:bg-mist text-muted-foreground hover:text-ink transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/listings/${listing._id.toString()}/edit`}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-black/[0.08] hover:bg-mist transition-colors cursor-pointer font-medium"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </Link>
                        <DeleteListingButton id={listing._id.toString()} title={listing.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages} · {total} listings</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })} className="px-4 py-2 rounded-xl border border-black/[0.08] bg-white text-sm hover:bg-mist transition-colors cursor-pointer">
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildUrl({ page: String(page + 1) })} className="px-4 py-2 rounded-xl border border-black/[0.08] bg-white text-sm hover:bg-mist transition-colors cursor-pointer">
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
