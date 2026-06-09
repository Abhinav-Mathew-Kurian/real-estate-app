"use client";

import { useState } from "react";

type LeadStatusDropdownProps = {
  leadId: string;
  currentStatus: string;
  statusStyles: Record<string, string>;
};

const STATUS_OPTIONS = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Closed", value: "closed" },
];

export function LeadStatusDropdown({
  leadId,
  currentStatus,
  statusStyles,
}: LeadStatusDropdownProps) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setSaving(true);
    try {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      setStatus(newStatus);
    } catch {
      // revert on failure
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className={`text-xs px-2 py-1 rounded-full border font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-brand transition-opacity ${
        statusStyles[status] ?? "bg-mist text-ink border-border"
      } ${saving ? "opacity-50" : ""}`}
    >
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
