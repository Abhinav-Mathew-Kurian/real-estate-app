import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { formatINR, formatArea } from "@/lib/format";
import type { IListing } from "@/models/Listing";
import { ListingCard } from "@/components/public/ListingCard";
import { ImageGallery } from "./ImageGallery";
import { EnquirySection } from "./EnquirySection";
import { MapPlaceholder } from "./MapPlaceholder";

type Props = { params: { slug: string } };

async function getListing(slug: string) {
  await connectDB();
  const listing = await Listing.findOne({ slug, status: "published" }).lean();
  return listing;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing(params.slug);
  if (!listing) return { title: "Property Not Found" };

  const cover = listing.images?.[listing.coverIndex ?? 0] ?? listing.images?.[0];
  const desc = listing.description || `${formatArea(listing.area.value, listing.area.unit)} property in ${listing.village}, ${listing.district}. Asking price: ${formatINR(listing.askingPrice)}.`;

  return {
    title: listing.title,
    description: desc.slice(0, 155),
    openGraph: {
      title: listing.title,
      description: desc.slice(0, 155),
      images: cover ? [{ url: cover.url, alt: cover.alt ?? listing.title }] : [],
      type: "website",
    },
  };
}

const TYPE_LABELS: Record<string, string> = {
  SELL_HOME: "For Sale",
  SELL_LAND: "Land for Sale",
  RENT: "For Rent",
  LEASE: "For Lease",
};

async function incrementView(slug: string) {
  // Fire-and-forget — don't await in the render path
  try {
    await Listing.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } });
  } catch {
    // silently fail
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const listing = await getListing(params.slug);
  if (!listing) notFound();

  // Increment view count (fire and forget)
  void incrementView(params.slug);

  const cover = listing.images?.[listing.coverIndex ?? 0] ?? listing.images?.[0];
  const hasGeo = !!(listing.geo?.coordinates?.[0] && listing.geo?.coordinates?.[1]);
  const lat = hasGeo ? listing.geo!.coordinates[1] : null;
  const lng = hasGeo ? listing.geo!.coordinates[0] : null;

  // Related listings
  await connectDB();
  const related = await Listing.find({
    status: "published",
    district: listing.district,
    type: listing.type,
    _id: { $ne: listing._id },
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const relatedPlain = related.map((l) => ({
    ...l,
    _id: l._id.toString(),
  })) as unknown as IListing[];

  const listingId = listing._id.toString();

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/listing/${listing.slug}`,
    image: cover?.url,
    floorSize: {
      "@type": "QuantitativeValue",
      value: listing.area.value,
      unitText: listing.area.unit,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.village,
      addressRegion: listing.district,
      addressCountry: "IN",
    },
    price: listing.askingPrice,
    priceCurrency: "INR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-mist pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link href="/" className="hover:text-emerald-brand transition-colors">Home</Link>
            <span>›</span>
            <Link href="/search" className="hover:text-emerald-brand transition-colors">Search</Link>
            <span>›</span>
            <Link href={`/search?district=${listing.district}`} className="hover:text-emerald-brand transition-colors">
              {listing.district}
            </Link>
            <span>›</span>
            <span className="text-ink truncate max-w-[200px]">{listing.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left column ──────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <ImageGallery images={listing.images} coverIndex={listing.coverIndex ?? 0} title={listing.title} />

              {/* YouTube */}
              {listing.youtubeUrl && (
                <div className="aspect-video rounded-2xl overflow-hidden bg-forest">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(listing.youtubeUrl)}`}
                    title={`Video tour: ${listing.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <div className="bg-cream rounded-2xl border border-border p-6">
                  <h2 className="font-display text-xl font-semibold text-forest mb-3">About this property</h2>
                  <p className="text-ink/80 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}

              {/* Specs Table */}
              <div className="bg-cream rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-semibold text-forest mb-4">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <SpecItem label="Area" value={formatArea(listing.area.value, listing.area.unit)} />
                  <SpecItem label="Type" value={TYPE_LABELS[listing.type] ?? listing.type} />
                  <SpecItem label="Category" value={capitalize(listing.category)} />
                  {listing.bedrooms !== undefined && <SpecItem label="Bedrooms" value={String(listing.bedrooms)} />}
                  {listing.bathrooms !== undefined && <SpecItem label="Bathrooms" value={String(listing.bathrooms)} />}
                  {listing.furnishing && <SpecItem label="Furnishing" value={capitalize(listing.furnishing)} />}
                  {listing.facing && <SpecItem label="Facing" value={listing.facing} />}
                  {listing.floors !== undefined && <SpecItem label="Floors" value={String(listing.floors)} />}
                  {listing.ageYears !== undefined && <SpecItem label="Age" value={`${listing.ageYears} year${listing.ageYears !== 1 ? "s" : ""}`} />}
                </div>
              </div>

              {/* Highlights */}
              {listing.highlights?.length > 0 && (
                <div className="bg-cream rounded-2xl border border-border p-6">
                  <h2 className="font-display text-xl font-semibold text-forest mb-4">Highlights</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.highlights.map((h: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-sage/30 text-forest text-sm font-medium">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="bg-cream rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-semibold text-forest mb-4">Location</h2>
                <div className="space-y-1.5 text-sm text-ink/80 mb-4">
                  <p><span className="font-medium text-ink">Village:</span> {listing.village}</p>
                  <p><span className="font-medium text-ink">Taluk:</span> {listing.taluk}</p>
                  <p><span className="font-medium text-ink">District:</span> {listing.district}</p>
                  {listing.address && <p><span className="font-medium text-ink">Address:</span> {listing.address}</p>}
                </div>

                {/* Map */}
                {hasGeo && lat && lng ? (
                  <MapPlaceholder lat={lat} lng={lng} title={listing.title} listingId={listingId} />
                ) : (
                  <div className="h-48 rounded-xl bg-mist flex items-center justify-center text-muted-foreground text-sm">
                    Map not available for this listing
                  </div>
                )}
              </div>
            </div>

            {/* ── Right column ─────────────────── */}
            <div className="space-y-5">
              {/* Price block */}
              <div className="bg-cream rounded-2xl border border-border p-6 sticky top-20">
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${listing.type === "SELL_HOME" ? "bg-emerald-brand text-cream" : listing.type === "SELL_LAND" ? "bg-forest text-cream" : listing.type === "RENT" ? "bg-sage text-forest" : "bg-mist text-forest border border-border"}`}>
                    {TYPE_LABELS[listing.type] ?? listing.type}
                  </span>
                  {listing.isFeatured && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-laterite text-cream">Featured</span>
                  )}
                </div>

                <h1 className="font-display text-xl font-bold text-forest mt-3 mb-1 leading-snug">
                  {listing.title}
                </h1>
                <p className="text-sm text-muted-foreground mb-4">
                  {listing.village}, {listing.taluk}, {listing.district}
                </p>

                {/* Main price */}
                <div className="mb-3">
                  {(listing.type === "SELL_HOME" || listing.type === "SELL_LAND") ? (
                    <div>
                      <div className="font-display text-3xl font-bold text-forest">
                        {formatINR(listing.askingPrice)}
                      </div>
                      {listing.pricePerCent && (
                        <div className="text-sm text-muted-foreground mt-0.5">
                          ≈ {formatINR(listing.pricePerCent)} / cent
                        </div>
                      )}
                      {listing.fairValueRef && (
                        <div className="mt-2 text-xs text-muted-foreground bg-mist px-3 py-2 rounded-lg">
                          Fair Value Reference: {formatINR(listing.fairValueRef)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {listing.monthlyRent && (
                        <div>
                          <div className="font-display text-3xl font-bold text-forest">
                            {formatINR(listing.monthlyRent)}
                            <span className="text-base font-normal text-muted-foreground">/mo</span>
                          </div>
                        </div>
                      )}
                      {listing.deposit && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Deposit: {formatINR(listing.deposit)}
                        </div>
                      )}
                      {listing.leaseTermMonths && (
                        <div className="text-sm text-muted-foreground">
                          Lease: {listing.leaseTermMonths} months
                        </div>
                      )}
                    </div>
                  )}
                  {listing.isNegotiable && (
                    <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-sage/30 text-forest">
                      Negotiable
                    </span>
                  )}
                </div>

                <div className="border-t border-border my-4" />

                {/* Enquiry Form */}
                <EnquirySection listingId={listingId} listingTitle={listing.title} />
              </div>
            </div>
          </div>

          {/* Related listings */}
          {relatedPlain.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-2xl font-bold text-forest mb-6">
                Similar Properties in {listing.district}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedPlain.map((rel) => (
                  <ListingCard key={rel._id?.toString()} listing={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-mist rounded-xl p-3">
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="font-semibold text-ink text-sm">{value}</div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function extractYouTubeId(url: string): string {
  const m = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
  return m ? m[1] : "";
}
