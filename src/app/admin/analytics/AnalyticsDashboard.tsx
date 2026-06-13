"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Eye, MessageSquare, Building2, TrendingUp } from "lucide-react";

type AnalyticsData = {
  publishedCount: number;
  draftCount: number;
  soldCount: number;
  totalViews: number;
  totalEnquiries: number;
  newLeads7d: number;
  totalLeads: number;
  topViewed: { title: string; slug: string; views: number; enquiries: number; district: string }[];
  leadsBySource: { source: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  dailyLeads: { date: string; leads: number }[];
};

const PIE_COLORS = ["#2D6A4F", "#40916C", "#95D5B2", "#B5651D", "#1B4332", "#74C69D"];
const STATUS_COLORS: Record<string, string> = {
  New: "#3B82F6",
  Contacted: "#F59E0B",
  Closed: "#10B981",
};

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
  borderColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  borderColor?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-black/[0.06] border-l-4 ${borderColor ?? "border-l-gray-200"} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ?? "bg-mist"}`}>
          {icon}
        </span>
      </div>
      <p className="text-[2.2rem] font-display font-bold text-ink leading-none tracking-tight mb-1">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Views" value={data.totalViews} sub="Across all published listings"
          icon={<Eye className="w-4 h-4 text-emerald-brand" />} accent="bg-emerald-brand/10" borderColor="border-l-emerald-brand" />
        <StatCard label="Total Leads" value={data.totalLeads} sub={`${data.newLeads7d} new this week`}
          icon={<MessageSquare className="w-4 h-4 text-blue-600" />} accent="bg-blue-50" borderColor="border-l-blue-500" />
        <StatCard label="Published Listings" value={data.publishedCount} sub={`${data.draftCount} draft · ${data.soldCount} sold`}
          icon={<Building2 className="w-4 h-4 text-laterite" />} accent="bg-laterite/10" borderColor="border-l-laterite" />
        <StatCard label="Total Enquiries" value={data.totalEnquiries} sub="Via listing enquiry forms"
          icon={<TrendingUp className="w-4 h-4 text-forest" />} accent="bg-forest/10" borderColor="border-l-forest" />
      </div>

      {/* Daily leads chart */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
        <h2 className="text-base font-bold text-ink mb-5">Daily Leads — Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.dailyLeads} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#5B6B63" }}
              tickLine={false}
              interval={4}
            />
            <YAxis tick={{ fontSize: 11, fill: "#5B6B63" }} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: 12 }}
              cursor={{ fill: "#F1F7F4" }}
            />
            <Bar dataKey="leads" fill="#2D6A4F" radius={[4, 4, 0, 0]} name="Leads" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leads by source + status pies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
          <h2 className="text-base font-bold text-ink mb-5">Leads by Source</h2>
          {data.leadsBySource.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No lead data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.leadsBySource}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {data.leadsBySource.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
          <h2 className="text-base font-bold text-ink mb-5">Lead Pipeline</h2>
          {data.leadsByStatus.every((s) => s.count === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-10">No lead data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={data.leadsByStatus}
                layout="vertical"
                margin={{ top: 4, right: 24, bottom: 0, left: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="status" tick={{ fontSize: 12 }} tickLine={false} width={70} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Leads">
                  {data.leadsByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#2D6A4F"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top viewed listings */}
      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.05]">
          <h2 className="text-base font-bold text-ink">Top Viewed Listings</h2>
        </div>
        {data.topViewed.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No published listings yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mist/50">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Property</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">District</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Views</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground">Enquiries</th>
              </tr>
            </thead>
            <tbody>
              {data.topViewed.map((l, i) => (
                <tr key={l.slug} className="border-t border-border hover:bg-mist/30 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground/60 w-4 text-right">{i + 1}</span>
                      <Link
                        href={`/listing/${l.slug}`}
                        target="_blank"
                        className="text-emerald-brand hover:underline font-medium line-clamp-1"
                      >
                        {l.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{l.district}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{l.views.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground">{l.enquiries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
