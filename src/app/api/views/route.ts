import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT slug, count FROM views ORDER BY count DESC").all() as { slug: string; count: number }[];
  const map: Record<string, number> = {};
  for (const row of rows) map[row.slug] = row.count;
  return NextResponse.json(map);
}
