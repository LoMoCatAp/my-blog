import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import fs from "fs";
import path from "path";

const ADMIN_PASSWORD = process.env.BLOG_ADMIN_PASSWORD || "admin123";
const MUSIC_DIR = path.join(process.cwd(), "public/music");

function checkAuth(token: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return decoded.split(":")[0] === ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export async function GET() {
  const db = getDb();
  const songs = db.prepare("SELECT id, title, artist, filename FROM music ORDER BY sort_order ASC, id ASC").all();
  return NextResponse.json(songs);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-admin-token");
  if (!checkAuth(token)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string) || "未命名";
  const artist = (formData.get("artist") as string) || "未知";

  if (!file) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  // Check file type
  if (!file.name.endsWith(".mp3") && !file.name.endsWith(".ogg") && !file.name.endsWith(".wav")) {
    return NextResponse.json({ error: "only mp3/ogg/wav allowed" }, { status: 400 });
  }

  // Save file
  if (!fs.existsSync(MUSIC_DIR)) {
    fs.mkdirSync(MUSIC_DIR, { recursive: true });
  }

  // Generate unique filename
  const ext = path.extname(file.name);
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(MUSIC_DIR, safeName), buffer);

  // Save to DB
  const db = getDb();
  const result = db.prepare("INSERT INTO music (title, artist, filename) VALUES (?, ?, ?)").run(title, artist, safeName);

  return NextResponse.json({ success: true, id: result.lastInsertRowid, filename: safeName });
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get("x-admin-token");
  if (!checkAuth(token)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  const db = getDb();
  const song = db.prepare("SELECT filename FROM music WHERE id = ?").get(id) as { filename: string } | undefined;

  if (song) {
    const filePath = path.join(MUSIC_DIR, song.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.prepare("DELETE FROM music WHERE id = ?").run(id);
  }

  return NextResponse.json({ success: true });
}
