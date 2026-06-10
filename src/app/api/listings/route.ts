import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Listing from "@/lib/db/models/Listing";
import { listingSchema } from "@/lib/schemas/listing";
import { slugify } from "@/lib/format";
import { computePricePerCent } from "@/lib/units";
import { updateTag } from "next/cache";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const district = searchParams.get("district");
  const search = searchParams.get("q");
  const featured = searchParams.get("featured");

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  else filter.status = { $ne: "archived" };
  if (district) filter.district = district;
  if (featured === "true") filter.isFeatured = true;
  if (search) filter.$text = { $search: search };

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Listing.countDocuments(filter),
  ]);

  return NextResponse.json({ listings, total, page, limit });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = listingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDB();
  const data = parsed.data;

  const shortId = new mongoose.Types.ObjectId().toString().slice(-6);
  const slug = slugify(data.title, shortId);

  const pricePerCent =
    data.type === "SELL_LAND" || data.type === "SELL_HOME"
      ? computePricePerCent(data.askingPrice, data.areaValue, data.areaUnit)
      : undefined;

  const listing = await Listing.create({
    title: data.title,
    slug,
    description: data.description,
    type: data.type,
    category: data.category,
    status: data.status,
    isFeatured: data.isFeatured,
    feature: data.feature,
    district: data.district,
    taluk: data.taluk,
    village: data.village,
    locality: data.locality,
    address: data.address,
    geo:
      data.lat && data.lng
        ? { type: "Point", coordinates: [data.lng, data.lat] }
        : undefined,
    area: { value: data.areaValue, unit: data.areaUnit },
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    furnishing: data.furnishing,
    facing: data.facing,
    floors: data.floors,
    ageYears: data.ageYears,
    askingPrice: data.askingPrice,
    pricePerCent,
    fairValueRef: data.fairValueRef,
    isNegotiable: data.isNegotiable,
    monthlyRent: data.monthlyRent,
    deposit: data.deposit,
    leaseTermMonths: data.leaseTermMonths,
    images: (body.images ?? []).slice(0, 20),
    coverIndex: data.coverIndex,
    youtubeUrl: data.youtubeUrl,
    highlights: data.highlights,
    nearbyLandmarks: data.nearbyLandmarks,
    createdBy: session.user.id,
  });

  updateTag("listings");

  return NextResponse.json({ listing }, { status: 201 });
}
