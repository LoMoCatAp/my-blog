import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");
const ADMIN_PASSWORD = process.env.BLOG_ADMIN_PASSWORD || "admin123";

function checkAuth(request: NextRequest): boolean {
  const token = request.headers.get("x-admin-token");
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return decoded.split(":")[0] === ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug");

  // Single post content
  if (slug) {
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ slug, content });
  }

  // List all posts
  if (!fs.existsSync(POSTS_DIR)) {
    return NextResponse.json({ posts: [] });
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => ({
    slug: file.replace(/\.md$/, ""),
    filename: file,
    size: fs.statSync(path.join(POSTS_DIR, file)).size,
    mtime: fs.statSync(path.join(POSTS_DIR, file)).mtime.toISOString(),
  }));

  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug, content } = await request.json();
  if (!slug || !content) {
    return NextResponse.json({ error: "slug and content required" }, { status: 400 });
  }

  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
  if (!safeSlug) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  const filePath = path.join(POSTS_DIR, `${safeSlug}.md`);
  fs.writeFileSync(filePath, content, "utf-8");

  return NextResponse.json({ success: true, slug: safeSlug });
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await request.json();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return NextResponse.json({ success: true });
}
