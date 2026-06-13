import { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Listing from "@/lib/db/models/Listing";
import Lead from "@/lib/db/models/Lead";
import { formatINR, formatDate } from "@/lib/format";
import { PlusCircle, Building2, Users, Eye, Star, ArrowUpRight, Phone, Mail, BarChart3 } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData() {
  await connectDB();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [publishedCount, draftCount, featuredCount, totalLeads, newLeads, viewsAgg, recentListings, recentLeads, newLeadsToday] =
    await Promise.all([
      Listing.countDocuments({ status: "published" }),
      Listing.countDocuments({ status: "draft" }),
      Listing.countDocuments({ status: "published", isFeatured: true }),
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Listing.aggregate([{ $match: { status: "published" } }, { $group: { _id: null, total: { $sum: "$viewCount" } } }]),
      Listing.find().sort({ createdAt: -1 }).limit(5).select("title type status district createdAt askingPrice isFeatured slug").lean(),
      Lead.find().sort({ createdAt: -1 }).limit(6).select("name phone email status createdAt listingTitleSnapshot").lean(),
      Lead.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
    ]);
  return {
    publishedCount, draftCount, featuredCount, totalLeads, newLeads, newLeadsToday,
    totalViews: (viewsAgg[0]?.total as number) ?? 0,
    recentListings: JSON.parse(JSON.stringify(recentListings)),
    recentLeads: JSON.parse(JSON.stringify(recentLeads)),
  };
}

const TYPE_DOT: Record<string, string> = {
  SELL_HOME: "bg-emerald-500",
  SELL_LAND: "bg-leaf",
  RENT:      "bg-laterite",
  LEASE:     "bg-blue-400",
};
const TYPE_SHORT: Record<string, string> = {
  SELL_HOME: "Sale", SELL_LAND: "Land", RENT: "Rent", LEASE: "Lease",
};
const STATUS_DOT: Record<string, string> = {
  published: "bg-emerald-500", draft: "bg-amber-400", sold: "bg-blue-400", archived: "bg-gray-300",
};
const LEAD_DOT: Record<string, string> = {
  new: "bg-blue-500", contacted: "bg-amber-400", closed: "bg-emerald-500",
};

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-ink tracking-tight">Dashboard</h1>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest hover:bg-emerald-brand text-cream rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add Listing
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Live", value: data.publishedCount, sub: `${data.draftCount} drafts`, Icon: Building2, color: "text-emerald-brand", bg: "bg-emerald-brand/8", href: "/admin/listings?status=published" },
          { label: "Leads", value: data.totalLeads, sub: `${data.newLeads} this week`, Icon: Users, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/leads" },
          { label: "Views", value: data.totalViews.toLocaleString(), sub: "all time", Icon: Eye, color: "text-forest", bg: "bg-forest/8", href: "/admin/analytics" },
          { label: "Featured", value: data.featuredCount, sub: "on homepage", Icon: Star, color: "text-laterite", bg: "bg-laterite/8", href: "/admin/listings?status=published" },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group bg-white rounded-2xl p-4 border border-black/[0.06] hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer"
          >
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.Icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-display font-bold text-ink leading-none">{s.value}</p>
            <p className="text-[11px] font-bold text-ink/40 uppercase tracking-wider mt-1">{s.label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* Today badge */}
      {data.newLeadsToday > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
          <p className="text-sm font-semibold text-blue-800">
            {data.newLeadsToday} new lead{data.newLeadsToday > 1 ? "s" : ""} today
          </p>
          <Link href="/admin/leads?status=new" className="ml-auto text-xs font-bold text-blue-600 hover:underline cursor-pointer">
            View →
          </Link>
        </div>
      )}

      {/* Two-column activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent listings */}
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.05]">
            <p className="text-sm font-bold text-ink">Recent Listings</p>
            <Link href="/admin/listings" className="text-[11px] font-bold text-emerald-brand hover:text-forest flex items-center gap-0.5 cursor-pointer">
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {data.recentListings.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No listings.{" "}
              <Link href="/admin/listings/new" className="text-emerald-brand font-medium hover:underline cursor-pointer">Add one →</Link>
            </div>
          ) : (
            <ul>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.recentListings.map((l: any) => (
                <li key={l._id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F7F9F6] transition-colors border-b border-black/[0.04] last:border-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[l.type] ?? "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {TYPE_SHORT[l.type]} · {l.district}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {l.askingPrice > 0 && <p className="text-xs font-bold text-forest">{formatINR(l.askingPrice)}</p>}
                    <div className="flex items-center gap-1 mt-0.5 justify-end">
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[l.status] ?? "bg-gray-300"}`} />
                      <p className="text-[11px] text-muted-foreground capitalize">{l.status}</p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/listings/${l._id}/edit`}
                    className="shrink-0 text-[11px] px-2 py-1 rounded-lg border border-border/60 hover:bg-mist text-muted-foreground hover:text-ink transition-colors cursor-pointer font-medium"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent leads */}
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.05]">
            <p className="text-sm font-bold text-ink flex items-center gap-2">
              Recent Leads
              {data.newLeads > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500 text-white leading-tight">
                  {data.newLeads}
                </span>
              )}
            </p>
            <Link href="/admin/leads" className="text-[11px] font-bold text-emerald-brand hover:text-forest flex items-center gap-0.5 cursor-pointer">
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {data.recentLeads.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No leads yet.</div>
          ) : (
            <ul>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.recentLeads.map((l: any) => (
                <li key={l._id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F7F9F6] transition-colors border-b border-black/[0.04] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-forest">{(l.name as string).charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{l.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{l.listingTitleSnapshot ?? "General enquiry"}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${LEAD_DOT[l.status] ?? "bg-gray-300"}`} />
                    <a href={`tel:${l.phone}`} className="p-1.5 rounded-lg bg-emerald-brand/8 hover:bg-emerald-brand/15 text-emerald-brand transition-colors cursor-pointer">
                      <Phone className="w-3 h-3" />
                    </a>
                    {l.email && (
                      <a href={`mailto:${l.email}`} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer">
                        <Mail className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Analytics", href: "/admin/analytics", Icon: BarChart3, color: "text-forest", bg: "bg-forest/8" },
          { label: "All Leads", href: "/admin/leads",     Icon: Users,    color: "text-blue-600", bg: "bg-blue-50" },
          { label: "All Listings", href: "/admin/listings", Icon: Building2, color: "text-emerald-brand", bg: "bg-emerald-brand/8" },
        ].map((q) => (
          <Link
            key={q.label}
            href={q.href}
            className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-black/[0.06] hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <span className={`w-7 h-7 rounded-lg ${q.bg} flex items-center justify-center shrink-0`}>
              <q.Icon className={`w-3.5 h-3.5 ${q.color}`} />
            </span>
            <span className="text-sm font-semibold text-ink">{q.label}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 ml-auto transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
