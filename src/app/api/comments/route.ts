import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyCaptcha } from "@/lib/captcha";

// Simple in-memory rate limit: IP → timestamp
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < RATE_LIMIT_MS) return false;
  rateLimitMap.set(ip, now);
  if (rateLimitMap.size > 1000) {
    const cutoff = now - RATE_LIMIT_MS;
    for (const [key, val] of rateLimitMap) {
      if (val < cutoff) rateLimitMap.delete(key);
    }
  }
  return true;
}

interface CommentRow {
  id: number;
  name: string;
  content: string;
  created_at: string;
  parent_id: number | null;
}

interface CommentNode extends CommentRow {
  replies: CommentNode[];
}

function buildCommentTree(rows: CommentRow[]): CommentNode[] {
  const map = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  for (const row of rows) {
    map.set(row.id, { ...row, replies: [] });
  }

  for (const row of rows) {
    const node = map.get(row.id)!;
    if (row.parent_id && map.has(row.parent_id)) {
      map.get(row.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const db = getDb();
  const rows = db
    .prepare("SELECT id, name, content, created_at, parent_id FROM comments WHERE slug = ? ORDER BY created_at ASC")
    .all(slug) as CommentRow[];

  const tree = buildCommentTree(rows);
  return NextResponse.json(tree);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug, name, content, captchaAnswer, captchaToken, honeypot, parentId } = body;

  if (honeypot) {
    return NextResponse.json({ error: "bot detected" }, { status: 400 });
  }

  if (!slug || !content?.trim()) {
    return NextResponse.json({ error: "slug and content required" }, { status: 400 });
  }

  if (!captchaAnswer || !captchaToken) {
    return NextResponse.json({ error: "请完成验证码" }, { status: 400 });
  }
  if (!verifyCaptcha(captchaAnswer, captchaToken)) {
    return NextResponse.json({ error: "验证码错误或已过期" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "操作太频繁，请稍后再试" }, { status: 429 });
  }

  // Validate parent exists if provided
  const db = getDb();
  if (parentId) {
    const parent = db.prepare("SELECT id FROM comments WHERE id = ?").get(parentId);
    if (!parent) {
      return NextResponse.json({ error: "父评论不存在" }, { status: 400 });
    }
  }

  const result = db
    .prepare("INSERT INTO comments (slug, name, content, parent_id) VALUES (?, ?, ?, ?)")
    .run(slug, (name || "匿名").trim(), content.trim(), parentId || null);

  return NextResponse.json({ id: result.lastInsertRowid, success: true });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const db = getDb();
  // Delete comment and any replies (cascade via FK)
  db.prepare("DELETE FROM comments WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
