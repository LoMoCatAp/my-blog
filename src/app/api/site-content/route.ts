import { NextRequest, NextResponse } from "next/server";
import { getSiteContent, updateSiteContent } from "@/lib/site-content";
import { getDb } from "@/lib/db";

const ADMIN_PASSWORD = process.env.BLOG_ADMIN_PASSWORD || "admin123";

export async function GET() {
  const content = getSiteContent();
  return NextResponse.json(content);
}

export async function POST(request: NextRequest) {
  // Auth check
  const token = request.headers.get("x-admin-token");
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    if (decoded.split(":")[0] !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { key, value } = await request.json();
  if (!key) {
    return NextResponse.json({ error: "key required" }, { status: 400 });
  }

  updateSiteContent(key, value);
  return NextResponse.json({ success: true });
}
