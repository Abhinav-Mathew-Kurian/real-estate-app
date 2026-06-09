"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Bath, Ruler } from "lucide-react";
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
  SELL_LAND: "Land Sale",
  RENT: "For Rent",
  LEASE: "For Lease",
};

const TYPE_COLORS: Record<string, string> = {
  SELL_HOME: "bg-emerald-brand text-cream",
  SELL_LAND: "bg-forest text-cream",
  RENT: "bg-sage text-forest",
  LEASE: "bg-mist text-forest border border-border",
};

export function ListingCard({ listing, priority = false }: ListingCardProps) {
  const cover =
    listing.images?.[listing.coverIndex ?? 0] ?? listing.images?.[0];
  const price =
    listing.type === "RENT" || listing.type === "LEASE"
      ? listing.monthlyRent
      : listing.askingPrice;
  const priceLabel =
    listing.type === "RENT" || listing.type === "LEASE" ? "/mo" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Link
        href={`/listing/${listing.slug}`}
        className="group block bg-cream rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
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
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sage/30 to-leaf/20">
              <Ruler className="w-10 h-10 text-sage" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[listing.type] ?? "bg-mist text-forest"}`}
            >
              {TYPE_LABELS[listing.type] ?? listing.type}
            </span>
            {listing.isFeatured && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-laterite text-cream">
                Featured
              </span>
            )}
          </div>
          {listing.isNegotiable && (
            <div className="absolute top-3 right-3">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                Negotiable
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2 mb-2 group-hover:text-emerald-brand transition-colors">
            {listing.title}
          </h3>

          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {listing.village}, {listing.district}
            </span>
          </div>

          {/* Specs row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              {formatArea(listing.area.value, listing.area.unit)}
            </span>
            {listing.bedrooms !== undefined && listing.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-3 h-3" />
                {listing.bedrooms} BHK
              </span>
            )}
            {listing.bathrooms !== undefined && listing.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="w-3 h-3" />
                {listing.bathrooms}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="font-display font-bold text-forest text-lg">
              {price ? formatINR(price) : "Price on Request"}
            </span>
            {priceLabel && (
              <span className="text-xs text-muted-foreground">{priceLabel}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
