import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";

const intentSchema = z.object({
  type: z.enum(["SELL_HOME", "SELL_LAND", "RENT", "LEASE"]).nullable().optional(),
  district: z.string().nullable().optional(),
  category: z.enum(["villa", "apartment", "house", "plot", "commercial", "agricultural"]).nullable().optional(),
  minPrice: z.number().nullable().optional(),
  maxPrice: z.number().nullable().optional(),
  bedrooms: z.number().int().nullable().optional(),
  needsNearby: z.array(z.string()).optional().default([]),
});

const SYSTEM_PROMPT = `You are a real estate search assistant for Kerala, India.
Extract search intent from the user's query and return ONLY valid JSON — no markdown, no explanation, no code blocks.

JSON schema:
{
  "type": "SELL_HOME" | "SELL_LAND" | "RENT" | "LEASE" | null,
  "district": "<Kerala district name>" | null,
  "category": "villa" | "apartment" | "house" | "plot" | "commercial" | "agricultural" | null,
  "minPrice": <number in INR, integers only> | null,
  "maxPrice": <number in INR, integers only> | null,
  "bedrooms": <integer> | null,
  "needsNearby": ["school", "hospital", "beach", "market", "highway"]
}

Rules:
- Convert "lakh" → multiply by 100000, "crore" → multiply by 10000000
- Valid Kerala districts: Thiruvananthapuram, Kollam, Pathanamthitta, Alappuzha, Kottayam, Idukki, Ernakulam, Thrissur, Palakkad, Malappuram, Kozhikode, Wayanad, Kannur, Kasaragod
- "Kochi" or "Cochin" → Ernakulam
- "Trivandrum" → Thiruvananthapuram
- "Calicut" → Kozhikode
- "Trichur" → Thrissur
- Output ONLY the raw JSON object, absolutely nothing else`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = body.query?.trim() ?? "";

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.1-8b-instruct:free";

    let intent: z.input<typeof intentSchema> = {};

    if (apiKey) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
            "X-Title": "Sell Kerala",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: query },
            ],
            temperature: 0,
            max_tokens: 256,
          }),
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const data = await res.json();
          const raw = data.choices?.[0]?.message?.content ?? "";
          // Strip markdown code fences if the model wraps it anyway
          const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
          const parsed = intentSchema.safeParse(JSON.parse(cleaned));
          if (parsed.success) intent = parsed.data;
        }
      } catch {
        // AI unavailable — fall through to keyword search
      }
    }

    // Build DB query from intent + original text (keyword fallback)
    await connectDB();

    const filter: Record<string, unknown> = { status: "published" };

    if (intent.type) filter.type = intent.type;
    if (intent.district) filter.district = intent.district;
    if (intent.category) filter.category = intent.category;
    if (intent.bedrooms) filter.bedrooms = { $gte: intent.bedrooms };

    if (intent.minPrice || intent.maxPrice) {
      const pf: Record<string, number> = {};
      if (intent.minPrice) pf.$gte = intent.minPrice;
      if (intent.maxPrice) pf.$lte = intent.maxPrice;
      filter.askingPrice = pf;
    }

    // If intent extraction failed entirely, fall back to regex search
    const hasIntent = !!(intent.type || intent.district || intent.category || intent.minPrice || intent.maxPrice || intent.bedrooms);
    if (!hasIntent) {
      const re = { $regex: query, $options: "i" };
      filter.$or = [{ title: re }, { description: re }, { village: re }, { district: re }];
    }

    const listings = await Listing.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(12)
      .lean();

    // Build redirect params from intent
    const params: Record<string, string> = {};
    if (intent.type) params.type = intent.type;
    if (intent.district) params.district = intent.district;
    if (intent.category) params.category = intent.category;
    if (intent.bedrooms) params.beds = String(intent.bedrooms);
    if (intent.maxPrice) params.maxPrice = String(intent.maxPrice);
    if (intent.minPrice) params.minPrice = String(intent.minPrice);

    return NextResponse.json({
      intent,
      params,
      count: listings.length,
      listings: listings.map((l) => ({
        ...l,
        _id: l._id.toString(),
        createdBy: l.createdBy?.toString(),
      })),
    });
  } catch (err) {
    console.error("[ai/search]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
