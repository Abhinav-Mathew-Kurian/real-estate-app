import { NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { folder = "kerala-properties" } = await req.json();

  const timestamp = Math.round(Date.now() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha256").update(toSign).digest("hex");

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder });
}
