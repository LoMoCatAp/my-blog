/**
 * Format SQLite datetime string (UTC) as a friendly relative time, e.g. "2 天前".
 */
export function friendlyTime(dateStr: string): string {
  const now = Date.now();
  // SQLite datetime('now') returns UTC like "2026-06-20 07:30:00"
  // Append "Z" to treat it as UTC, not local
  const date = new Date(dateStr.replace(" ", "T") + "Z").getTime();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;

  // Fallback to date string in local timezone
  const d = new Date(dateStr.replace(" ", "T") + "Z");
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
