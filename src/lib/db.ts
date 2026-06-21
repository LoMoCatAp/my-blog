import Database from "better-sqlite3";
import path from "path";

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
  `);
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
