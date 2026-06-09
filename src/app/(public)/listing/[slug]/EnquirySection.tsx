"use client";

import dynamic from "next/dynamic";
import { NearbyPanel } from "@/components/public/NearbyPanel";
import { WhatsAppCallBar } from "@/components/public/WhatsAppCallBar";

const EnquiryForm = dynamic(
  () => import("@/components/public/EnquiryForm").then((m) => m.EnquiryForm),
  { ssr: false }
);

type EnquirySectionProps = {
  listingId: string;
  listingTitle: string;
};

export function EnquirySection({ listingId, listingTitle }: EnquirySectionProps) {
  return (
    <>
      <EnquiryForm listingId={listingId} listingTitle={listingTitle} />
      <div className="mt-6">
        <NearbyPanel listingId={listingId} />
      </div>
      <WhatsAppCallBar listingTitle={listingTitle} />
    </>
  );
}
