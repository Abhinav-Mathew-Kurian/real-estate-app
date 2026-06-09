import { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Lead from "@/models/Lead";
import { formatINR, formatDate } from "@/lib/format";
import { PlusCircle, Building2, Users, Eye, Star, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData() {
  await connectDB();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    publishedCount,
    draftCount,
    featuredCount,
    totalLeads,
    newLeads,
    viewsAgg,
    recentListings,
    recentLeads,
  ] = await Promise.all([
    Listing.countDocuments({ status: "published" }),
    Listing.countDocuments({ status: "draft" }),
    Listing.countDocuments({ status: "published", isFeatured: true }),
    Lead.countDocuments(),
    Lead.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Listing.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: null, total: { $sum: "$viewCount" } } },
    ]),
    Listing.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title type status district createdAt askingPrice isFeatured slug")
      .lean(),
    Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name phone status createdAt listingTitleSnapshot")
      .lean(),
  ]);

  return {
    publishedCount,
    draftCount,
    featuredCount,
    totalLeads,
    newLeads,
    totalViews: (viewsAgg[0]?.total as number) ?? 0,
    recentListings: JSON.parse(JSON.stringify(recentListings)),
    recentLeads: JSON.parse(JSON.stringify(recentLeads)),
  };
}

const TYPE_SHORT: Record<string, string> = {
  SELL_HOME: "Sale",
  SELL_LAND: "Land",
  RENT: "Rent",
  LEASE: "Lease",
};

const STATUS_DOT: Record<string, string> = {
  published: "bg-emerald-500",
  draft: "bg-amber-400",
  sold: "bg-blue-500",
  archived: "bg-gray-400",
};

const LEAD_STATUS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border border-blue-200",
  contacted: "bg-amber-50 text-amber-700 border border-amber-200",
  closed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const stats = [
    {
      label: "Published",
      value: data.publishedCount,
      sub: `${data.draftCount} draft`,
      Icon: Building2,
      accent: "bg-emerald-brand/10",
      color: "text-emerald-brand",
      href: "/admin/listings?status=published",
    },
    {
      label: "Total Leads",
      value: data.totalLeads,
      sub: `${data.newLeads} new this week`,
      Icon: Users,
      accent: "bg-blue-50",
      color: "text-blue-600",
      href: "/admin/leads",
    },
    {
      label: "Total Views",
      value: data.totalViews,
      sub: "All published listings",
      Icon: Eye,
      accent: "bg-forest/10",
      color: "text-forest",
      href: "/admin/analytics",
    },
    {
      label: "Featured",
      value: data.featuredCount,
      sub: "Featured listings",
      Icon: Star,
      accent: "bg-laterite/10",
      color: "text-laterite",
      href: "/admin/listings",
    },
  ];

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-forest">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of listings, leads, and performance.
          </p>
        </div>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-brand hover:bg-leaf text-cream rounded-xl text-sm font-semibold transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Add Listing
        </Link>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-cream rounded-2xl border border-border p-5 hover:border-emerald-brand/40 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-medium text-muted-foreground leading-snug pr-1">{s.label}</span>
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.accent}`}>
                <s.Icon className={`w-4 h-4 ${s.color}`} />
              </span>
            </div>
            <p className="text-3xl font-bold text-ink font-display leading-none mb-1.5">
              {s.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent activity: two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-cream rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-forest">Recent Listings</h2>
            <Link
              href="/admin/listings"
              className="text-xs text-emerald-brand hover:underline flex items-center gap-0.5"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {data.recentListings.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No listings yet.{" "}
              <Link href="/admin/listings/new" className="text-emerald-brand hover:underline">
                Add one
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.recentListings.map((l: any) => (
                <li
                  key={l._id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-mist/40 transition-colors"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[l.status] ?? "bg-gray-400"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {TYPE_SHORT[l.type] ?? l.type} · {l.district}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{formatDate(l.createdAt)}</p>
                    {l.askingPrice > 0 && (
                      <p className="text-xs font-semibold text-forest mt-0.5">
                        {formatINR(l.askingPrice)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-cream rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-forest flex items-center gap-2">
              Recent Leads
              {data.newLeads > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white leading-none">
                  {data.newLeads} new
                </span>
              )}
            </h2>
            <Link
              href="/admin/leads"
              className="text-xs text-emerald-brand hover:underline flex items-center gap-0.5"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {data.recentLeads.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No leads yet.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.recentLeads.map((l: any) => (
                <li
                  key={l._id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-mist/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-forest">
                      {(l.name as string).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{l.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {l.listingTitleSnapshot ?? "General enquiry"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        LEAD_STATUS[l.status] ?? ""
                      }`}
                    >
                      {l.status}
                    </span>
                    <p className="text-xs text-muted-foreground">{formatDate(l.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
