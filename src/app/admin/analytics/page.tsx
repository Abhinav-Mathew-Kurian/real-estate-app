import { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-forest">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Charts and insights — built in Phase 8.
        </p>
      </div>
      <div className="bg-cream rounded-2xl border border-border p-12 text-center text-muted-foreground">
        Analytics dashboard coming in Phase 8.
      </div>
    </div>
  );
}
