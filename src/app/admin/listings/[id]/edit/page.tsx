import { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { ListingForm } from "@/components/admin/ListingForm";

export const metadata: Metadata = { title: "Edit Listing" };

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  await connectDB();
  const listing = await Listing.findById(params.id).lean();
  if (!listing) notFound();

  const defaultValues = {
    title: listing.title,
    description: listing.description,
    type: listing.type,
    category: listing.category,
    status: listing.status,
    isFeatured: listing.isFeatured,
    feature: listing.feature
      ? {
          paidBy: listing.feature.paidBy,
          amount: listing.feature.amount,
          paidOn: listing.feature.paidOn?.toISOString().split("T")[0],
          featureUntil: listing.feature.featureUntil?.toISOString().split("T")[0],
        }
      : undefined,
    district: listing.district,
    taluk: listing.taluk,
    village: listing.village,
    locality: listing.locality,
    address: listing.address,
    lat: listing.geo?.coordinates?.[1],
    lng: listing.geo?.coordinates?.[0],
    areaValue: listing.area.value,
    areaUnit: listing.area.unit,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    furnishing: listing.furnishing,
    facing: listing.facing,
    floors: listing.floors,
    ageYears: listing.ageYears,
    askingPrice: listing.askingPrice,
    fairValueRef: listing.fairValueRef,
    isNegotiable: listing.isNegotiable,
    monthlyRent: listing.monthlyRent,
    deposit: listing.deposit,
    leaseTermMonths: listing.leaseTermMonths,
    coverIndex: listing.coverIndex,
    youtubeUrl: listing.youtubeUrl,
    highlights: listing.highlights,
    images: listing.images,
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-forest">
          Edit Listing
        </h1>
        <p className="text-sm text-muted-foreground mt-1 truncate">
          {listing.title}
        </p>
      </div>
      <ListingForm
        listingId={params.id}
        defaultValues={defaultValues}
      />
    </div>
  );
}
