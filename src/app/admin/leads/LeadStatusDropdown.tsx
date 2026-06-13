"use client";

import { useState } from "react";

type Props = {
  leadId: string;
  currentStatus: string;
  statusStyles: Record<string, string>;
};

const OPTIONS = [
  { label: "New",       value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Closed",    value: "closed" },
];

const ACTIVE: Record<string, string> = {
  new:       "bg-blue-500 text-white border-blue-500",
  contacted: "bg-amber-400 text-white border-amber-400",
  closed:    "bg-emerald-500 text-white border-emerald-500",
};

export function LeadStatusDropdown({ leadId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function pick(val: string) {
    if (val === status || saving) return;
    setSaving(true);
    try {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: val }),
      });
      setStatus(val);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`flex gap-1 ${saving ? "opacity-60 pointer-events-none" : ""}`}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => pick(o.value)}
          className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg border transition-all cursor-pointer ${
            status === o.value
              ? ACTIVE[o.value]
              : "bg-transparent text-muted-foreground border-border/60 hover:border-border hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
