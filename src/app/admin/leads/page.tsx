import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Lead from "@/models/Lead";
import { formatDate } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";

export const metadata: Metadata = { title: "Leads" };

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
  closed: "bg-green-50 text-green-700 border-green-200",
};

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  await connectDB();

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 20;
  const filter: Record<string, unknown> = {};
  if (searchParams.status) filter.status = searchParams.status;

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("listing", "title slug")
      .lean(),
    Lead.countDocuments(filter),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-forest">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} total enquiries</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-4">
        {[
          { label: "All", value: "" },
          { label: "New", value: "new" },
          { label: "Contacted", value: "contacted" },
          { label: "Closed", value: "closed" },
        ].map((f) => {
          const isActive = f.value === (searchParams.status ?? "");
          return (
            <Link
              key={f.label}
              href={`/admin/leads${f.value ? `?status=${f.value}` : ""}`}
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

      <div className="bg-cream rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-mist/50">
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No leads yet.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead._id.toString()} className="hover:bg-mist/30">
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1 text-xs text-emerald-brand hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </a>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                        >
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm max-w-[180px] truncate">
                    {(lead.listing as { title?: string; slug?: string })?.title ??
                      lead.listingTitleSnapshot}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {lead.utm?.source ?? lead.source ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {lead.utm?.campaign ?? "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex text-xs px-2 py-0.5 rounded-full border font-medium ${
                        STATUS_STYLES[lead.status] ?? ""
                      }`}
                    >
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
