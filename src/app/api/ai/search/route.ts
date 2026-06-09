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

const SORT = { isFeatured: -1 as const, createdAt: -1 as const };

type FallbackResult = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listings: any[];
  effectiveParams: Record<string, string>;
  isSuggestion: boolean;
};

async function findWithFallback(
  intent: z.input<typeof intentSchema>,
  query: string,
  hasIntent: boolean
): Promise<FallbackResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function run(filter: Record<string, unknown>): Promise<any[]> {
    return Listing.find(filter).sort(SORT).limit(12).lean();
  }

  // ── Path 1: AI extracted intent ──────────────────────────────────────────
  if (hasIntent) {
    const base: Record<string, unknown> = { status: "published" };
    if (intent.type) base.type = intent.type;
    if (intent.district) base.district = intent.district;
    if (intent.category) base.category = intent.category;
    if (intent.bedrooms) base.bedrooms = { $gte: intent.bedrooms };
    if (intent.minPrice || intent.maxPrice) {
      const pf: Record<string, number> = {};
      if (intent.minPrice) pf.$gte = intent.minPrice;
      if (intent.maxPrice) pf.$lte = intent.maxPrice;
      base.askingPrice = pf;
    }

    function paramsFromFilter(f: Record<string, unknown>): Record<string, string> {
      const p: Record<string, string> = {};
      if (f.type) p.type = f.type as string;
      if (f.district) p.district = f.district as string;
      if (f.category) p.category = f.category as string;
      if (f.bedrooms) p.beds = String((f.bedrooms as Record<string, number>).$gte ?? f.bedrooms);
      const ap = f.askingPrice as Record<string, number> | undefined;
      if (ap?.$gte) p.minPrice = String(ap.$gte);
      if (ap?.$lte) p.maxPrice = String(ap.$lte);
      return p;
    }

    // Try exact intent
    let results = await run(base);
    if (results.length >= 3) return { listings: results, effectiveParams: paramsFromFilter(base), isSuggestion: false };

    // Relax: drop price
    if (base.askingPrice) {
      const r = { ...base }; delete r.askingPrice;
      results = await run(r);
      if (results.length >= 3) return { listings: results, effectiveParams: paramsFromFilter(r), isSuggestion: true };
    }

    // Relax: drop price + bedrooms
    if (base.bedrooms) {
      const r = { ...base }; delete r.askingPrice; delete r.bedrooms;
      results = await run(r);
      if (results.length >= 3) return { listings: results, effectiveParams: paramsFromFilter(r), isSuggestion: true };
    }

    // Relax: drop category too, keep district + type
    if (base.category) {
      const r: Record<string, unknown> = { status: "published" };
      if (intent.type) r.type = intent.type;
      if (intent.district) r.district = intent.district;
      results = await run(r);
      if (results.length >= 1) return { listings: results, effectiveParams: paramsFromFilter(r), isSuggestion: true };
    }

    // Relax: district only
    if (intent.district) {
      const r = { status: "published", district: intent.district };
      results = await run(r);
      if (results.length >= 1) return { listings: results, effectiveParams: paramsFromFilter(r), isSuggestion: true };
    }

    // Relax: type only
    if (intent.type) {
      const r = { status: "published", type: intent.type };
      results = await run(r);
      if (results.length >= 1) return { listings: results, effectiveParams: paramsFromFilter(r), isSuggestion: true };
    }
  }

  // ── Path 2: Keyword fallback ──────────────────────────────────────────────
  const tokens = query
    .split(/\s+/)
    .map(t => t.replace(/[^\w]/g, ""))
    .filter(t => t.length >= 3);

  if (tokens.length > 0) {
    const fields = ["title", "description", "village", "district", "taluk", "category"];

    // ALL tokens must match (AND)
    const andClauses = tokens.map(t => ({
      $or: fields.map(f => ({ [f]: { $regex: t, $options: "i" } })),
    }));
    let results = await run({ status: "published", $and: andClauses });
    if (results.length >= 1) return { listings: results, effectiveParams: { q: query }, isSuggestion: false };

    // ANY token matches (OR) — more lenient
    const orClauses = tokens.flatMap(t =>
      fields.map(f => ({ [f]: { $regex: t, $options: "i" } }))
    );
    results = await run({ status: "published", $or: orClauses });
    if (results.length >= 1) return { listings: results, effectiveParams: { q: query }, isSuggestion: true };
  }

  // ── Fallback: return featured/recent so user never sees empty ────────────
  const listings = await Listing.find({ status: "published" }).sort(SORT).limit(12).lean();
  return { listings, effectiveParams: {}, isSuggestion: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = body.query?.trim() ?? "";

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL ?? "mistralai/mistral-7b-instruct:free";

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
          const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
          try {
            const parsed = intentSchema.safeParse(JSON.parse(cleaned));
            if (parsed.success) intent = parsed.data;
          } catch { /* ignore parse errors */ }
        }
      } catch { /* AI timeout/unavailable */ }
    }

    await connectDB();

    const hasIntent = !!(intent.type || intent.district || intent.category || intent.minPrice || intent.maxPrice || intent.bedrooms);
    const { listings, effectiveParams, isSuggestion } = await findWithFallback(intent, query, hasIntent);

    return NextResponse.json({
      intent,
      params: effectiveParams,
      isSuggestion,
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
