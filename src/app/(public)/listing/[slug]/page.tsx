import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Listing from "@/lib/db/models/Listing";
import { formatINR, formatArea } from "@/lib/format";
import type { IListing } from "@/lib/db/models/Listing";
import { ListingCard } from "@/components/listings/ListingCard";
import { ImageGallery } from "./ImageGallery";
import { EnquirySection } from "./EnquirySection";
import { PropertySection } from "./PropertySection";
import { WhatsAppCallBar } from "@/components/shared/WhatsAppCallBar";
import { ShareButton } from "@/components/shared/ShareButton";
import { MapPin, BedDouble, Bath, Maximize2, Eye } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

async function getListing(slug: string) {
  await connectDB();
  const listing = await Listing.findOne({ slug, status: "published" }).lean();
  return listing;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
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

const TYPE_COLORS: Record<string, string> = {
  SELL_HOME: "bg-emerald-brand text-cream",
  SELL_LAND: "bg-forest text-cream",
  RENT: "bg-laterite text-cream",
  LEASE: "bg-ink text-cream",
};

async function incrementView(slug: string) {
  try { await Listing.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } }); } catch { /* noop */ }
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const rawListing = await getListing(slug);
  if (!rawListing) notFound();
  const listing = JSON.parse(JSON.stringify(rawListing)) as typeof rawListing;

  void incrementView(slug);

  const hasGeo = !!(listing.geo?.coordinates?.[0] && listing.geo?.coordinates?.[1]);
  const lat = hasGeo ? listing.geo!.coordinates[1] : null;
  const lng = hasGeo ? listing.geo!.coordinates[0] : null;

  await connectDB();
  const related = await Listing.find({
    status: "published",
    district: listing.district,
    type: listing.type,
    _id: { $ne: listing._id },
  }).sort({ createdAt: -1 }).limit(3).lean();
  const relatedPlain = JSON.parse(JSON.stringify(related)) as IListing[];

  const listingId = listing._id.toString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/listing/${listing.slug}`,
    image: (listing.images?.[listing.coverIndex ?? 0] ?? listing.images?.[0])?.url,
    floorSize: { "@type": "QuantitativeValue", value: listing.area.value, unitText: listing.area.unit },
    address: { "@type": "PostalAddress", addressLocality: listing.village, addressRegion: listing.district, addressCountry: "IN" },
    price: listing.askingPrice,
    priceCurrency: "INR",
  };

  const isRentOrLease = listing.type === "RENT" || listing.type === "LEASE";
  const mainPrice = isRentOrLease ? listing.monthlyRent : listing.askingPrice;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-[#F7F8F6] pt-28">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
            <Link href="/" className="hover:text-forest transition-colors cursor-pointer">Home</Link>
            <span className="text-border">›</span>
            <Link href="/search" className="hover:text-forest transition-colors cursor-pointer">Properties</Link>
            <span className="text-border">›</span>
            <Link href={`/search?district=${listing.district}`} className="hover:text-forest transition-colors cursor-pointer">{listing.district}</Link>
            <span className="text-border">›</span>
            <span className="text-ink font-medium truncate max-w-[200px]">{listing.title}</span>
          </nav>

          {/* Page headline */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${TYPE_COLORS[listing.type] ?? "bg-ink text-cream"}`}>
                {TYPE_LABELS[listing.type] ?? listing.type}
              </span>
              {listing.isFeatured && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-laterite text-cream">Featured</span>
              )}
              {listing.isNegotiable && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sage/30 text-forest border border-sage/40">Negotiable</span>
              )}
              {(listing.viewCount ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  <Eye className="w-3.5 h-3.5" />
                  {listing.viewCount} views
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-forest leading-snug mb-2">
              {listing.title}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-emerald-brand/70 shrink-0" />
              {listing.village}, {listing.taluk}, {listing.district}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Image Gallery */}
              <ImageGallery images={listing.images} coverIndex={listing.coverIndex ?? 0} title={listing.title} />

              {/* Quick specs bar */}
              <div className="flex flex-wrap gap-3 py-4 px-5 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <SpecPill icon={<Maximize2 className="w-3.5 h-3.5" />} value={formatArea(listing.area.value, listing.area.unit)} />
                {(listing.bedrooms ?? 0) > 0 && <SpecPill icon={<BedDouble className="w-3.5 h-3.5" />} value={`${listing.bedrooms} Bed`} />}
                {(listing.bathrooms ?? 0) > 0 && <SpecPill icon={<Bath className="w-3.5 h-3.5" />} value={`${listing.bathrooms} Bath`} />}
                {listing.furnishing && <SpecPill value={capitalize(listing.furnishing)} />}
                {listing.facing && <SpecPill value={listing.facing} />}
                {listing.ageYears !== undefined && <SpecPill value={`${listing.ageYears}yr old`} />}
              </div>

              {/* YouTube */}
              {listing.youtubeUrl && (
                <div className="aspect-video rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(listing.youtubeUrl)}`}
                    title={`Video tour: ${listing.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen className="w-full h-full"
                  />
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                  <h2 className="font-display text-xl font-bold text-forest mb-3">About This Property</h2>
                  <p className="text-ink/75 leading-relaxed whitespace-pre-wrap text-sm">{listing.description}</p>
                </div>
              )}

              {/* Property Details */}
              <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                <h2 className="font-display text-xl font-bold text-forest mb-5">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <SpecItem label="Area" value={formatArea(listing.area.value, listing.area.unit)} />
                  <SpecItem label="Type" value={TYPE_LABELS[listing.type] ?? listing.type} />
                  <SpecItem label="Category" value={capitalize(listing.category)} />
                  {listing.bedrooms !== undefined && <SpecItem label="Bedrooms" value={String(listing.bedrooms)} />}
                  {listing.bathrooms !== undefined && <SpecItem label="Bathrooms" value={String(listing.bathrooms)} />}
                  {listing.furnishing && <SpecItem label="Furnishing" value={capitalize(listing.furnishing)} />}
                  {listing.facing && <SpecItem label="Facing" value={listing.facing} />}
                  {listing.floors !== undefined && <SpecItem label="Floors" value={String(listing.floors)} />}
                  {listing.ageYears !== undefined && <SpecItem label="Age" value={`${listing.ageYears} yr${listing.ageYears !== 1 ? "s" : ""}`} />}
                </div>
              </div>

              {/* Highlights */}
              {listing.highlights?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                  <h2 className="font-display text-xl font-bold text-forest mb-4">Highlights</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.highlights.map((h: string, i: number) => (
                      <span key={i} className="px-3.5 py-1.5 rounded-full bg-mist border border-sage/30 text-forest text-sm font-medium">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Map / Location */}
              {hasGeo && lat && lng ? (
                <PropertySection
                  lat={lat} lng={lng} title={listing.title} listingId={listingId}
                  landmarks={listing.nearbyLandmarks ?? []} village={listing.village}
                  taluk={listing.taluk} district={listing.district} address={listing.address}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                  <h2 className="font-display text-xl font-bold text-forest mb-4">Location</h2>
                  <div className="space-y-1.5 text-sm text-ink/75 mb-4">
                    <p><span className="font-semibold text-ink">Village:</span> {listing.village}</p>
                    <p><span className="font-semibold text-ink">Taluk:</span> {listing.taluk}</p>
                    <p><span className="font-semibold text-ink">District:</span> {listing.district}</p>
                    {listing.address && <p><span className="font-semibold text-ink">Address:</span> {listing.address}</p>}
                  </div>
                  <div className="h-40 rounded-xl bg-mist flex items-center justify-center text-muted-foreground text-sm">
                    Coordinates not set for this listing
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column ── */}
            <div className="space-y-4">

              {/* Sticky price card */}
              <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] overflow-hidden sticky top-24">

                {/* Price header */}
                <div className="bg-forest px-6 pt-6 pb-5">
                  <div className="flex items-start justify-between mb-4">
                    <ShareButton title={listing.title} />
                  </div>
                  {mainPrice ? (
                    <div>
                      <div className="font-display text-4xl font-bold text-cream tracking-tight leading-none">
                        {formatINR(mainPrice)}
                        {isRentOrLease && <span className="text-lg font-normal text-cream/60 ml-2">/mo</span>}
                      </div>
                      {listing.pricePerCent && (
                        <div className="text-cream/55 text-sm mt-1.5">≈ {formatINR(listing.pricePerCent)} / cent</div>
                      )}
                      {listing.deposit && (
                        <div className="text-cream/55 text-sm mt-0.5">Deposit: {formatINR(listing.deposit)}</div>
                      )}
                      {listing.leaseTermMonths && (
                        <div className="text-cream/55 text-sm mt-0.5">Lease term: {listing.leaseTermMonths} months</div>
                      )}
                    </div>
                  ) : (
                    <div className="font-display text-xl font-semibold text-cream/70">Price on request</div>
                  )}
                  {listing.fairValueRef && (
                    <div className="mt-3 text-xs text-cream/40 bg-white/8 px-3 py-2 rounded-lg">
                      Fair Value Ref: {formatINR(listing.fairValueRef)}
                    </div>
                  )}
                </div>

                {/* Enquiry form */}
                <div className="px-6 py-5">
                  <EnquirySection listingId={listingId} listingTitle={listing.title} />
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp/Call bar */}
          <WhatsAppCallBar listingTitle={listing.title} />

          {/* Related listings */}
          {relatedPlain.length > 0 && (
            <div className="mt-16">
              <div className="mb-8">
                <p className="text-emerald-brand font-semibold text-xs tracking-[0.18em] uppercase mb-2">More in {listing.district}</p>
                <h2 className="font-display text-3xl font-bold text-forest tracking-tight">Similar Properties</h2>
              </div>
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

function SpecPill({ icon, value }: { icon?: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-ink/70">
      {icon && <span className="text-emerald-brand/70">{icon}</span>}
      {value}
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-mist rounded-xl p-3.5">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <div className="font-semibold text-ink text-sm">{value}</div>
    </div>
  );
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function extractYouTubeId(url: string): string {
  const m = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
  return m ? m[1] : "";
}
