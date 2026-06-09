import { Metadata } from "next";
import Link from "next/link";
import { ListFilter, Users, BarChart3, PlusCircle } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-forest">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back. Manage your listings, leads, and analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Listings", value: "—", icon: ListFilter, href: "/admin/listings" },
          { label: "Active Leads", value: "—", icon: Users, href: "/admin/leads" },
          { label: "Views This Week", value: "—", icon: BarChart3, href: "/admin/analytics" },
          { label: "Featured", value: "—", icon: PlusCircle, href: "/admin/listings" },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-cream rounded-2xl border border-border p-5 flex items-center gap-4 hover:border-emerald-brand transition-colors group"
          >
            <span className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center group-hover:bg-sage/30 transition-colors">
              <card.icon className="w-5 h-5 text-emerald-brand" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-ink">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-cream rounded-2xl border border-border p-6">
        <h2 className="font-semibold text-forest mb-1">Quick Actions</h2>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link
            href="/admin/listings/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-brand text-cream rounded-lg text-sm font-medium hover:bg-leaf transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Listing
          </Link>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 px-4 py-2 bg-mist border border-border text-ink rounded-lg text-sm font-medium hover:bg-sage/20 transition-colors"
          >
            <Users className="w-4 h-4" />
            View Leads
          </Link>
        </div>
      </div>
    </div>
  );
}
