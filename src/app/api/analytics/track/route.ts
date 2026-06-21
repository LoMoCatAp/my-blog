import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { path, referrer, pageTitle } = body;

  if (!path) {
    return NextResponse.json({ error: "path required" }, { status: 400 });
  }

  // Extract a rough country from x-forwarded-for headers (or use CF IP geo)
  // For simplicity, just record a placeholder - no external geo IP needed
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "";

  const db = getDb();
  db.prepare(
    "INSERT INTO analytics_events (path, referrer, date, page_title, country) VALUES (?, ?, date('now'), ?, ?)"
  ).run(
    path.slice(0, 500),
    (referrer || "").slice(0, 500),
    (pageTitle || "").slice(0, 200),
    ""
  );

  return NextResponse.json({ success: true });
}
