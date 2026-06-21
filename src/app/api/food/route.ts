import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ADMIN_PASSWORD = process.env.BLOG_ADMIN_PASSWORD || "admin123";

function checkAuth(token: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return decoded.split(":")[0] === ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const sp = (name: string, def = "") => request.nextUrl.searchParams.get(name) || def;

  const allmode   = sp("all");
  const flavors    = sp("flavors");
  const ingredients = sp("ingredients");
  const methods    = sp("methods");
  const cuisines   = sp("cuisines");
  const satiety    = sp("satiety");
  const mood       = sp("mood");
  const avoid      = sp("avoid");
  const count      = Math.min(999, parseInt(sp("count", "3")));

  const db = getDb();
  const all = db.prepare("SELECT * FROM foods").all() as any[];

  // 1. RED LINE: absolute no-go filter
  let pool = all;
  if (avoid) {
    const avoidList = avoid.split(",").map((a: string) => a.trim().toLowerCase()).filter(Boolean);
    for (const keyword of avoidList) {
      pool = pool.filter((f: any) => {
        const af = (f.avoid_tags || "").toLowerCase();
        const nm = f.name.toLowerCase();
        return !af.includes(keyword) && !nm.includes(keyword);
      });
    }
  }

  // 2. Score-based ranking with ingredient tracking
  const prefs = {
    flavors:    flavors ? flavors.split(",").map((s: string) => s.trim().toLowerCase()) : [],
    ingredients: ingredients ? ingredients.split(",").map((s: string) => s.trim().toLowerCase()) : [],
    methods:    methods ? methods.split(",").map((s: string) => s.trim().toLowerCase()) : [],
    cuisines:   cuisines ? cuisines.split(",").map((s: string) => s.trim().toLowerCase()) : [],
    satiety:    satiety ? satiety.toLowerCase() : "",
    mood:       mood ? mood.toLowerCase() : "",
  };

  const scored = pool.map((food: any) => {
    let score = 0;
    let ingScore = 0;

    for (const f of prefs.flavors) {
      if ((food.flavors || "").toLowerCase().includes(f)) score += 4;
    }
    for (const ing of prefs.ingredients) {
      if ((food.ingredients || "").toLowerCase().includes(ing)) {
        score += 3;
        ingScore += 3;
      }
    }
    for (const m of prefs.methods) {
      if ((food.methods || "").toLowerCase().includes(m)) score += 2;
    }
    for (const c of prefs.cuisines) {
      if ((food.cuisines || "").toLowerCase().includes(c)) score += 1;
    }
    if (prefs.satiety && (food.satiety || "").toLowerCase().includes(prefs.satiety)) score += 1.5;
    if (prefs.mood && (food.mood || "").toLowerCase().includes(prefs.mood)) score += 2;

    return { ...food, score, ingScore };
  });

  // Bypass all filtering for admin (all=true)
  if (allmode === "true") {
    const allFoods = scored.sort(() => Math.random() - 0.5).slice(0, count);
    return NextResponse.json({ foods: allFoods, total: pool.length, filtered: pool.length });
  }

  const sorted = scored.sort((a: any, b: any) => {
    if (b.score !== a.score) return b.score - a.score;
    return Math.random() - 0.5;
  });

  const hasInput = flavors || ingredients || methods || cuisines || satiety || mood;
  let results = sorted.filter((f: any) => f.score > 0);

  if (!hasInput || results.length === 0) {
    results = pool.filter((f: any) =>
      (f.flavors || "").includes("酱香") || (f.flavors || "").includes("酸甜") || f.name.includes("红烧")
    ).map((f: any) => ({ ...f, score: 1, ingScore: 0 }));
    if (results.length === 0) results = pool.map((f: any) => ({ ...f, score: 1, ingScore: 0 }));
  }

  const topScore = results.length > 0 ? results[0].score : 0;
  const topTier = results.filter((f: any) => f.score >= topScore - 1);
  let final = [...topTier].sort(() => Math.random() - 0.5).slice(0, count);

  // Fill remaining slots — prefer ingredient-matched items
  if (final.length < count) {
    const remaining = results.filter((f: any) => !final.find((r: any) => r.id === f.id));
    const need = count - final.length;
    const withIng = remaining.filter((f: any) => f.ingScore > 0);
    const noIng  = remaining.filter((f: any) => f.ingScore === 0);
    const fillers = withIng.length >= need ? withIng : [...withIng, ...noIng];
    final.push(...fillers.slice(0, need));
  }

  return NextResponse.json({ foods: final, total: pool.length, filtered: results.length });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const db = getDb();
  db.prepare(`INSERT INTO foods (name, flavors, ingredients, methods, cuisines, satiety, mood, avoid_tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(body.name, body.flavors || "", body.ingredients || "", body.methods || "",
          body.cuisines || "", body.satiety || "", body.mood || "", body.avoid_tags || "");
  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const db = getDb();
  db.prepare(`UPDATE foods SET name=?, flavors=?, ingredients=?, methods=?, cuisines=?, satiety=?, mood=?, avoid_tags=? WHERE id=?`)
    .run(body.name, body.flavors || "", body.ingredients || "", body.methods || "",
          body.cuisines || "", body.satiety || "", body.mood || "", body.avoid_tags || "", body.id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await request.json();
  const db = getDb();
  db.prepare("DELETE FROM foods WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
