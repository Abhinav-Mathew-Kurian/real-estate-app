import { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { formatINR, formatArea, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Pencil, Star } from "lucide-react";

export const metadata: Metadata = { title: "Listings" };

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
  published: "bg-green-50 text-green-700 border-green-200",
  sold: "bg-blue-50 text-blue-700 border-blue-200",
  archived: "bg-gray-50 text-gray-500 border-gray-200",
};

const TYPE_LABELS: Record<string, string> = {
  SELL_HOME: "Sale – Home",
  SELL_LAND: "Sale – Land",
  RENT: "Rent",
  LEASE: "Lease",
};

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: { type?: string; status?: string; q?: string; page?: string };
}) {
  await connectDB();

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 20;
  const filter: Record<string, unknown> = {};

  if (searchParams.type) filter.type = searchParams.type;
  if (searchParams.status) filter.status = searchParams.status;
  else filter.status = { $ne: "archived" };

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Listing.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

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
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-brand hover:bg-leaf text-cream rounded-lg text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Listing
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        {[
          { label: "All", type: undefined, status: undefined },
          { label: "Published", type: undefined, status: "published" },
          { label: "Draft", type: undefined, status: "draft" },
          { label: "Sold", type: undefined, status: "sold" },
        ].map((f) => {
          const isActive =
            (!f.status && !searchParams.status) ||
            f.status === searchParams.status;
          return (
            <Link
              key={f.label}
              href={`/admin/listings?${f.status ? `status=${f.status}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-emerald-brand text-cream"
                  : "bg-mist border border-border text-muted-foreground hover:text-ink"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-cream rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-mist/50">
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No listings found.{" "}
                  <Link href="/admin/listings/new" className="text-emerald-brand underline">
                    Add your first listing
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing) => (
                <TableRow key={listing._id.toString()} className="hover:bg-mist/30">
                  <TableCell className="font-medium max-w-[220px] truncate">
                    <div className="flex items-center gap-1.5">
                      {listing.isFeatured && (
                        <Star className="w-3.5 h-3.5 text-laterite shrink-0" />
                      )}
                      <span className="truncate">{listing.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {TYPE_LABELS[listing.type] ?? listing.type}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {listing.village}, {listing.district}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatINR(listing.askingPrice)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex text-xs px-2 py-0.5 rounded-full border font-medium ${
                        STATUS_STYLES[listing.status] ?? ""
                      }`}
                    >
                      {listing.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(listing.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/listings/${listing._id.toString()}/edit`}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-mist transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/listings?page=${page - 1}&${new URLSearchParams(
                  Object.fromEntries(
                    Object.entries(searchParams).filter(([, v]) => v)
                  ) as Record<string, string>
                )}`}
                className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-mist transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/listings?page=${page + 1}&${new URLSearchParams(
                  Object.fromEntries(
                    Object.entries(searchParams).filter(([, v]) => v)
                  ) as Record<string, string>
                )}`}
                className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-mist transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
