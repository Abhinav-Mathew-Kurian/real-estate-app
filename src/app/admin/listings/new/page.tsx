import { Metadata } from "next";
import { ListingForm } from "@/components/admin/ListingForm";

export const metadata: Metadata = { title: "New Listing" };

export default function NewListingPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-forest">Add New Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details below to create a new property listing.
        </p>
      </div>
      <ListingForm />
    </div>
  );
}
