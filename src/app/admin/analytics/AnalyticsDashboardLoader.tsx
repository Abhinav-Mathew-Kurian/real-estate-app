"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { AnalyticsDashboard } from "./AnalyticsDashboard";

const AnalyticsDashboardDynamic = dynamic(
  () =>
    import("./AnalyticsDashboard").then((m) => ({ default: m.AnalyticsDashboard })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        Loading charts…
      </div>
    ),
  }
);

export function AnalyticsDashboardLoader(
  props: ComponentProps<typeof AnalyticsDashboard>
) {
  return <AnalyticsDashboardDynamic {...props} />;
}
