import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { getDb } from "@/lib/db";
import fs from "fs";

function run(cmd: string): string {
  try { return execSync(cmd, { timeout: 5000, encoding: "utf-8" }).trim(); } catch { return "N/A"; }
}

export const dynamic = "force-dynamic";

function parseMem(line: string) {
  const p = line.split(/\s+/);
  return {
    total: parseInt(p[1]) || 0, used: parseInt(p[2]) || 0,
    free: parseInt(p[3]) || 0, buffers: parseInt(p[5]) || 0, cached: parseInt(p[6]) || 0,
  };
}

export async function GET() {
  // ── System ──
  const os = run("cat /etc/os-release | grep '^PRETTY_NAME=' | sed 's/PRETTY_NAME=//;s/\"//g'");
  const kernel = run("uname -r");
  const arch = run("uname -m");
  const hostname = run("hostname");
  const publicIp = run("curl -s --connect-timeout 3 https://checkip.amazonaws.com || echo 'N/A'");
  const internalIp = run("ip -4 -br addr show eth0 2>/dev/null | awk '{print $3}' | cut -d/ -f1 || echo 'N/A'");
  const uptimeS = Math.floor(parseFloat(run("cat /proc/uptime | awk '{print $1}'") || "0"));
  const bootTime = run("who -b | awk '{print $3,$4}'");
  const loadAvg = run("cat /proc/loadavg");
  const procs = run("ps aux --no-headers | wc -l");

  // ── CPU ──
  const cpuModel = run("grep 'model name' /proc/cpuinfo | head -1 | sed 's/.*: //'");
  const cpuCores = run("nproc");
  const cpuFreq = run("lscpu | grep 'CPU MHz' | awk '{print $3}' | head -1");
  const cpuUsage = run("top -bn1 | grep 'Cpu(s)' | awk '{print $2+$4}'");

  // ── Memory & Swap ──
  const memRaw = run("free -b | grep Mem");
  const mem = memRaw ? parseMem(memRaw) : { total: 0, used: 0, free: 0, buffers: 0, cached: 0 };
  const memActualUsed = mem.total - mem.free - mem.buffers - mem.cached;

  const swapRaw = run("free -b | grep Swap");
  const swapParts = swapRaw ? swapRaw.split(/\s+/) : [];
  const swapTotal = parseInt(swapParts[1]) || 0;
  const swapUsed = parseInt(swapParts[2]) || 0;
  const swapFree = parseInt(swapParts[3]) || 0;

  // ── Disk ──
  const diskRaw = run("df -BG | grep '^/' | head -5");
  const disks = diskRaw.split("\n").filter(Boolean).map((line) => {
    const p = line.split(/\s+/);
    return { fs: p[0], size: p[1], used: p[2], avail: p[3], pct: p[4], mount: p[5] };
  });

  // ── Network ──
  const netDevRaw = run("cat /proc/net/dev | tail -n+3");
  const netInterfaces = netDevRaw.split("\n").filter(Boolean).map((line) => {
    const p = line.trim().split(/\s+/);
    return { iface: p[0].replace(":", ""), rx: p[1], tx: p[9] };
  });

  // ── Top Processes ──
  const topCpu = run("ps aux --sort=-%cpu --no-headers | head -5").split("\n").filter(Boolean).map((l) => {
    const p = l.trim().split(/\s+/);
    return { user: p[0], cpu: p[2], mem: p[3], cmd: p[10]?.substring(0, 40) || "" };
  });
  const topMem = run("ps aux --sort=-%mem --no-headers | head -5").split("\n").filter(Boolean).map((l) => {
    const p = l.trim().split(/\s+/);
    return { user: p[0], cpu: p[2], mem: p[3], cmd: p[10]?.substring(0, 40) || "" };
  });

  // ── Services ──
  const blogSt = run("systemctl is-active blog.service");
  const nginxSt = run("systemctl is-active nginx");
  const dockerSt = run("systemctl is-active docker");

  const nodeVer = run("node -v");
  const npmVer = run("npm -v");
  const nextVer = run("cat /home/admin/.openclaw/workspace/my-blog/node_modules/next/package.json | grep '\"version\"' | head -1 | sed 's/.*: \"//;s/\",//'");

  // ── DB & Site ──
  const db = getDb();
  const postCount = (db.prepare("SELECT COUNT(*) as c FROM views").get() as any)?.c || 0;
  const commentCount = (db.prepare("SELECT COUNT(*) as c FROM comments").get() as any)?.c || 0;
  const foodCount = (db.prepare("SELECT COUNT(*) as c FROM foods").get() as any)?.c || 0;
  const viewCount = (db.prepare("SELECT COALESCE(SUM(count),0) as c FROM views").get() as any)?.c || 0;
  const visitsToday = (db.prepare("SELECT COUNT(*) as c FROM analytics_events WHERE date = date('now')").get() as any)?.c || 0;
  const dbSize = run("du -sh /home/admin/.openclaw/workspace/my-blog/data/ 2>/dev/null | awk '{print $1}'");

  // ── Music ──
  const musicDir = "/home/admin/.openclaw/workspace/my-blog/public/music";
  let musicSize = "0", musicFiles = "0";
  if (fs.existsSync(musicDir)) {
    musicSize = run(`du -sh ${musicDir} | awk '{print $1}'`);
    musicFiles = run(`ls ${musicDir}/*.mp3 2>/dev/null | wc -l`);
  }

  // ── Nginx ──
  let todayRequests = "N/A", lastMinute = "N/A";
  try {
    todayRequests = run("grep -c \"$(date +%d/%b/%Y)\" /var/log/nginx/access.log 2>/dev/null || echo 0");
    lastMinute = run("awk -v d=\"$(date -d '1 minute ago' '+%d/%b/%Y:%H:%M')\" '$4 > d' /var/log/nginx/access.log 2>/dev/null | wc -l || echo 0");
  } catch {}

  const fmt = (b: number) => {
    if (b >= 1073741824) return (b / 1073741824).toFixed(1) + "G";
    if (b >= 1048576) return (b / 1048576).toFixed(1) + "M";
    if (b >= 1024) return (b / 1024).toFixed(1) + "K";
    return b + "B";
  };

  const fmtUptime = (s: number) => {
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return NextResponse.json({
    system: {
      os, hostname, kernel, arch, publicIp, internalIp,
      uptime: { display: fmtUptime(uptimeS), seconds: uptimeS }, bootTime,
      load: loadAvg, processes: procs,
    },
    cpu: { model: cpuModel, cores: cpuCores, freq: cpuFreq ? cpuFreq + " MHz" : "N/A", usage: cpuUsage ? cpuUsage + "%" : "N/A" },
    memory: {
      total: fmt(mem.total), used: fmt(memActualUsed), free: fmt(mem.free),
      buffers: fmt(mem.buffers), cached: fmt(mem.cached),
      pct: mem.total ? Math.round((memActualUsed / mem.total) * 100) + "%" : "N/A",
      raw: { total: mem.total, used: memActualUsed },
    },
    swap: { total: fmt(swapTotal), used: fmt(swapUsed), free: fmt(swapFree), pct: swapTotal ? Math.round((swapUsed / swapTotal) * 100) + "%" : "0%" },
    disks,
    network: netInterfaces.slice(0, 5),
    processes: { topCpu, topMem },
    services: {
      blog: blogSt, nginx: nginxSt, docker: dockerSt,
      node: nodeVer, npm: npmVer, nextjs: nextVer,
    },
    site: {
      posts: postCount, comments: commentCount, foods: foodCount,
      totalViews: viewCount, visitsToday, musicSize: musicSize + " (" + musicFiles + " files)",
      dbSize, todayRequests, requestsLastMin: lastMinute,
    },
  });
}
