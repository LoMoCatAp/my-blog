import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.BLOG_ADMIN_PASSWORD || "admin123";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (password === ADMIN_PASSWORD) {
    // Simple token: base64 of password + timestamp, hashed
    const token = Buffer.from(`${ADMIN_PASSWORD}:${Date.now()}`).toString("base64");
    return NextResponse.json({ success: true, token });
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
