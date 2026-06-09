import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { listingSchema } from "@/lib/schemas/listing";
import { computePricePerCent } from "@/lib/units";
import { updateTag } from "next/cache";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const { id } = await params;
  await connectDB();
  const listing = await Listing.findById(id).lean();
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ listing });
}

export async function PUT(req: Request, { params }: Context) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = listingSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDB();
  const data = parsed.data;

  const updates: Record<string, unknown> = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.type !== undefined) updates.type = data.type;
  if (data.category !== undefined) updates.category = data.category;
  if (data.status !== undefined) updates.status = data.status;
  if (data.isFeatured !== undefined) updates.isFeatured = data.isFeatured;
  if (data.feature !== undefined) updates.feature = data.feature;
  if (data.district !== undefined) updates.district = data.district;
  if (data.taluk !== undefined) updates.taluk = data.taluk;
  if (data.village !== undefined) updates.village = data.village;
  if (data.locality !== undefined) updates.locality = data.locality;
  if (data.address !== undefined) updates.address = data.address;
  if (data.areaValue !== undefined && data.areaUnit !== undefined) {
    updates.area = { value: data.areaValue, unit: data.areaUnit };
    if (data.askingPrice !== undefined) {
      updates.pricePerCent = computePricePerCent(
        data.askingPrice,
        data.areaValue,
        data.areaUnit
      );
    }
  }
  if (data.bedrooms !== undefined) updates.bedrooms = data.bedrooms;
  if (data.bathrooms !== undefined) updates.bathrooms = data.bathrooms;
  if (data.furnishing !== undefined) updates.furnishing = data.furnishing;
  if (data.facing !== undefined) updates.facing = data.facing;
  if (data.floors !== undefined) updates.floors = data.floors;
  if (data.ageYears !== undefined) updates.ageYears = data.ageYears;
  if (data.askingPrice !== undefined) updates.askingPrice = data.askingPrice;
  if (data.fairValueRef !== undefined) updates.fairValueRef = data.fairValueRef;
  if (data.isNegotiable !== undefined) updates.isNegotiable = data.isNegotiable;
  if (data.monthlyRent !== undefined) updates.monthlyRent = data.monthlyRent;
  if (data.deposit !== undefined) updates.deposit = data.deposit;
  if (data.leaseTermMonths !== undefined) updates.leaseTermMonths = data.leaseTermMonths;
  if (body.images !== undefined) updates.images = body.images.slice(0, 20);
  if (data.coverIndex !== undefined) updates.coverIndex = data.coverIndex;
  if (data.youtubeUrl !== undefined) updates.youtubeUrl = data.youtubeUrl;
  if (data.highlights !== undefined) updates.highlights = data.highlights;
  if (data.nearbyLandmarks !== undefined) updates.nearbyLandmarks = data.nearbyLandmarks;

  const listing = await Listing.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  ).lean();

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  updateTag("listings");
  updateTag(`listing:${listing.slug}`);

  return NextResponse.json({ listing });
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const listing = await Listing.findByIdAndUpdate(
    id,
    { $set: { status: "archived" } },
    { new: true }
  ).lean();

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  updateTag("listings");

  return NextResponse.json({ success: true });
}
