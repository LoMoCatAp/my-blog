"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DRINK_KINDS, type Drink } from "@/lib/meal-types";

const empty = { brand: "", name: "", kind: "fruit-tea", ingredients: "", avoid_tags: "", source_url: "", active: 1 };
const fieldClass = "w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)]";
export default function AdminDrinksPage() {
  const router = useRouter();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [editing, setEditing] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const headers = () => ({ "Content-Type": "application/json", "x-admin-token": sessionStorage.getItem("admin_token") || "" });
  async function load() {
    try {
      const res = await fetch("/api/drinks?all=true", { headers: headers() });
      if (res.status === 401) { router.replace("/admin"); return; }
      if (!res.ok) throw new Error();
      setDrinks((await res.json()).drinks);
    } catch { setMessage("加载失败，请重试"); }
  }
  useEffect(() => {
    if (!sessionStorage.getItem("admin_token")) { router.replace("/admin"); return; }
    load();
    // The catalogue is fetched once on entry; writes explicitly refresh it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);
  async function save(event: FormEvent) {
    event.preventDefault(); if (busy) return; setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/drinks", { method: editing ? "PUT" : "POST", headers: headers(), body: JSON.stringify({ ...form, ...(editing ? { id: editing } : {}) }) });
      const result = await res.json();
      if (!res.ok) { setMessage(result.error || "保存失败"); return; }
      setMessage(editing ? "已更新饮品" : "已添加饮品"); setEditing(null); setForm({ ...empty }); await load();
    } catch { setMessage("保存失败，请重试"); } finally { setBusy(false); }
  }
  async function remove(id: number) {
    if (busy) return; setBusy(true);
    try {
      const res = await fetch("/api/drinks", { method: "DELETE", headers: headers(), body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error();
      setConfirmDelete(null); setMessage("已删除饮品");
      if (editing === id) { setEditing(null); setForm({ ...empty }); }
      await load();
    } catch { setMessage("删除失败，请重试"); } finally { setBusy(false); }
  }
  const brands = [...new Set(drinks.map(x => x.brand))];
  const filtered = drinks.filter(x => (!brand || x.brand === brand) && `${x.name}${x.brand}`.includes(search.trim()));
  return <div className="max-w-4xl mx-auto px-4 py-8 text-[var(--text)]">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6"><h1 className="text-xl font-bold">饮品管理</h1><div className="flex gap-4 text-sm text-[var(--accent)]"><Link href="/admin/food">餐食管理</Link><Link href="/admin/posts">返回后台</Link></div></div>
    <form onSubmit={save} className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] mb-6">
      <h2 className="font-semibold mb-4">{editing ? "编辑饮品" : "添加饮品"}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {(["brand", "name", "ingredients", "avoid_tags", "source_url"] as const).map(key => <label key={key} className={`text-xs text-[var(--text-muted)] space-y-2 ${key === "source_url" ? "sm:col-span-2" : ""}`}>{({ brand: "品牌", name: "单品名称", ingredients: "主要食材（逗号分隔）", avoid_tags: "排除关键词（逗号分隔）", source_url: "菜单 / 单品来源链接" })[key]}<input className={fieldClass} value={form[key]} required={key === "name" || key === "brand"} maxLength={key === "source_url" ? 1000 : key === "brand" ? 40 : key === "name" ? 60 : 300} onChange={e => setForm(old => ({ ...old, [key]: e.target.value }))} /></label>)}
        <label className="text-xs text-[var(--text-muted)] space-y-2">类型<select className={fieldClass} value={form.kind} onChange={e => setForm(old => ({ ...old, kind: e.target.value }))}>{Object.entries(DRINK_KINDS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="flex items-center gap-2 text-sm self-center"><input type="checkbox" checked={form.active === 1} onChange={e => setForm(old => ({ ...old, active: e.target.checked ? 1 : 0 }))} />参与抽签</label>
      </div>
      <div className="flex gap-4 mt-5"><button disabled={busy} className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm disabled:opacity-50">{busy ? "保存中…" : editing ? "保存修改" : "添加"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm({ ...empty }); }} className="text-sm text-[var(--text-muted)]">取消编辑</button>}</div>
    </form>
    <p role="status" className="text-sm text-[var(--accent)] mb-4">{message}</p>
    <div className="flex flex-wrap items-center gap-3 mb-4"><input aria-label="搜索饮品" placeholder="搜索单品或品牌" className={`${fieldClass} max-w-xs`} value={search} onChange={e => setSearch(e.target.value)} /><select aria-label="按品牌筛选" className={`${fieldClass} max-w-[180px]`} value={brand} onChange={e => setBrand(e.target.value)}><option value="">所有品牌</option>{brands.map(x => <option key={x}>{x}</option>)}</select><span className="text-xs text-[var(--text-muted)]">{filtered.length} 款</span></div>
    <div className="space-y-3">{filtered.map(drink => <article key={drink.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-[var(--text-muted)]">{drink.brand} · {DRINK_KINDS[drink.kind]} · {drink.active ? "参与抽签" : "已停用"}</p><h2 className="font-semibold mt-1">{drink.name}</h2></div><div className="flex items-center gap-4 text-sm"><button onClick={() => { setEditing(drink.id); setForm({ brand: drink.brand, name: drink.name, kind: drink.kind, ingredients: drink.ingredients, avoid_tags: drink.avoid_tags, source_url: drink.source_url, active: drink.active }); }} className="text-[var(--accent)]">编辑</button><button disabled={busy} onClick={() => setConfirmDelete(drink.id)} className="text-[var(--text-muted)]">删除</button></div></div>
      <p className="text-xs text-[var(--text-muted)] mt-3">{drink.ingredients}</p>{drink.source_url && <a href={drink.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)] inline-block mt-2">单品来源 ↗</a>}
      {confirmDelete === drink.id && <div className="flex flex-wrap items-center gap-4 mt-4 text-sm"><span>删除「{drink.name}」？</span><button disabled={busy} onClick={() => remove(drink.id)} className="text-red-500">确认删除</button><button onClick={() => setConfirmDelete(null)}>取消</button></div>}
    </article>)}{!filtered.length && <p className="text-sm text-[var(--text-muted)]">没有匹配的饮品</p>}</div>
  </div>;
}
