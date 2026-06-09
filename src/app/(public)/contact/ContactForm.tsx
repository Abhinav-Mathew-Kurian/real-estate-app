"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Phase 6 handles actual submission — this is UI only
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="font-semibold text-forest text-lg mb-2">Message sent!</h3>
        <p className="text-muted-foreground text-sm">We&apos;ll get back to you within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Full Name *</label>
        <input
          type="text"
          required
          placeholder="Your name"
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-mist text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Phone Number *</label>
        <input
          type="tel"
          required
          placeholder="+91 98765 43210"
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-mist text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Email (optional)</label>
        <input
          type="email"
          placeholder="your@email.com"
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-mist text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Message</label>
        <textarea
          rows={4}
          placeholder="What are you looking for? Any specific district, budget, or type?"
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-mist text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-emerald-brand hover:bg-leaf text-cream font-semibold text-sm transition-colors"
      >
        Send Message
      </button>
    </form>
  );
}
