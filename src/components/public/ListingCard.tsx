"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Bath, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatINR, formatArea } from "@/lib/format";
import type { IListing } from "@/models/Listing";

type ListingCardProps = {
  listing: Pick<
    IListing,
    | "slug"
    | "title"
    | "type"
    | "category"
    | "district"
    | "taluk"
    | "village"
    | "askingPrice"
    | "monthlyRent"
    | "area"
    | "bedrooms"
    | "bathrooms"
    | "isFeatured"
    | "images"
    | "coverIndex"
    | "isNegotiable"
  >;
  priority?: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  SELL_HOME: "For Sale",
  SELL_LAND: "Land",
  RENT: "For Rent",
  LEASE: "Lease",
};

const TYPE_STYLES: Record<string, string> = {
  SELL_HOME: "bg-emerald-brand text-cream",
  SELL_LAND: "bg-forest text-cream",
  RENT: "bg-laterite text-cream",
  LEASE: "bg-ink/80 text-cream",
};

export function ListingCard({ listing, priority = false }: ListingCardProps) {
  const cover = listing.images?.[listing.coverIndex ?? 0] ?? listing.images?.[0];
  const isRentOrLease = listing.type === "RENT" || listing.type === "LEASE";
  const price = isRentOrLease ? listing.monthlyRent : listing.askingPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Link
        href={`/listing/${listing.slug}`}
        className="group block bg-cream rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden bg-mist">
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.alt ?? listing.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={priority}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-sage/20 to-emerald-brand/10 flex items-center justify-center">
              <span className="text-muted-foreground/30 text-sm font-medium">No photo</span>
            </div>
          )}
          {/* Gradient overlay for badge contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Type badge */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${TYPE_STYLES[listing.type] ?? "bg-ink text-cream"}`}>
              {TYPE_LABELS[listing.type] ?? listing.type}
            </span>
            {listing.isFeatured && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-laterite text-cream uppercase tracking-wide">
                Featured
              </span>
            )}
          </div>

          {listing.isNegotiable && (
            <div className="absolute bottom-3 right-3">
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm">
                Negotiable
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Location */}
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{listing.village}, {listing.district}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2 mb-3 group-hover:text-emerald-brand transition-colors duration-200">
            {listing.title}
          </h3>

          {/* Specs */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              {formatArea(listing.area.value, listing.area.unit)}
            </span>
            {(listing.bedrooms ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-3 h-3" />
                {listing.bedrooms} BHK
              </span>
            )}
            {(listing.bathrooms ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="w-3 h-3" />
                {listing.bathrooms}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1 pt-3 border-t border-border/60">
            <span className="font-display font-bold text-forest text-xl tracking-tight">
              {price ? formatINR(price) : "Price on request"}
            </span>
            {isRentOrLease && price && (
              <span className="text-xs text-muted-foreground">/mo</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
