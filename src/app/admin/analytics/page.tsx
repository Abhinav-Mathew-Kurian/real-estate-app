import { Metadata } from "next";
import dynamic from "next/dynamic";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Lead from "@/models/Lead";

const AnalyticsDashboard = dynamic(
  () => import("./AnalyticsDashboard").then((m) => ({ default: m.AnalyticsDashboard })),
  { ssr: false }
);

export const metadata: Metadata = { title: "Analytics" };

async function getAnalyticsData() {
  await connectDB();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    listingStats,
    totalViews,
    totalEnquiries,
    topViewed,
    leadsBySource,
    leadsByStatus,
    recentLeads,
    dailyLeads,
  ] = await Promise.all([
    // Listing count by status
    Listing.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // Total view count across all published listings
    Listing.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: null, total: { $sum: "$viewCount" } } },
    ]),

    // Total enquiry count
    Listing.aggregate([
      { $group: { _id: null, total: { $sum: "$enquiryCount" } } },
    ]),

    // Top 8 viewed listings
    Listing.find({ status: "published" })
      .sort({ viewCount: -1 })
      .limit(8)
      .select("title slug viewCount enquiryCount district")
      .lean(),

    // Leads by source (last 30d)
    Lead.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $ifNull: ["$utm.source", "$source", "direct"] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),

    // Leads by status
    Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // New leads in last 7 days
    Lead.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),

    // Daily leads last 30d
    Lead.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          leads: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const statusMap: Record<string, number> = {};
  for (const s of listingStats) statusMap[s._id as string] = s.count as number;

  const sourceMap: Record<string, number> = {};
  for (const s of leadsBySource) sourceMap[(s._id as string) || "direct"] = s.count as number;

  const statusLeadMap: Record<string, number> = {};
  for (const s of leadsByStatus) statusLeadMap[s._id as string] = s.count as number;

  // Fill in last 30 daily entries (0 for missing days)
  const dailyMap: Record<string, number> = {};
  for (const d of dailyLeads) dailyMap[d._id as string] = d.leads as number;
  const dailyData: { date: string; leads: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyData.push({ date: key.slice(5), leads: dailyMap[key] ?? 0 });
  }

  return {
    publishedCount: statusMap.published ?? 0,
    draftCount: statusMap.draft ?? 0,
    soldCount: statusMap.sold ?? 0,
    totalViews: (totalViews[0]?.total as number) ?? 0,
    totalEnquiries: (totalEnquiries[0]?.total as number) ?? 0,
    newLeads7d: recentLeads,
    totalLeads: Object.values(statusLeadMap).reduce((a, b) => a + b, 0),
    topViewed: topViewed.map((l) => ({
      title: l.title as string,
      slug: l.slug as string,
      views: l.viewCount as number,
      enquiries: l.enquiryCount as number,
      district: l.district as string,
    })),
    leadsBySource: Object.entries(sourceMap).map(([source, count]) => ({
      source: source || "direct",
      count,
    })),
    leadsByStatus: [
      { status: "New", count: statusLeadMap.new ?? 0 },
      { status: "Contacted", count: statusLeadMap.contacted ?? 0 },
      { status: "Closed", count: statusLeadMap.closed ?? 0 },
    ],
    dailyLeads: dailyData,
  };
}

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-forest">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Property views, leads, and enquiries — last 30 days
        </p>
      </div>
      <AnalyticsDashboard data={data} />
    </div>
  );
}
