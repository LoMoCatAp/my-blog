"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Food {
  id: number;
  name: string;
  flavors: string;
  ingredients: string;
  methods: string;
  cuisines: string;
  satiety: string;
  mood: string;
  avoid_tags: string;
}

const FLAVORS = ["清淡","麻辣","酸辣","香辣","糖醋","酱香","蒜香","咖喱","麻酱"];
const INGREDIENTS = ["猪肉","牛肉","羊肉","鸡肉","鸭肉","鱼","虾蟹","蛋类","豆制品","蔬菜","菌菇","面食","米饭","水果"];
const METHODS = ["爆炒","蒸煮","煎炸烤","炖焖煲","凉拌","焗烤"];
const CUISINES = ["川湘","粤菜","江浙","东北","西北","日韩","东南亚","西餐","云贵","台式","广西","湘菜","客家","鲁菜"];
const SATIETIES = ["汤水多","干爽无汤","轻食七分饱","硬菜大快朵颐"];
const MOODS = ["放纵","克制","没胃口","一般"];

export default function AdminFoodPage() {
  const router = useRouter();
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [flavors, setFlavors] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [methods, setMethods] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [satiety, setSatiety] = useState("");
  const [mood, setMood] = useState("");
  const [avoid, setAvoid] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filterFlavor, setFilterFlavor] = useState("");
  const [filterCuisine, setFilterCuisine] = useState("");
  const [filterIngredient, setFilterIngredient] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) { router.replace("/admin"); return; }
    loadFoods();
  }, [router]);

  const loadFoods = async () => {
    try {
      const res = await fetch("/api/food?all=true&count=999");
      if (res.ok) setFoods((await res.json()).foods);
    } catch {}
    setLoading(false);
  };

  const toggleMulti = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleAdd = async () => {
    if (!name.trim()) { setMessage("请输入菜名"); return; }
    const token = sessionStorage.getItem("admin_token");
    const res = await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token || "" },
      body: JSON.stringify({
        name: name.trim(),
        flavors: flavors.join(","),
        ingredients: ingredients.join(","),
        methods: methods.join(","),
        cuisines: cuisines.join(","),
        satiety,
        mood,
        avoid_tags: avoid,
      }),
    });
    if (res.ok) {
      setMessage("已添加");
      setName(""); setFlavors([]); setIngredients([]); setMethods([]);
      setCuisines([]); setSatiety(""); setMood(""); setAvoid("");
      loadFoods();
    } else {
      setMessage("添加失败");
    }
  };

  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name:"", flavors:"", ingredients:"", methods:"", cuisines:"", satiety:"", mood:"", avoid_tags:"" });

  const startEdit = (f: Food) => {
    setEditing(f.id);
    setEditForm({ name:f.name, flavors:f.flavors, ingredients:f.ingredients, methods:f.methods, cuisines:f.cuisines, satiety:f.satiety, mood:f.mood, avoid_tags:f.avoid_tags });
  };

  const saveEdit = async () => {
    const token = sessionStorage.getItem("admin_token");
    await fetch(`/api/food`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token || "" },
      body: JSON.stringify({ id: editing, ...editForm }),
    });
    setEditing(null);
    loadFoods();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除？")) return;
    const token = sessionStorage.getItem("admin_token");
    await fetch(`/api/food`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-token": token || "" },
      body: JSON.stringify({ id }),
    });
    loadFoods();
  };

  const ChipAdd = ({ label, arr, set }: { label: string; arr: string[]; set: (v: string[]) => void }) => (
    <button onClick={() => toggleMulti(arr, label, set)}
      className={`px-2 py-1 rounded text-xs transition-all ${arr.includes(label) ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:border-[var(--accent)] border border-transparent"}`}>
      {label}
    </button>
  );

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 30;
  const filteredFoods = foods.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterFlavor && !f.flavors?.includes(filterFlavor)) return false;
    if (filterCuisine && !f.cuisines?.includes(filterCuisine)) return false;
    if (filterIngredient && !f.ingredients?.includes(filterIngredient)) return false;
    return true;
  });
  const totalPages = Math.ceil(filteredFoods.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const pagedFoods = filteredFoods.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 text-center text-[var(--text-muted)]">加载中...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[var(--text)]">🍽️ 美食管理</h1>
        <Link href="/admin/posts" className="text-sm text-[var(--accent)] hover:underline">← 返回</Link>
      </div>

      {/* Add form */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] mb-6 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="菜名"
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm outline-none focus:border-[var(--accent)]" />

        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">味型</p>
          <div className="flex flex-wrap gap-1.5">{FLAVORS.map((v) => <ChipAdd key={v} label={v} arr={flavors} set={setFlavors} />)}</div>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">食材</p>
          <div className="flex flex-wrap gap-1.5">{INGREDIENTS.map((v) => <ChipAdd key={v} label={v} arr={ingredients} set={setIngredients} />)}</div>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">做法</p>
          <div className="flex flex-wrap gap-1.5">{METHODS.map((v) => <ChipAdd key={v} label={v} arr={methods} set={setMethods} />)}</div>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">菜系</p>
          <div className="flex flex-wrap gap-1.5">{CUISINES.map((v) => <ChipAdd key={v} label={v} arr={cuisines} set={setCuisines} />)}</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">饱腹感</p>
            <select value={satiety} onChange={(e) => setSatiety(e.target.value)} className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-xs">
              <option value="">不限</option>
              {SATIETIES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">心情</p>
            <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-xs">
              <option value="">不限</option>
              {MOODS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">忌口标签</p>
            <input value={avoid} onChange={(e) => setAvoid(e.target.value)} placeholder="如:不吃香菜"
              className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-xs outline-none" />
          </div>
        </div>
        <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium">添加</button>
        {message && <p className="text-xs text-[var(--text-muted)]">{message}</p>}
      </div>

      {/* Search & Filter */}
      <div className="mb-4 space-y-2">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索菜名..."
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm outline-none focus:border-[var(--accent)]" />
        <div className="flex gap-2 text-xs">
          <select value={filterFlavor} onChange={(e) => setFilterFlavor(e.target.value)}
            className="flex-1 px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)]">
            <option value="">全部味型</option>
            {FLAVORS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={filterCuisine} onChange={(e) => setFilterCuisine(e.target.value)}
            className="flex-1 px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)]">
            <option value="">全部菜系</option>
            {CUISINES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={filterIngredient} onChange={(e) => setFilterIngredient(e.target.value)}
            className="flex-1 px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)]">
            <option value="">全部食材</option>
            {INGREDIENTS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Food list */}
      <div className="text-xs text-[var(--text-muted)] mb-2">
        共 {filteredFoods.length} 道菜
      </div>
      <div className="space-y-2">
        {pagedFoods.map((f) => (
          <div key={f.id} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
            {editing === f.id ? (
              <div className="space-y-2">
                <input value={editForm.name} onChange={(e) => setEditForm({...editForm,name:e.target.value})}
                  className="w-full px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg)] text-sm" />
                <div className="grid grid-cols-4 gap-1 text-xs">
                  <input value={editForm.flavors} onChange={(e) => setEditForm({...editForm,flavors:e.target.value})} placeholder="味型" className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)]" />
                  <input value={editForm.ingredients} onChange={(e) => setEditForm({...editForm,ingredients:e.target.value})} placeholder="食材" className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)]" />
                  <input value={editForm.methods} onChange={(e) => setEditForm({...editForm,methods:e.target.value})} placeholder="做法" className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)]" />
                  <input value={editForm.cuisines} onChange={(e) => setEditForm({...editForm,cuisines:e.target.value})} placeholder="菜系" className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)]" />
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <input value={editForm.satiety} onChange={(e) => setEditForm({...editForm,satiety:e.target.value})} placeholder="饱腹感" className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)]" />
                  <input value={editForm.mood} onChange={(e) => setEditForm({...editForm,mood:e.target.value})} placeholder="心情" className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)]" />
                  <input value={editForm.avoid_tags} onChange={(e) => setEditForm({...editForm,avoid_tags:e.target.value})} placeholder="忌口" className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)]" />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-3 py-1 rounded bg-[var(--accent)] text-white text-xs">保存</button>
                  <button onClick={() => setEditing(null)} className="px-3 py-1 rounded border border-[var(--border)] text-xs">取消</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text)]">{f.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 space-x-1">
                    {f.flavors?.split(",").map((t: string,i:number) => <span key={i} className="inline-block px-1 py-0.5 rounded bg-[var(--bg-secondary)]">{t}</span>)}
                    {f.ingredients?.split(",").map((t: string,i:number) => <span key={i+"i"} className="inline-block px-1 py-0.5 rounded bg-[var(--bg-secondary)]">{t}</span>)}
                    {f.methods?.split(",").map((t: string,i:number) => <span key={i+"m"} className="inline-block px-1 py-0.5 rounded bg-[var(--bg-secondary)]">{t}</span>)}
                    {f.cuisines && <span className="text-[var(--text-muted)]">· {f.cuisines}</span>}
                    {f.satiety && <span className="text-[var(--text-muted)]">· {f.satiety}</span>}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={() => startEdit(f)} className="px-2 py-1 rounded text-xs text-[var(--accent)] hover:bg-[var(--bg-secondary)]">编辑</button>
                  <button onClick={() => handleDelete(f.id)} className="px-2 py-1 rounded text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">删除</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-4">
          <button onClick={() => setPage(Math.max(0, safePage - 1))} disabled={safePage === 0}
            className="px-2 py-1 rounded text-xs border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--bg-secondary)]">
            &laquo;
          </button>
          {Array.from({ length: Math.min(totalPages, 30) }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`px-2 py-1 rounded text-xs border ${i === safePage ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] hover:bg-[var(--bg-secondary)]"}`}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))} disabled={safePage >= totalPages - 1}
            className="px-2 py-1 rounded text-xs border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--bg-secondary)]">
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
}
