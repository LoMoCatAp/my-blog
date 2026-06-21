"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Song {
  id: number;
  title: string;
  artist: string;
  filename: string;
}

export default function AdminMusicPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newArtist, setNewArtist] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) { router.replace("/admin"); return; }
    loadSongs();
  }, [router]);

  const loadSongs = async () => {
    try {
      const res = await fetch("/api/music");
      if (res.ok) setSongs(await res.json());
    } catch {}
    setLoading(false);
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setMessage("请选择文件"); return; }

    setUploading(true);
    setMessage("");
    const token = sessionStorage.getItem("admin_token");
    const form = new FormData();
    form.append("file", file);
    form.append("title", newTitle || file.name.replace(/\.[^/.]+$/, ""));
    form.append("artist", newArtist || "未知");

    try {
      const res = await fetch("/api/music", {
        method: "POST",
        headers: { "x-admin-token": token || "" },
        body: form,
      });
      if (res.ok) {
        setMessage("上传成功");
        if (fileRef.current) fileRef.current.value = "";
        setNewTitle("");
        setNewArtist("");
        loadSongs();
      } else {
        setMessage("上传失败");
      }
    } catch {
      setMessage("上传失败");
    }
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除？")) return;
    const token = sessionStorage.getItem("admin_token");
    const res = await fetch("/api/music", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-token": token || "" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setMessage("已删除");
      loadSongs();
    }
  };

  if (loading) return <div className="text-center py-20 text-[var(--text-muted)]">加载中...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">♫ 音乐管理</h1>

      {message && (
        <p className={`mb-4 p-3 rounded-lg border text-sm ${
          message.startsWith("上传") || message === "已删除"
            ? "border-green-200 text-green-600" : "border-red-200 text-red-500"
        }`}>{message}</p>
      )}

      {/* Upload form */}
      <div className="mb-8 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
        <h2 className="font-medium text-[var(--text)]">上传歌曲</h2>
        <input
          ref={fileRef}
          type="file"
          accept=".mp3,.ogg,.wav"
          className="w-full text-sm text-[var(--text-muted)] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-[var(--accent)] file:text-white file:cursor-pointer hover:file:opacity-90"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="歌曲名称"
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--accent)]"
          />
          <input
            type="text"
            value={newArtist}
            onChange={(e) => setNewArtist(e.target.value)}
            placeholder="艺术家"
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-5 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? "上传中..." : "上传"}
        </button>
      </div>

      {/* Song list */}
      <div className="space-y-2">
        {songs.map((song) => (
          <div key={song.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center gap-3">
              <span className="text-lg">♫</span>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{song.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{song.artist} · {song.filename}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(song.id)}
              className="px-3 py-1 rounded text-xs border border-red-200 text-red-500 hover:bg-red-50 transition-all"
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
