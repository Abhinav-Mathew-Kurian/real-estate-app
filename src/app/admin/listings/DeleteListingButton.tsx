"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function DeleteListingButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "confirm" | "loading">("idle");

  async function handleDelete() {
    setPhase("loading");
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`"${title.slice(0, 30)}…" archived`);
        router.refresh();
      } else {
        toast.error("Failed to archive listing");
        setPhase("idle");
      }
    } catch {
      toast.error("Network error");
      setPhase("idle");
    }
  }

  if (phase === "confirm") {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-[11px] text-red-600 font-medium flex items-center gap-0.5 whitespace-nowrap">
          <AlertTriangle className="w-3 h-3" />
          Sure?
        </span>
        <button
          onClick={handleDelete}
          className="text-[11px] px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Yes
        </button>
        <button
          onClick={() => setPhase("idle")}
          className="text-[11px] px-2 py-1 rounded-md border border-border hover:bg-mist transition-colors text-ink"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setPhase("confirm")}
      disabled={phase === "loading"}
      title={`Archive "${title}"`}
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
    >
      {phase === "loading" ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
