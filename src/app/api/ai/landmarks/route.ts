import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a Kerala real estate assistant. Extract nearby landmarks and places mentioned in a property listing's description and highlights.

Return ONLY a JSON array of strings — no markdown, no explanation, no code blocks.
Each string should be a short, clean landmark entry like:
- "KSRTC Bus Stand – 200m"
- "Aster MIMS Hospital – 1.2 km"
- "NH 66 National Highway – 500m"
- "Lulu Hypermarket – 3 km"
- "Railway Station – 2 km"
- "Beach – 5 min drive"

Rules:
- Only include places explicitly mentioned in the text
- Preserve the distance/time info if given
- Clean up phrasing to be professional
- Maximum 10 items
- If no landmarks are mentioned, return []
- Output ONLY the raw JSON array, nothing else`;

export async function POST(req: NextRequest) {
  const { description = "", highlights = [] } = await req.json();

  const text = [description, ...(highlights as string[])].filter(Boolean).join("\n");

  if (!text.trim()) {
    return NextResponse.json({ landmarks: [] });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL ?? "mistralai/mistral-7b-instruct:free";

  if (!apiKey) {
    return NextResponse.json({ landmarks: [], error: "AI not configured" });
  }

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
          { role: "user", content: text },
        ],
        temperature: 0,
        max_tokens: 512,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return NextResponse.json({ landmarks: [], error: "AI unavailable" });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "[]";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let landmarks: string[] = [];
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        landmarks = parsed.filter((x: unknown) => typeof x === "string").slice(0, 10);
      }
    } catch { /* ignore */ }

    return NextResponse.json({ landmarks });
  } catch {
    return NextResponse.json({ landmarks: [], error: "Request failed" });
  }
}
