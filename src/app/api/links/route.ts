import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ADMIN_PASSWORD = process.env.BLOG_ADMIN_PASSWORD || "admin123";

export async function GET() {
  const db = getDb();
  const links = db.prepare("SELECT id, name, url, description, sort_order FROM links ORDER BY sort_order ASC, id ASC").all();
  return NextResponse.json(links);
}

export async function POST(request: NextRequest) {
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

  const db = getDb();
  const { id, name, url, description } = await request.json();

  if (id) {
    // Update
    db.prepare("UPDATE links SET name = ?, url = ?, description = ? WHERE id = ?").run(name, url, description || "", id);
  } else {
    // Create
    db.prepare("INSERT INTO links (name, url, description) VALUES (?, ?, ?)").run(name, url, description || "");
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
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

  const { id } = await request.json();
  const db = getDb();
  db.prepare("DELETE FROM links WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
