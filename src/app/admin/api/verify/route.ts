import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.BLOG_ADMIN_PASSWORD || "admin123";

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const password = decoded.split(":")[0];
    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ valid: true });
    }
  } catch {}
  return NextResponse.json({ valid: false }, { status: 401 });
}
