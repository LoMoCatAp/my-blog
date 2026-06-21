import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

const ADMIN_PASSWORD = process.env.BLOG_ADMIN_PASSWORD || "admin123";

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

  try {
    const blogDir = process.cwd();
    execSync(`cd ${blogDir} && npx next build --no-lint`, { timeout: 120000, stdio: "pipe" });
    execSync("sudo systemctl restart blog", { timeout: 10000 });
    return NextResponse.json({ success: true, message: "✅ 构建并重启成功" });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "❌ 构建失败: " + (err.message || "未知错误"),
    });
  }
}
