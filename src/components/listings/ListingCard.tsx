"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Bath, Maximize2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { formatINR, formatArea } from "@/lib/format";
import type { IListing } from "@/lib/db/models/Listing";

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

const TYPE_COLORS: Record<string, string> = {
  SELL_HOME: "bg-emerald-brand/90 text-white",
  SELL_LAND: "bg-forest/90 text-white",
  RENT: "bg-laterite/90 text-white",
  LEASE: "bg-ink/80 text-white",
};

export function ListingCard({ listing, priority = false }: ListingCardProps) {
  const cover = listing.images?.[listing.coverIndex ?? 0] ?? listing.images?.[0];
  const isRentOrLease = listing.type === "RENT" || listing.type === "LEASE";
  const price = isRentOrLease ? listing.monthlyRent : listing.askingPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link
        href={`/listing/${listing.slug}`}
        className="group block bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-mist">
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
            <div className="absolute inset-0 bg-gradient-to-br from-sage/20 to-emerald-brand/10" />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm ${TYPE_COLORS[listing.type] ?? "bg-ink/80 text-white"}`}>
              {TYPE_LABELS[listing.type] ?? listing.type}
            </span>
            {listing.isFeatured && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-laterite/90 text-white uppercase tracking-wide backdrop-blur-sm">
                Featured
              </span>
            )}
          </div>

          {listing.isNegotiable && (
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-white/80 text-forest backdrop-blur-sm border border-white/50 font-semibold">
                Negotiable
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price — big and first */}
          <div className="mb-2">
            {price ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-bold text-forest tracking-tight leading-none">
                  {formatINR(price)}
                </span>
                {isRentOrLease && (
                  <span className="text-xs text-muted-foreground font-normal">/mo</span>
                )}
              </div>
            ) : (
              <span className="font-display text-base font-semibold text-muted-foreground">Price on request</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2 mb-2 group-hover:text-emerald-brand transition-colors duration-200">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3 h-3 shrink-0 text-emerald-brand/60" />
            <span className="truncate">{listing.village}, {listing.district}</span>
          </div>

          {/* Specs + View CTA */}
          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
            <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-brand group-hover:gap-1.5 transition-all duration-200">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
