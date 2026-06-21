"use client";

import { useEffect, useState } from "react";

interface ServerData {
  system: {
    os: string; hostname: string; kernel: string; arch: string;
    publicIp: string; internalIp: string;
    uptime: { display: string; seconds: number }; bootTime: string;
    load: string; processes: string;
  };
  cpu: { model: string; cores: string; freq: string; usage: string };
  memory: { total: string; used: string; free: string; buffers: string; cached: string; pct: string; raw: { total: number; used: number } };
  swap: { total: string; used: string; free: string; pct: string };
  disks: { fs: string; size: string; used: string; avail: string; pct: string; mount: string }[];
  network: { iface: string; rx: string; tx: string }[];
  processes: {
    topCpu: { user: string; cpu: string; mem: string; cmd: string }[];
    topMem: { user: string; cpu: string; mem: string; cmd: string }[];
  };
  services: { blog: string; nginx: string; docker: string; node: string; npm: string; nextjs: string };
  site: {
    posts: number; comments: number; foods: number; totalViews: number;
    visitsToday: number; musicSize: string; dbSize: string; todayRequests: string; requestsLastMin: string;
  };
}

export default function ServerPage() {
  const [data, setData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch("/api/server").then((r) => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { const t = setInterval(fetchData, 15000); return () => clearInterval(t); }, []);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center text-[var(--text-muted)]">
      <div className="inline-block w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-[var(--text-muted)]">获取失败</div>;

  const { system, cpu, memory, swap, disks, network, processes, services, site } = data;

  const fmtBytes = (v: string) => {
    const n = parseFloat(v);
    if (v.endsWith("G")) return (n * 1073741824);
    if (v.endsWith("M")) return (n * 1048576);
    if (v.endsWith("K")) return (n * 1024);
    return n;
  };

  const Bar = ({ pct }: { pct: string }) => {
    const n = parseInt(pct);
    const color = n > 80 ? "#ef4444" : n > 50 ? "#eab308" : "#22c55e";
    return <div className="w-full h-2.5 bg-[var(--border)] rounded-full overflow-hidden mt-1">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: Math.min(n, 100) + "%", background: color }} />
    </div>;
  };

  const Card = ({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center gap-2">
        {icon && <span>{icon}</span>}
        <span className="text-sm font-semibold text-[var(--text)]">{title}</span>
      </div>
      <div className="p-4 space-y-1.5">{children}</div>
    </div>
  );

  const Label = ({ children }: { children: React.ReactNode }) => <span className="text-xs text-[var(--text-muted)]">{children}</span>;
  const Value = ({ children, ok }: { children: React.ReactNode; ok?: boolean }) => (
    <span className="text-xs font-mono flex items-center gap-1" style={{ color: ok !== undefined ? (ok ? "#22c55e" : "#ef4444") : "var(--text)" }}>
      {ok !== undefined && <span className={`inline-block w-2 h-2 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`} />}
      {children}
    </span>
  );
  const Row = ({ label, children, ok }: { label: string; children: React.ReactNode; ok?: boolean }) => (
    <div className="flex items-center justify-between py-1 border-b border-[var(--border)] last:border-0">
      <Label>{label}</Label>
      <Value ok={ok}>{children}</Value>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
        <h1 className="text-xl font-bold text-[var(--text)]">服务器状态</h1>
        <span className="text-[10px] text-[var(--text-muted)]">每 15s 刷新</span>
        <button onClick={fetchData} className="ml-auto text-xs text-[var(--accent)] hover:underline">刷新</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* System */}
        <Card title="系统" icon="🖥️">
          <Row label="OS">{system.os}</Row>
          <Row label="主机名">{system.hostname}</Row>
          <Row label="内核">{system.kernel}</Row>
          <Row label="架构">{system.arch}</Row>
          <Row label="公网 IP">{system.publicIp}</Row>
          <Row label="内网 IP">{system.internalIp}</Row>
          <Row label="运行时间">{system.uptime.display}</Row>
          <Row label="启动时间">{system.bootTime}</Row>
          <Row label="进程数">{system.processes}</Row>
        </Card>

        {/* CPU */}
        <Card title="CPU" icon="⚡">
          <Row label="型号">{cpu.model.substring(0, 55)}</Row>
          <Row label="核心数">{cpu.cores}</Row>
          <Row label="主频">{cpu.freq}</Row>
          <Row label="使用率">{cpu.usage}</Row>
        </Card>

        {/* Memory */}
        <Card title="内存" icon="🧠">
          <p className="text-lg font-bold text-[var(--text)]">{memory.used}<span className="text-xs font-normal text-[var(--text-muted)]"> / {memory.total}</span></p>
          <Bar pct={memory.pct} />
          <div className="text-[10px] text-[var(--text-muted)] flex justify-between mt-0.5">
            <span>已用 {memory.used} ({memory.pct})</span>
            <span>缓冲 {memory.buffers}</span>
            <span>缓存 {memory.cached}</span>
            <span>空闲 {memory.free}</span>
          </div>
        </Card>

        {/* Swap + Disks combined area */}
        <Card title="交换分区" icon="💽">
          {swap.total !== "0B" ? (
            <>
              <p className="text-lg font-bold text-[var(--text)]">{swap.used}<span className="text-xs font-normal text-[var(--text-muted)]"> / {swap.total}</span></p>
              <Bar pct={swap.pct} />
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">已用 {swap.pct} · 空闲 {swap.free}</div>
            </>
          ) : <p className="text-xs text-[var(--text-muted)]">无交换分区</p>}
        </Card>
      </div>

      {/* Disks */}
      <div className="mt-4">
        <Card title="磁盘" icon="💾">
          {disks.map((d, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs">
                <span className="font-mono text-[var(--text)]">{d.mount}</span>
                <span className="text-[var(--text-muted)]">{d.used} / {d.size} ({d.pct})</span>
              </div>
              <Bar pct={d.pct} />
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{d.fs} · 剩余 {d.avail}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Network */}
      <div className="mt-4">
        <Card title="网络接口" icon="🌐">
          {network.map((n, i) => (
            <Row key={i} label={n.iface}>
              收 {fmtBytes(n.rx) >= 1073741824 ? (fmtBytes(n.rx)/1073741824).toFixed(1)+"G" : (fmtBytes(n.rx)/1048576).toFixed(1)+"M"}
              &nbsp;/ 发 {fmtBytes(n.tx) >= 1073741824 ? (fmtBytes(n.tx)/1073741824).toFixed(1)+"G" : (fmtBytes(n.tx)/1048576).toFixed(1)+"M"}
            </Row>
          ))}
        </Card>
      </div>

      {/* Processes */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="CPU 占用 Top 5">
          {processes.topCpu.map((p, i) => (
            <Row key={i} label={`${p.user}`}>
              {p.cpu}% · {p.mem}% · {p.cmd}
            </Row>
          ))}
        </Card>
        <Card title="内存占用 Top 5">
          {processes.topMem.map((p, i) => (
            <Row key={i} label={`${p.user}`}>
              {p.mem}% · {p.cpu}% · {p.cmd}
            </Row>
          ))}
        </Card>
      </div>

      {/* Services & Site */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="服务" icon="⚙️">
          <Row label="Blog" ok={services.blog === "active"}>Running</Row>
          <Row label="Nginx" ok={services.nginx === "active"}>Running</Row>
          <Row label="Docker" ok={services.docker === "active"}>{services.docker === "active" ? "Running" : "Stopped"}</Row>
          <Row label="Node.js">{services.node}</Row>
          <Row label="npm">{services.npm}</Row>
          <Row label="Next.js">{services.nextjs}</Row>
        </Card>

        <Card title="站点数据" icon="📊">
          <Row label="文章阅读量">{String(site.posts)}</Row>
          <Row label="评论数">{String(site.comments)}</Row>
          <Row label="美食数">{String(site.foods)}</Row>
          <Row label="累计阅读">{site.totalViews.toLocaleString()}</Row>
          <Row label="今日访问">{String(site.visitsToday)}</Row>
          <Row label="今日 Nginx 请求">{String(site.todayRequests)}</Row>
          <Row label="最近 1 分钟">{String(site.requestsLastMin)} 请求</Row>
          <Row label="数据大小">{site.dbSize}</Row>
          <Row label="音乐文件">{site.musicSize}</Row>
        </Card>
      </div>

      {/* Load */}
      <div className="mt-4">
        <Card title="负载" icon="📈">
          <Row label="负载（1/5/15 分钟）">{system.load}</Row>
          <Row label="运行时间">{system.uptime.display}</Row>
          <Row label="自启动以来">{system.bootTime}</Row>
        </Card>
      </div>
    </div>
  );
}
