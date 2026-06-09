"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadFormData } from "@/lib/schemas/listing";
import { Loader2, CheckCircle } from "lucide-react";

type EnquiryFormProps = {
  listingId: string;
  listingTitle: string;
};

export function EnquiryForm({ listingId, listingTitle }: EnquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [utm, setUtm] = useState<{ source?: string; medium?: string; campaign?: string }>({});

  // Read UTM from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("utm");
      if (stored) setUtm(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      listingId,
      listingTitleSnapshot: listingTitle,
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(data: LeadFormData) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, utm, source: "listing_detail" }),
      });

      if (!res.ok) throw new Error("Failed to submit");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-10 h-10 text-emerald-brand mx-auto mb-3" />
        <h3 className="font-semibold text-forest text-base mb-1">Enquiry Received!</h3>
        <p className="text-sm text-muted-foreground">
          We&apos;ll contact you shortly to discuss this property.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-xs text-emerald-brand hover:underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <h3 className="font-semibold text-forest text-sm mb-1">Enquire About This Property</h3>

      {status === "error" && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          Something went wrong. Please try again or call us directly.
        </div>
      )}

      {/* Name */}
      <div>
        <input
          {...register("name")}
          type="text"
          placeholder="Full Name *"
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-mist text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand"
        />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <input
          {...register("phone")}
          type="tel"
          placeholder="Phone Number * (e.g. 9876543210)"
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-mist text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand"
        />
        {errors.phone && (
          <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Email (optional)"
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-mist text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand"
        />
      </div>

      {/* Message */}
      <div>
        <textarea
          {...register("message")}
          rows={3}
          placeholder="Any specific questions or requirements?"
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-mist text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand resize-none"
        />
      </div>

      {/* Hidden fields */}
      <input type="hidden" {...register("listingId")} />
      <input type="hidden" {...register("listingTitleSnapshot")} />

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full py-3 rounded-xl bg-emerald-brand hover:bg-leaf disabled:opacity-60 text-cream font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send Enquiry"
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        We&apos;ll respond within a few hours.
      </p>
    </form>
  );
}
