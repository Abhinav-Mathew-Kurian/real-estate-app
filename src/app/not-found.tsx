import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-mist flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🌴</div>
        <h1 className="font-display text-5xl font-bold text-forest mb-3">404</h1>
        <p className="text-xl font-semibold text-ink mb-2">Page not found</p>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The property or page you&rsquo;re looking for may have been removed,
          sold, or never existed. Let&rsquo;s find you something better.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-emerald-brand hover:bg-leaf text-cream font-medium transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-border text-ink hover:bg-cream font-medium transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
