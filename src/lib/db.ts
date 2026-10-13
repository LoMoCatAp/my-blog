import Database from "better-sqlite3";
import path from "path";
import { DRINK_CATALOG } from "./drink-catalog";

const DB_PATH = path.join(process.cwd(), "data/blog.db");

let db: Database.Database | null = null;
let lastMaintenance = 0;
const MAINTENANCE_INTERVAL = 6 * 60 * 60 * 1000; // every 6 hours

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  // Auto-maintenance: run only once every 6 hours
  const now = Date.now();
  if (now - lastMaintenance > MAINTENANCE_INTERVAL) {
    lastMaintenance = now;
    try {
      db.pragma("wal_checkpoint(TRUNCATE)");
      const deleted = db.prepare("DELETE FROM analytics_events WHERE date < date('now', '-30 days')").run();
      if (deleted.changes > 0) {
        console.log("[DB] Auto-cleaned", deleted.changes, "old analytics");
      }
    } catch {
      // silent
    }
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS views (
      slug TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '匿名',
      content TEXT NOT NULL,
      parent_id INTEGER DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS music (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '未命名',
      artist TEXT DEFAULT '未知',
      filename TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL DEFAULT '/',
      referrer TEXT DEFAULT '',
      date TEXT NOT NULL DEFAULT (date('now')),
      page_title TEXT DEFAULT '',
      country TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(date);
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '',
      restaurant TEXT DEFAULT '',
      price TEXT DEFAULT '',
      created_at TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS drinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand TEXT NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      ingredients TEXT NOT NULL DEFAULT '',
      avoid_tags TEXT NOT NULL DEFAULT '',
      source_url TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0, 1)),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  // Existing food data is retained. Also make a fresh installation compatible
  // with the food editor's current schema.
  const foodColumns = new Set((db.pragma("table_info(foods)") as { name: string }[]).map(x => x.name));
  for (const column of ["flavors", "ingredients", "methods", "cuisines", "satiety", "mood", "avoid_tags"]) {
    if (!foodColumns.has(column)) db.exec(`ALTER TABLE foods ADD COLUMN ${column} TEXT NOT NULL DEFAULT ''`);
  }
  db.transaction(() => {
    if (db.prepare("SELECT 1 FROM site_content WHERE key = ?").get("drink_catalog_v7")) return;
    const insert = db.prepare("INSERT INTO drinks (brand,name,kind,ingredients,avoid_tags,source_url,active) VALUES (?,?,?,?,?,?,?)");
    // Do not overwrite a catalogue that an administrator has already created.
    if ((db.prepare("SELECT COUNT(*) AS count FROM drinks").get() as { count: number }).count === 0) {
      for (const drink of DRINK_CATALOG) insert.run(drink.brand, drink.name, drink.kind, drink.ingredients, drink.avoid_tags, drink.source_url, drink.active);
    }
    db.prepare("INSERT INTO site_content (key,value) VALUES (?,?)").run("drink_catalog_v7", "2026-10-12");
  })();
}

/** Periodic maintenance: checkpoint WAL, clean old analytics (30+ days) */
export function maintenanceDb(): void {
  const d = getDb();
  try {
    d.pragma("wal_checkpoint(TRUNCATE)");
    const deleted = d.prepare("DELETE FROM analytics_events WHERE date < date('now', '-30 days')").run();
    if (deleted.changes > 0) {
      console.log("[DB] Cleaned", deleted.changes, "old analytics records");
    }
  } catch {
    // silent
  }
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
