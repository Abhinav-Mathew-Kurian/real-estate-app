import { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Listing from "@/lib/db/models/Listing";
import { formatINR, formatArea, formatDate } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Pencil, Star, ExternalLink, Search } from "lucide-react";
import { DeleteListingButton } from "./DeleteListingButton";

export const metadata: Metadata = { title: "Listings" };

const STATUS_STYLES: Record<string, string> = {
  draft:     "bg-yellow-50 text-yellow-700 border-yellow-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sold:      "bg-blue-50 text-blue-700 border-blue-200",
  archived:  "bg-gray-50 text-gray-500 border-gray-200",
};

const TYPE_LABELS: Record<string, string> = {
  SELL_HOME: "Sale – Home",
  SELL_LAND: "Sale – Land",
  RENT:      "Rent",
  LEASE:     "Lease",
};

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
    const q = searchParams.q.trim();
    const re = { $regex: q, $options: "i" };
    filter.$or = [
      { title: re },
      { village: re },
      { district: re },
      { taluk: re },
    ];
  }

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Listing.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const base = {
      type:   searchParams.type,
      status: searchParams.status,
      q:      searchParams.q,
      page:   searchParams.page,
      ...overrides,
    };
    for (const [k, v] of Object.entries(base)) {
      if (v) p.set(k, v);
    }
    return `/admin/listings?${p.toString()}`;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-forest">Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} total</p>
        </div>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-brand hover:bg-leaf text-cream rounded-xl text-sm font-semibold transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Listing
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search bar */}
        <form method="GET" action="/admin/listings" className="relative flex-1 max-w-xs">
          {searchParams.status && (
            <input type="hidden" name="status" value={searchParams.status} />
          )}
          {searchParams.type && (
            <input type="hidden" name="type" value={searchParams.type} />
          )}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="Search title, district…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30 focus:border-emerald-brand/50 transition-all"
          />
        </form>

        {/* Status chips */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "All",       status: undefined },
            { label: "Published", status: "published" },
            { label: "Draft",     status: "draft" },
            { label: "Sold",      status: "sold" },
            { label: "Archived",  status: "archived" },
          ].map((f) => {
            const isActive =
              (!f.status && !searchParams.status) || f.status === searchParams.status;
            return (
              <Link
                key={f.label}
                href={buildUrl({ status: f.status, page: undefined })}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-brand text-cream shadow-sm"
                    : "bg-cream border border-border text-muted-foreground hover:text-ink hover:border-ink/20"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-cream rounded-2xl border border-border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-mist/60 hover:bg-mist/60">
              <TableHead className="text-xs font-semibold text-muted-foreground">Title</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">Location</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">Price</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">Added</TableHead>
              <TableHead className="text-right text-xs font-semibold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  {searchParams.q ? (
                    <>No results for &ldquo;{searchParams.q}&rdquo;. <Link href="/admin/listings" className="text-emerald-brand underline">Clear search</Link></>
                  ) : (
                    <>No listings found. <Link href="/admin/listings/new" className="text-emerald-brand underline">Add your first listing</Link></>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing) => (
                <TableRow key={listing._id.toString()} className="hover:bg-mist/20 transition-colors">
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      {listing.isFeatured && (
                        <Star className="w-3.5 h-3.5 text-laterite shrink-0" />
                      )}
                      <span className="truncate text-sm">{listing.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {TYPE_LABELS[listing.type] ?? listing.type}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
                    {listing.village}, {listing.district}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-forest hidden sm:table-cell whitespace-nowrap">
                    {formatINR(listing.askingPrice)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex text-[11px] px-2.5 py-1 rounded-full border font-semibold capitalize ${
                        STATUS_STYLES[listing.status] ?? ""
                      }`}
                    >
                      {listing.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                    {formatDate(listing.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {listing.status === "published" && listing.slug && (
                        <Link
                          href={`/listing/${listing.slug}`}
                          target="_blank"
                          title="View live listing"
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-mist text-muted-foreground hover:text-ink transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/listings/${listing._id.toString()}/edit`}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-mist transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <DeleteListingButton
                        id={listing._id.toString()}
                        title={listing.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {total} listings
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="px-3.5 py-2 rounded-xl border border-border text-sm hover:bg-mist transition-colors"
              >
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="px-3.5 py-2 rounded-xl border border-border text-sm hover:bg-mist transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
