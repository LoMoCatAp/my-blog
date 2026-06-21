import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();

  // Today's stats
  const today = db.prepare(
    "SELECT COUNT(*) as count, COUNT(DISTINCT path) as pages FROM analytics_events WHERE date = date('now')"
  ).get() as { count: number; pages: number };

  // Total all time
  const total = db.prepare(
    "SELECT COUNT(*) as count FROM analytics_events"
  ).get() as { count: number };

  // Top pages this week
  const topPages = db.prepare(
    "SELECT path, page_title, COUNT(*) as count FROM analytics_events WHERE date >= date('now', '-7 days') GROUP BY path ORDER BY count DESC LIMIT 10"
  ).all();

  // Daily trend (last 14 days)
  const dailyTrend = db.prepare(
    "SELECT date, COUNT(*) as count FROM analytics_events WHERE date >= date('now', '-13 days') GROUP BY date ORDER BY date ASC"
  ).all();

  // Top referrers this week
  const topReferrers = db.prepare(
    "SELECT referrer, COUNT(*) as count FROM analytics_events WHERE date >= date('now', '-7 days') AND referrer != '' GROUP BY referrer ORDER BY count DESC LIMIT 10"
  ).all();

  return NextResponse.json({
    today,
    total: total.count,
    topPages,
    dailyTrend,
    topReferrers,
  });
}
