import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Lead from "@/lib/db/models/Lead";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import { Phone, Mail, MessageSquare, ExternalLink } from "lucide-react";
import { LeadStatusDropdown } from "./LeadStatusDropdown";

export const metadata: Metadata = { title: "Leads" };

const STATUS_STYLES: Record<string, string> = {
  new:       "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  closed:    "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_BORDER: Record<string, string> = {
  new:       "border-l-blue-400",
  contacted: "border-l-amber-400",
  closed:    "border-l-emerald-500",
};

const AVATAR_BG = [
  "bg-forest/15 text-forest",
  "bg-blue-100 text-blue-700",
  "bg-laterite/15 text-laterite",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
];

export default async function AdminLeadsPage(props: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  await connectDB();

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 18;
  const filter: Record<string, unknown> = {};
  if (searchParams.status) filter.status = searchParams.status;

  const [leads, total, newCount, contactedCount, closedCount] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("listing", "title slug").lean(),
    Lead.countDocuments(filter),
    Lead.countDocuments({ status: "new" }),
    Lead.countDocuments({ status: "contacted" }),
    Lead.countDocuments({ status: "closed" }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const FILTERS = [
    { label: "All",       value: "",          count: newCount + contactedCount + closedCount },
    { label: "New",       value: "new",        count: newCount },
    { label: "Contacted", value: "contacted",  count: contactedCount },
    { label: "Closed",    value: "closed",     count: closedCount },
  ];

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-ink tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground mt-1">{total} total enquir{total === 1 ? "y" : "ies"}</p>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "New", count: newCount,        bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",   dot: "bg-blue-500" },
          { label: "Contacted", count: contactedCount, bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",  dot: "bg-amber-400" },
          { label: "Closed", count: closedCount,     bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
        ].map((s) => (
          <Link
            key={s.label}
            href={`/admin/leads?status=${s.label.toLowerCase()}`}
            className={`${s.bg} ${s.border} border rounded-xl p-4 hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${s.dot} shrink-0`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${s.text}`}>{s.label}</span>
            </div>
            <p className={`text-3xl font-display font-bold mt-2 ${s.text}`}>{s.count}</p>
          </Link>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const isActive = f.value === (searchParams.status ?? "");
          return (
            <Link
              key={f.label}
              href={`/admin/leads${f.value ? `?status=${f.value}` : ""}`}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-forest text-cream shadow-sm"
                  : "bg-white border border-border/60 text-muted-foreground hover:text-ink hover:border-border"
              }`}
            >
              {f.label}
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-cream" : "bg-black/5 text-ink/50"}`}>
                {f.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Lead cards grid */}
      {leads.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-2xl border border-black/[0.06]">
          <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm font-semibold text-ink mb-1">No leads yet</p>
          <p className="text-sm text-muted-foreground">Enquiries from your listings will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {leads.map((lead, idx) => {
            const avatarCls = AVATAR_BG[idx % AVATAR_BG.length];
            const borderCls = STATUS_BORDER[lead.status] ?? "border-l-gray-300";
            const listingRef = lead.listing as { title?: string; slug?: string } | undefined;

            return (
              <div
                key={lead._id.toString()}
                className={`bg-white rounded-2xl border border-black/[0.06] border-l-4 ${borderCls} p-5 flex flex-col gap-4`}
              >
                {/* Top: avatar + name + date + badge */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${avatarCls}`}>
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-ink text-sm leading-tight">{lead.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize shrink-0 ${STATUS_STYLES[lead.status] ?? ""}`}>
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(lead.createdAt)}</p>
                  </div>
                </div>

                {/* Contact actions */}
                <div className="flex gap-2">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-brand/8 hover:bg-emerald-brand/15 text-emerald-brand text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {lead.phone}
                  </a>
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Property */}
                {(listingRef?.title || lead.listingTitleSnapshot) && (
                  <div className="px-3 py-2 bg-[#F4F6F3] rounded-xl">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Property</p>
                    {listingRef?.slug ? (
                      <Link
                        href={`/listing/${listingRef.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-brand hover:underline cursor-pointer"
                      >
                        <span className="truncate">{listingRef.title ?? lead.listingTitleSnapshot}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </Link>
                    ) : (
                      <p className="text-xs text-ink/70 truncate">{lead.listingTitleSnapshot}</p>
                    )}
                  </div>
                )}

                {/* Message */}
                {lead.message && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 border-t border-black/[0.04] pt-3">
                    &ldquo;{lead.message}&rdquo;
                  </p>
                )}

                {/* Status change */}
                <div className="border-t border-black/[0.04] pt-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Update Status</p>
                  <LeadStatusDropdown leadId={lead._id.toString()} currentStatus={lead.status} statusStyles={STATUS_STYLES} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages} · {total} leads</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/admin/leads?${searchParams.status ? `status=${searchParams.status}&` : ""}page=${page - 1}`}
                className="px-4 py-2 rounded-xl border border-border/60 bg-white text-sm hover:bg-mist transition-colors cursor-pointer">
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/admin/leads?${searchParams.status ? `status=${searchParams.status}&` : ""}page=${page + 1}`}
                className="px-4 py-2 rounded-xl border border-border/60 bg-white text-sm hover:bg-mist transition-colors cursor-pointer">
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
