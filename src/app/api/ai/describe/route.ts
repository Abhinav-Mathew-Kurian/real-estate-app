import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a property description writer for "Sell Kerala", a premium real estate platform in Kerala, India.
Write a compelling 2-3 paragraph description for the property details provided.
Paragraph 1: Highlight the property's key features and what makes it special.
Paragraph 2: Describe the location, neighbourhood character, and lifestyle advantages.
Paragraph 3 (optional): Practical summary — investment value, ideal for whom, standout USP.
Keep the tone professional but warm. Write in English. No markdown, no bullet points — just flowing paragraphs separated by a blank line.
Keep the total length under 200 words.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      type,
      category,
      district,
      taluk,
      village,
      area,
      bedrooms,
      bathrooms,
      facing,
      furnishing,
      ageYears,
      highlights,
      askingPrice,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL ?? "mistralai/mistral-7b-instruct:free";

    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    }

    const priceStr = askingPrice
      ? askingPrice >= 10_000_000
        ? `₹${(askingPrice / 10_000_000).toFixed(2)} Crore`
        : `₹${(askingPrice / 100_000).toFixed(2)} Lakh`
      : "";

    const userPrompt = [
      `Title: ${title}`,
      `Type: ${type ?? ""}`,
      `Category: ${category ?? ""}`,
      `Location: ${[village, taluk, district].filter(Boolean).join(", ")}, Kerala`,
      area ? `Area: ${area.value} ${area.unit}` : "",
      bedrooms ? `Bedrooms: ${bedrooms}` : "",
      bathrooms ? `Bathrooms: ${bathrooms}` : "",
      facing ? `Facing: ${facing}` : "",
      furnishing ? `Furnishing: ${furnishing}` : "",
      ageYears ? `Age: ${ageYears} years` : "",
      priceStr ? `Asking price: ${priceStr}` : "",
      highlights?.length ? `Highlights: ${highlights.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[ai/describe] OpenRouter error:", errText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await res.json();
    const description = data.choices?.[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ description });
  } catch (err) {
    console.error("[ai/describe]", err);
    return NextResponse.json({ error: "Description generation failed" }, { status: 500 });
  }
}
