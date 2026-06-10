import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Listing from "@/lib/db/models/Listing";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/search?type=SELL_HOME`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/search?type=SELL_LAND`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/search?type=RENT`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/search?type=LEASE`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    await connectDB();
    const listings = await Listing.find({ status: "published" })
      .select("slug updatedAt")
      .lean();

    const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
      url: `${BASE}/listing/${l.slug}`,
      lastModified: l.updatedAt ? new Date(l.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...listingPages];
  } catch {
    return staticPages;
  }
}
