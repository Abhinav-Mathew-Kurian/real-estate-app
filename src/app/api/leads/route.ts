import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Lead from "@/models/Lead";
import Listing from "@/models/Listing";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import { leadSchema } from "@/lib/schemas/listing";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;
  const status = searchParams.get("status");

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("listing", "title slug")
      .lean(),
    Lead.countDocuments(filter),
  ]);

  return NextResponse.json({ leads, total, page, limit });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDB();
  const data = parsed.data;

  const lead = await Lead.create({
    listing: data.listingId,
    listingTitleSnapshot: data.listingTitleSnapshot,
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    message: data.message,
    source: data.source,
    utm: data.utm,
  });

  // Increment enquiry count + log event
  if (data.listingId) {
    await Promise.all([
      Listing.findByIdAndUpdate(data.listingId, { $inc: { enquiryCount: 1 } }),
      AnalyticsEvent.create({
        listing: data.listingId,
        type: "enquiry",
        utm: data.utm,
      }),
    ]);
  }

  return NextResponse.json({ lead }, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  await connectDB();

  const lead = await Lead.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  ).lean();

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ lead });
}
