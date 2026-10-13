const Database = require('better-sqlite3');
const path = 'data/blog.db';
const db = new Database(path);

const before = db.prepare("SELECT COUNT(*) c FROM analytics_events").get().c;

// Delete analytics older than 90 days
const del = db.prepare("DELETE FROM analytics_events WHERE date < date('now','-90 days')").run();

// Checkpoint WAL (TRUNCATE to reclaim space)
const cp = db.pragma('wal_checkpoint(TRUNCATE)');

// Integrity + optimize
const integrity = db.pragma('integrity_check');
db.pragma('optimize');
db.pragma('analysis_limit=400');
db.exec('ANALYZE');

const after = db.prepare("SELECT COUNT(*) c FROM analytics_events").get().c;
console.log(JSON.stringify({
  analytics_before: before,
  analytics_deleted: del.changes,
  analytics_after: after,
  wal_checkpoint: cp,
  integrity: integrity
}, null, 2));
db.close();
