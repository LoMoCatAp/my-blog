import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { DRINK_KINDS, type Drink } from "@/lib/meal-types";

export const dynamic = "force-dynamic";
function authorized(request: NextRequest) {
  const token = request.headers.get("x-admin-token");
  return !!token && Buffer.from(token, "base64").toString("utf8").split(":")[0] === (process.env.BLOG_ADMIN_PASSWORD || "admin123");
}
export async function GET(request: NextRequest) {
  const admin = request.nextUrl.searchParams.get("all") === "true";
  if (admin && !authorized(request)) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const drinks = getDb().prepare(admin ? "SELECT * FROM drinks ORDER BY brand,id" : "SELECT * FROM drinks WHERE active=1 ORDER BY brand,id").all() as Drink[];
  return NextResponse.json({ drinks, brands: [...new Set(drinks.map(x => x.brand))] }, { headers: { "Cache-Control": "no-store" } });
}
function readDrink(body: Record<string, unknown>) {
  const field = (key: string, max: number) => typeof body[key] === "string" ? (body[key] as string).trim().slice(0, max) : "";
  const result = { brand: field("brand", 40), name: field("name", 60), kind: field("kind", 20), ingredients: field("ingredients", 300), avoid_tags: field("avoid_tags", 300), source_url: field("source_url", 1000), active: body.active === 0 ? 0 : 1 };
  if (!result.brand || !result.name || !(result.kind in DRINK_KINDS)) throw new Error("请填写品牌、单品名称和饮品类型");
  if (result.source_url && !/^https?:\/\//i.test(result.source_url)) throw new Error("来源链接需要以 https:// 或 http:// 开头");
  return result;
}
async function save(request: NextRequest, editing: boolean) {
  if (!authorized(request)) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const body = await request.json();
    const drink = readDrink(body);
    const args = [drink.brand, drink.name, drink.kind, drink.ingredients, drink.avoid_tags, drink.source_url, drink.active];
    const db = getDb();
    if (editing) {
      if (!Number.isSafeInteger(body.id) || body.id < 1) return NextResponse.json({ error: "无效的饮品编号" }, { status: 400 });
      const result = db.prepare("UPDATE drinks SET brand=?,name=?,kind=?,ingredients=?,avoid_tags=?,source_url=?,active=?,updated_at=datetime('now') WHERE id=?").run(...args, body.id);
      if (!result.changes) return NextResponse.json({ error: "饮品已不存在" }, { status: 404 });
    } else db.prepare("INSERT INTO drinks (brand,name,kind,ingredients,avoid_tags,source_url,active) VALUES (?,?,?,?,?,?,?)").run(...args);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 400 });
  }
}
export async function POST(request: NextRequest) { return save(request, false); }
export async function PUT(request: NextRequest) { return save(request, true); }
export async function DELETE(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const body = await request.json();
    if (!Number.isSafeInteger(body.id) || body.id < 1) return NextResponse.json({ error: "无效的饮品编号" }, { status: 400 });
    const result = getDb().prepare("DELETE FROM drinks WHERE id=?").run(body.id);
    return NextResponse.json({ success: !!result.changes }, { status: result.changes ? 200 : 404 });
  } catch { return NextResponse.json({ error: "无效请求" }, { status: 400 }); }
}
