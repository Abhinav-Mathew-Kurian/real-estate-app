import Link from "next/link";
import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Listing from "@/lib/db/models/Listing";
import { KERALA_DISTRICTS } from "@/lib/geo-data";
import { SearchBar } from "@/components/search/SearchBar";
import { AISearchBox } from "@/components/search/AISearchBox";
import { ListingCard } from "@/components/listings/ListingCard";
import { HeroContainer, HeroItem } from "@/components/shared/HeroAnimations";
import {
  Home,
  Building2,
  Key,
  FileText,
  MapPin,
  CheckCircle,
  Phone,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import type { IListing } from "@/lib/db/models/Listing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Kerala – Premium Real Estate Across Kerala",
  description:
    "Browse premium homes, plots, villas, and land for sale, rent, and lease across all 14 districts of Kerala. Expert local agents, transparent pricing.",
};

export const revalidate = 60;

async function getHomePageData() {
  await connectDB();

  const [featured, recent, typeCounts, totalPublished] = await Promise.all([
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
    Listing.countDocuments({ status: "published" }),
  ]);

  const countMap: Record<string, number> = {};
  for (const c of typeCounts) countMap[c._id as string] = c.count as number;

  return {
    featured: JSON.parse(JSON.stringify(featured)) as IListing[],
    recent: JSON.parse(JSON.stringify(recent)) as IListing[],
    countMap,
    totalPublished,
  };
}

const PROPERTY_TYPES = [
  {
    type: "SELL_HOME",
    label: "Homes for Sale",
    description: "Villas, apartments & houses",
    href: "/search?type=SELL_HOME",
    Icon: Home,
    iconBg: "bg-emerald-brand/10",
    iconColor: "text-emerald-brand",
  },
  {
    type: "SELL_LAND",
    label: "Land for Sale",
    description: "Plots, agricultural & commercial",
    href: "/search?type=SELL_LAND",
    Icon: Building2,
    iconBg: "bg-forest/10",
    iconColor: "text-forest",
  },
  {
    type: "RENT",
    label: "Rental Properties",
    description: "Monthly rental homes",
    href: "/search?type=RENT",
    Icon: Key,
    iconBg: "bg-laterite/10",
    iconColor: "text-laterite",
  },
  {
    type: "LEASE",
    label: "Lease Properties",
    description: "Long-term lease options",
    href: "/search?type=LEASE",
    Icon: FileText,
    iconBg: "bg-sage/40",
    iconColor: "text-forest",
  },
];

const TRUST_POINTS = [
  {
    Icon: MapPin,
    title: "Local Expertise",
    description: "Deep knowledge of every district, taluk, and village across Kerala.",
  },
  {
    Icon: CheckCircle,
    title: "Transparent Pricing",
    description: "Fair value references and honest market pricing — no hidden fees.",
  },
  {
    Icon: Phone,
    title: "End-to-End Support",
    description: "From search to sale registration, our team guides you at every step.",
  },
  {
    Icon: ShieldCheck,
    title: "Verified Listings",
    description: "Every property is personally verified by our ground team before listing.",
  },
];

export default async function HomePage() {
  const { featured, recent, countMap, totalPublished } = await getHomePageData();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F1F7F4" }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-forest">
        {/* Ambient blobs */}
        <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] bg-emerald-brand/25 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[500px] h-[500px] bg-leaf/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-emerald-brand/8 rounded-full blur-[150px] pointer-events-none" />

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #95D5B2 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 w-full max-w-5xl mx-auto pt-24 pb-12">
          <HeroContainer>
            <HeroItem>
              <div className="inline-flex items-center gap-2 text-sage/80 text-xs font-semibold tracking-[0.15em] uppercase mb-8 px-5 py-2.5 rounded-full border border-sage/15 bg-white/5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse shrink-0" />
                Kerala&apos;s Premier Real Estate Platform
              </div>
            </HeroItem>

            <HeroItem>
              <h1 className="font-display font-bold text-cream leading-[1.02] tracking-tight mb-6">
                <span className="block text-5xl sm:text-7xl lg:text-8xl">Find Property</span>
                <span className="block text-5xl sm:text-7xl lg:text-8xl text-sage">in Kerala</span>
              </h1>
            </HeroItem>

            <HeroItem>
              <p className="text-cream/55 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light">
                Premium homes, plots, villas and commercial spaces across all 14 districts.
                Verified listings. Transparent pricing.
              </p>
            </HeroItem>

            <HeroItem>
              <div className="w-full max-w-3xl mx-auto space-y-3">
                <Suspense>
                  <SearchBar />
                </Suspense>
                <AISearchBox />
              </div>
            </HeroItem>
          </HeroContainer>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 border-t border-white/8">
          <div className="max-w-4xl mx-auto px-4 py-7 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { value: totalPublished > 10 ? `${totalPublished}+` : "500+", label: "Properties Listed" },
              { value: "14", label: "Kerala Districts" },
              { value: "10+", label: "Years of Experience" },
              { value: "2,000+", label: "Happy Families" },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-4 py-2">
                <div className="font-display text-3xl font-bold text-cream tracking-tight">{stat.value}</div>
                <div className="text-cream/40 text-xs mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Property Types ──────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-emerald-brand font-semibold text-xs tracking-[0.15em] uppercase mb-3">Browse by Type</p>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-forest leading-tight max-w-sm">
                What are you looking for?
              </h2>
              <Link
                href="/search"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-emerald-brand hover:text-leaf transition-colors shrink-0 pb-1"
              >
                View all listings <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {PROPERTY_TYPES.map(({ type, label, description, href, Icon, iconBg, iconColor }) => (
              <Link
                key={type}
                href={href}
                className="group relative flex flex-col p-6 sm:p-8 bg-cream rounded-3xl border border-border hover:border-emerald-brand/50 hover:shadow-2xl shadow-sm transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <h3 className="font-semibold text-forest text-base mb-1.5 leading-snug">{label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5">{description}</p>
                {(countMap[type] ?? 0) > 0 && (
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-mist text-forest w-fit">
                    {countMap[type]} listing{countMap[type] !== 1 ? "s" : ""}
                  </span>
                )}
                <ArrowRight className="absolute top-7 right-7 w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ───────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-24 px-4 bg-cream">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-14">
              <div>
                <p className="text-emerald-brand font-semibold text-xs tracking-[0.15em] uppercase mb-3">Hand-Picked</p>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-forest leading-tight">
                  Featured Properties
                </h2>
              </div>
              <Link
                href="/search?featured=true"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-emerald-brand hover:text-leaf transition-colors shrink-0 pb-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((listing, i) => (
                <ListingCard key={listing._id?.toString()} listing={listing} priority={i < 3} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Browse by District ──────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-emerald-brand font-semibold text-xs tracking-[0.15em] uppercase mb-3">All Kerala</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-forest leading-tight">
              Browse by District
            </h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {KERALA_DISTRICTS.map((district) => (
              <Link
                key={district}
                href={`/search?district=${district}`}
                className="px-5 py-2.5 rounded-xl border border-border bg-cream text-sm font-medium text-ink hover:bg-forest hover:text-cream hover:border-forest transition-all duration-200"
              >
                {district}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Listings ─────────────────────────────── */}
      {recent.length > 0 && (
        <section className="py-24 px-4 bg-cream">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-14">
              <div>
                <p className="text-emerald-brand font-semibold text-xs tracking-[0.15em] uppercase mb-3">Just Listed</p>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-forest leading-tight">
                  Latest Properties
                </h2>
              </div>
              <Link
                href="/search"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-emerald-brand hover:text-leaf transition-colors shrink-0 pb-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recent.map((listing) => (
                <ListingCard key={listing._id?.toString()} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Sell Kerala ─────────────────────────────── */}
      <section className="py-24 px-4 bg-forest">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-sage/70 font-semibold text-xs tracking-[0.15em] uppercase mb-3">Why Us</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-cream leading-tight max-w-lg">
              The Sell Kerala Difference
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST_POINTS.map(({ Icon, title, description }) => (
              <div key={title} className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-sage" />
                </div>
                <h3 className="text-cream font-semibold text-lg leading-snug">{title}</h3>
                <p className="text-mist/50 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-28 px-4 bg-mist">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-emerald-brand font-semibold text-xs tracking-[0.15em] uppercase mb-4">Get Started</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-forest mb-5 leading-tight">
            Ready to Find Your Property?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Let our Kerala property experts help you find exactly what you need —
            free consultation, zero hidden charges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-forest text-cream font-semibold text-base hover:bg-emerald-brand transition-colors"
            >
              Browse Properties <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-forest/20 text-forest font-semibold text-base hover:bg-forest hover:text-cream transition-colors"
            >
              Talk to an Expert
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
