import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { KERALA_DISTRICTS } from "@/lib/geo-data";
import { SearchBar } from "@/components/public/SearchBar";
import { ListingCard } from "@/components/public/ListingCard";
import {
  HeroContainer,
  HeroItem,
} from "@/components/public/HeroAnimations";
import type { IListing } from "@/models/Listing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Kerala – Find Your Dream Home or Land in Kerala",
  description:
    "Browse premium homes, plots, villas, and land for sale, rent, and lease across Kerala. Expert local agents, transparent pricing.",
};

export const revalidate = 60;

async function getHomePageData() {
  await connectDB();

  const [featured, recent, typeCounts] = await Promise.all([
    Listing.find({ status: "published", isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Listing.find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    Listing.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap: Record<string, number> = {};
  for (const c of typeCounts) countMap[c._id as string] = c.count as number;

  return {
    featured: featured.map((l) => ({
      ...l,
      _id: l._id.toString(),
    })) as unknown as IListing[],
    recent: recent.map((l) => ({
      ...l,
      _id: l._id.toString(),
    })) as unknown as IListing[],
    countMap,
  };
}

const PROPERTY_TYPES = [
  {
    type: "SELL_HOME",
    label: "Homes for Sale",
    icon: "🏠",
    description: "Villas, apartments & houses",
    href: "/search?type=SELL_HOME",
  },
  {
    type: "SELL_LAND",
    label: "Land for Sale",
    icon: "🌿",
    description: "Plots, agricultural & commercial",
    href: "/search?type=SELL_LAND",
  },
  {
    type: "RENT",
    label: "Rental Properties",
    icon: "🔑",
    description: "Monthly rental homes",
    href: "/search?type=RENT",
  },
  {
    type: "LEASE",
    label: "Lease Properties",
    icon: "📋",
    description: "Long-term lease options",
    href: "/search?type=LEASE",
  },
];

const TRUST_POINTS = [
  {
    icon: "🌴",
    title: "Local Expertise",
    description:
      "Deep knowledge of every district, taluk, and village across Kerala.",
  },
  {
    icon: "💎",
    title: "Transparent Pricing",
    description:
      "Fair value references and honest market pricing — no hidden fees.",
  },
  {
    icon: "🤝",
    title: "End-to-End Support",
    description:
      "From search to registration, we guide you through every step.",
  },
  {
    icon: "⚡",
    title: "Verified Listings",
    description: "Every property is personally verified by our ground team.",
  },
];

export default async function HomePage() {
  const { featured, recent, countMap } = await getHomePageData();

  return (
    <div className="min-h-screen bg-mist">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1602940659805-770d1b3b9911?w=1920&q=80"
          alt="Kerala backwaters with coconut palms"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark green scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest/85 via-forest/65 to-forest/85" />

        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto pt-24">
          <HeroContainer>
            <HeroItem>
              <span className="inline-block text-sage text-sm font-semibold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full border border-sage/40 bg-sage/10">
                God&apos;s Own Country Real Estate
              </span>
            </HeroItem>

            <HeroItem>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-6">
                Find Your
                <span className="block text-sage">Dream Home</span>
                in Kerala
              </h1>
            </HeroItem>

            <HeroItem>
              <p className="text-cream/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Premium homes, land, villas, and commercial properties across all
                14 districts. Trusted by thousands of Kerala families.
              </p>
            </HeroItem>

            <HeroItem>
              <div className="max-w-3xl mx-auto">
                <Suspense>
                  <SearchBar />
                </Suspense>
              </div>
            </HeroItem>
          </HeroContainer>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-cream/50">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <span className="block w-px h-8 bg-cream/20 animate-pulse" />
        </div>
      </section>

      {/* ── Property Types ─────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-forest mb-3">
              Browse by Type
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Find exactly what you&apos;re looking for — homes, land, rentals, or
              long-term leases.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {PROPERTY_TYPES.map((pt) => (
              <Link
                key={pt.type}
                href={pt.href}
                className="group flex flex-col items-center text-center p-6 bg-cream rounded-2xl border border-border hover:border-emerald-brand hover:shadow-md transition-all duration-200"
              >
                <span className="text-4xl mb-4">{pt.icon}</span>
                <span className="font-semibold text-forest text-sm mb-1">
                  {pt.label}
                </span>
                <span className="text-xs text-muted-foreground mb-3">
                  {pt.description}
                </span>
                {countMap[pt.type] !== undefined && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-sage/30 text-forest">
                    {countMap[pt.type]} listing
                    {countMap[pt.type] !== 1 ? "s" : ""}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ──────────────────────── */}
      {featured.length > 0 && (
        <section className="py-16 px-4 bg-cream">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold text-forest mb-2">
                  Featured Properties
                </h2>
                <p className="text-muted-foreground">
                  Hand-picked premium listings across Kerala
                </p>
              </div>
              <Link
                href="/search?featured=true"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-emerald-brand hover:text-leaf transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((listing, i) => (
                <ListingCard
                  key={listing._id?.toString()}
                  listing={listing}
                  priority={i < 3}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Browse by District ─────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-forest mb-3">
              Browse by District
            </h2>
            <p className="text-muted-foreground">
              Properties across all 14 districts of Kerala
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {KERALA_DISTRICTS.map((district) => (
              <Link
                key={district}
                href={`/search?district=${district}`}
                className="px-4 py-2 rounded-full border border-border bg-cream text-sm font-medium text-ink hover:bg-emerald-brand hover:text-cream hover:border-emerald-brand transition-all duration-200"
              >
                {district}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Listings ────────────────────────── */}
      {recent.length > 0 && (
        <section className="py-16 px-4 bg-cream">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold text-forest mb-2">
                  Latest Properties
                </h2>
                <p className="text-muted-foreground">
                  Freshly listed across Kerala
                </p>
              </div>
              <Link
                href="/search"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-emerald-brand hover:text-leaf transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recent.map((listing) => (
                <ListingCard
                  key={listing._id?.toString()}
                  listing={listing}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trust Strip ───────────────────────────── */}
      <section className="py-16 px-4 bg-forest">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-cream mb-3">
              Why Choose Sell Kerala?
            </h2>
            <p className="text-mist/70 max-w-lg mx-auto">
              We know Kerala — every backwater, every hill station, every urban
              hub.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="text-center">
                <span className="text-4xl block mb-4">{point.icon}</span>
                <h3 className="text-cream font-semibold text-lg mb-2">
                  {point.title}
                </h3>
                <p className="text-mist/60 text-sm leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-brand to-forest text-cream">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6">
            Ready to Find Your Property?
          </h2>
          <p className="text-cream/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Let our experts help you find the perfect home, land, or commercial
            space anywhere in Kerala. Free consultation, zero hidden charges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cream text-forest font-bold text-base hover:bg-mist transition-colors"
            >
              Browse All Properties
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-cream/60 text-cream font-bold text-base hover:bg-cream/10 transition-colors"
            >
              Talk to an Expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
