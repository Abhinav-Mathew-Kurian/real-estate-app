"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full bg-sage/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-brand" />
        </div>
        <h3 className="font-semibold text-forest text-lg mb-2">Message sent!</h3>
        <p className="text-muted-foreground text-sm">We&apos;ll get back to you within one business day.</p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-5 text-xs text-emerald-brand hover:text-leaf transition-colors underline underline-offset-2 cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  const fieldClass =
    "w-full border border-border rounded-xl px-3.5 py-2.5 text-sm bg-mist text-ink placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-brand transition-shadow";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Full Name <span className="text-laterite">*</span></label>
        <input type="text" required placeholder="Your name" className={fieldClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Phone Number <span className="text-laterite">*</span></label>
        <input type="tel" required placeholder="+91 98765 43210" className={fieldClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Email <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input type="email" placeholder="your@email.com" className={fieldClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Message</label>
        <textarea
          rows={4}
          placeholder="What are you looking for? Any specific district, budget, or type?"
          className={`${fieldClass} resize-none`}
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-emerald-brand hover:bg-leaf text-cream font-semibold text-sm transition-colors cursor-pointer"
      >
        Send Message
      </button>
    </form>
  );
}
