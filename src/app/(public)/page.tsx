import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Listing from "@/lib/db/models/Listing";
import { KERALA_DISTRICTS } from "@/lib/geo-data";
import { ListingCard } from "@/components/listings/ListingCard";
import { HeroSearch } from "@/components/search/HeroSearch";
import {
  MapPin,
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
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

  const [featured, recent, typeCounts, totalPublished, districtCounts] = await Promise.all([
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
    Listing.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$district", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap: Record<string, number> = {};
  for (const c of typeCounts) countMap[c._id as string] = c.count as number;

  const districtCountMap: Record<string, number> = {};
  for (const c of districtCounts) districtCountMap[c._id as string] = c.count as number;

  return {
    featured: JSON.parse(JSON.stringify(featured)) as IListing[],
    recent: JSON.parse(JSON.stringify(recent)) as IListing[],
    countMap,
    totalPublished,
    districtCountMap,
  };
}

const PROPERTY_TYPES = [
  {
    type: "SELL_HOME",
    label: "Buy Home",
    description: "Villas, flats & houses",
    href: "/search?type=SELL_HOME",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    type: "SELL_LAND",
    label: "Buy Land",
    description: "Plots, agricultural & commercial",
    href: "/search?type=SELL_LAND",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
      </svg>
    ),
  },
  {
    type: "RENT",
    label: "Rent",
    description: "Monthly rental homes",
    href: "/search?type=RENT",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
      </svg>
    ),
  },
  {
    type: "LEASE",
    label: "Lease",
    description: "Long-term lease options",
    href: "/search?type=LEASE",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
];

const FEATURED_DISTRICTS = [
  {
    district: "Ernakulam",
    subtitle: "Kochi · Commercial Hub",
    href: "/search?district=Ernakulam",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
  },
  {
    district: "Thiruvananthapuram",
    subtitle: "Trivandrum · IT Capital",
    href: "/search?district=Thiruvananthapuram",
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  },
  {
    district: "Kozhikode",
    subtitle: "Calicut · Heritage Coast",
    href: "/search?district=Kozhikode",
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80",
  },
  {
    district: "Wayanad",
    subtitle: "Eco · Plantation Country",
    href: "/search?district=Wayanad",
    img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
  },
  {
    district: "Alappuzha",
    subtitle: "Alleppey · Backwaters",
    href: "/search?district=Alappuzha",
    img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
  },
  {
    district: "Thrissur",
    subtitle: "Cultural · Temple City",
    href: "/search?district=Thrissur",
    img: "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=600&q=80",
  },
  {
    district: "Idukki",
    subtitle: "Munnar · Highland Estates",
    href: "/search?district=Idukki",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
  {
    district: "Palakkad",
    subtitle: "Gateway · Agricultural Heart",
    href: "/search?district=Palakkad",
    img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
  },
];

export default async function HomePage() {
  const { featured, recent, countMap, totalPublished, districtCountMap } = await getHomePageData();

  const featuredDistrictSet = new Set(FEATURED_DISTRICTS.map((f) => f.district));
  const remainingDistricts = KERALA_DISTRICTS.filter((d) => !featuredDistrictSet.has(d));

  return (
    <div className="min-h-screen bg-cream">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Full-bleed Kerala photo */}
        <Image
          src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=85"
          alt="Kerala highlands aerial view"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Gradient: strong on left for text legibility, fades to photo on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/25 lg:to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Hero content — left-aligned */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 w-full max-w-7xl mx-auto pt-32 pb-12">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-8">
              <span className="w-6 h-px bg-sage" />
              <span className="text-sage text-xs font-semibold tracking-[0.2em] uppercase">
                Kerala&apos;s Premier Real Estate
              </span>
            </div>

            {/* Main headline — exaggerated scale */}
            <h1 className="font-display font-bold text-white leading-[0.95] tracking-tight mb-8">
              <span className="block text-[clamp(3.5rem,9vw,7.5rem)]">Find Your</span>
              <span className="block text-[clamp(3.5rem,9vw,7.5rem)] text-sage">Dream Home</span>
              <span className="block text-[clamp(2rem,5vw,4rem)] font-medium text-white/60 mt-2">in Kerala</span>
            </h1>

            <p className="text-white/60 text-base sm:text-lg max-w-md leading-relaxed font-light mb-10">
              Verified listings across all 14 districts. Homes, plots, villas and
              commercial spaces — all in one place.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-forest font-semibold text-sm hover:bg-cream transition-colors duration-200 cursor-pointer"
              >
                Browse All Properties <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-white/25 text-white font-medium text-sm hover:bg-white/10 transition-colors duration-200 cursor-pointer"
              >
                Talk to an Expert
              </Link>
            </div>
          </div>
        </div>

        {/* Search panel — anchored at the bottom of the hero */}
        <div className="relative z-10 w-full px-4 pb-10 sm:px-10 lg:px-16 max-w-7xl mx-auto">
          <Suspense>
            <HeroSearch />
          </Suspense>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: totalPublished > 10 ? `${totalPublished}+` : "500+", label: "Properties" },
              { value: "14", label: "Districts" },
              { value: "10+", label: "Years Experience" },
              { value: "2,000+", label: "Happy Families" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
                  {stat.value}
                </div>
                <div className="text-white/40 text-xs mt-1.5 uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT ARE YOU LOOKING FOR ──────────────────────────── */}
      <section className="py-28 px-4">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-end justify-between gap-4 mb-16">
            <div>
              <p className="text-emerald-brand font-semibold text-xs tracking-[0.18em] uppercase mb-4">Browse by Type</p>
              <h2 className="font-display text-5xl sm:text-6xl font-bold text-forest leading-[1] tracking-tight">
                What are you<br />looking for?
              </h2>
            </div>
            <Link
              href="/search"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-emerald-brand hover:text-forest transition-colors pb-1 cursor-pointer shrink-0"
            >
              All listings <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {PROPERTY_TYPES.map(({ type, label, description, href, icon }) => (
              <Link
                key={type}
                href={href}
                className="group flex flex-col gap-5 p-6 bg-white rounded-3xl border border-border/50 hover:border-forest/20 hover:shadow-[0_8px_40px_rgba(27,67,50,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-mist flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-cream transition-all duration-300">
                  {icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-forest text-xl leading-tight mb-1">
                    {label}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
                <div className="flex items-center justify-between">
                  {(countMap[type] ?? 0) > 0 && (
                    <span className="text-xs font-semibold text-emerald-brand">
                      {countMap[type]} listings
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-forest/40 group-hover:text-forest group-hover:gap-2 transition-all duration-200">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ─────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-28 px-4 bg-mist">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-16">
              <div>
                <p className="text-emerald-brand font-semibold text-xs tracking-[0.18em] uppercase mb-4">Hand-Picked</p>
                <h2 className="font-display text-5xl sm:text-6xl font-bold text-forest leading-[1] tracking-tight">
                  Featured<br />Properties
                </h2>
              </div>
              <Link
                href="/search?featured=true"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-emerald-brand hover:text-forest transition-colors pb-1 cursor-pointer shrink-0"
              >
                View all <ArrowUpRight className="w-4 h-4" />
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

      {/* ── EXPLORE DISTRICTS ─────────────────────────────────── */}
      <section className="py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-16">
            <div>
              <p className="text-emerald-brand font-semibold text-xs tracking-[0.18em] uppercase mb-4">All Kerala</p>
              <h2 className="font-display text-5xl sm:text-6xl font-bold text-forest leading-[1] tracking-tight">
                Explore by<br />District
              </h2>
            </div>
            <Link
              href="/search"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-emerald-brand hover:text-forest transition-colors pb-1 cursor-pointer shrink-0"
            >
              All 14 districts <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Photo grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {FEATURED_DISTRICTS.map(({ district, subtitle, href, img }) => (
              <Link
                key={district}
                href={href}
                className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-square"
              >
                <Image
                  src={img}
                  alt={district}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-108"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-forest/85 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display font-bold text-white text-sm leading-tight">{district}</h3>
                  <p className="text-white/55 text-xs mt-0.5 hidden sm:block">{subtitle}</p>
                  {(districtCountMap[district] ?? 0) > 0 && (
                    <p className="text-sage text-xs mt-1 font-semibold">
                      {districtCountMap[district]} listing{districtCountMap[district] !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Remaining districts as pills */}
          <div className="flex flex-wrap gap-2">
            {remainingDistricts.map((district) => (
              <Link
                key={district}
                href={`/search?district=${district}`}
                className="px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium text-ink hover:bg-forest hover:text-cream hover:border-forest transition-all duration-200 cursor-pointer"
              >
                {district}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST LISTINGS ───────────────────────────────────── */}
      {recent.length > 0 && (
        <section className="py-28 px-4 bg-mist">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-16">
              <div>
                <p className="text-emerald-brand font-semibold text-xs tracking-[0.18em] uppercase mb-4">Just Listed</p>
                <h2 className="font-display text-5xl sm:text-6xl font-bold text-forest leading-[1] tracking-tight">
                  Latest<br />Properties
                </h2>
              </div>
              <Link
                href="/search"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-emerald-brand hover:text-forest transition-colors pb-1 cursor-pointer shrink-0"
              >
                View all <ArrowUpRight className="w-4 h-4" />
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

      {/* ── WHY SELL KERALA ───────────────────────────────────── */}
      <section className="relative py-28 px-4 bg-forest overflow-hidden">
        {/* Subtle photo texture */}
        <Image
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=40"
          alt=""
          fill
          className="object-cover opacity-[0.06]"
          aria-hidden="true"
          sizes="100vw"
        />
        <div className="relative z-10 max-w-7xl mx-auto">

          {/* Big stat numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-20 pb-20 border-b border-white/10">
            {[
              { value: "500+", label: "Properties Listed" },
              { value: "14", label: "Kerala Districts" },
              { value: "10+", label: "Years Experience" },
              { value: "2,000+", label: "Families Helped" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-5xl sm:text-6xl font-bold text-white tracking-tight leading-none mb-2">
                  {stat.value}
                </div>
                <div className="text-white/40 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
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
                description: "From search to registration, our team guides you at every step.",
              },
              {
                Icon: ShieldCheck,
                title: "Verified Listings",
                description: "Every property is personally verified before it goes live.",
              },
            ].map(({ Icon, title, description }) => (
              <div key={title} className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-sage" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section className="py-32 px-4 bg-cream">
        <div className="max-w-4xl mx-auto">
          <div className="bg-forest rounded-3xl px-8 py-14 sm:p-16 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, #95D5B2 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative z-10">
              <p className="text-sage/70 font-semibold text-xs tracking-[0.2em] uppercase mb-5">Get Started</p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1] tracking-tight mb-6">
                Ready to find your<br />
                <span className="text-sage">perfect property?</span>
              </h2>
              <p className="text-white/50 text-base sm:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                Free consultation. Zero hidden charges. Our Kerala property experts are ready to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-forest font-bold text-base hover:bg-cream transition-colors duration-200 cursor-pointer"
                >
                  Browse Properties <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold text-base hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                >
                  Talk to an Expert
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
