"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { CommentIcon, CheckIcon, RefreshIcon, PawIcon, CatFaceIcon } from "./icons/Icons";
import { friendlyTime } from "@/lib/time";

interface CommentNode {
  id: number;
  name: string;
  content: string;
  created_at: string;
  parent_id: number | null;
  replies: CommentNode[];
}

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);

  const [captchaProblem, setCaptchaProblem] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const formRef = useRef<HTMLDivElement>(null);

  const captchaLoading = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const fetchCaptcha = useCallback(async () => {
    if (captchaLoading.current) return;
    captchaLoading.current = true;
    try {
      const res = await fetch("/api/captcha");
      if (res.ok && mountedRef.current) {
        const data = await res.json();
        setCaptchaProblem(data.problem);
        setCaptchaToken(data.token);
        setCaptchaAnswer("");
      }
    } catch {
      // captcha unavailable
    } finally {
      captchaLoading.current = false;
    }
  }, []);

  const loadComments = useCallback(() => {
    fetch(`/api/comments?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => { if (mountedRef.current) setComments(data); })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    loadComments();
    fetchCaptcha();
  }, [loadComments, fetchCaptcha]);

  const startReply = (id: number, name: string) => {
    setReplyTo({ id, name });
    setMessage("");
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || posting) return;

    setPosting(true);
    setMessage("");

    // Fetch with 30-second timeout (mobile needs more time)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    try {
      const res = await fetch("/api/comments", {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: name.trim() || "匿名",
          content: content.trim(),
          captchaAnswer: captchaAnswer.trim(),
          captchaToken,
          honeypot: "",
          parentId: replyTo?.id || null,
        }),
      });

      clearTimeout(timeoutId);
      if (!mountedRef.current) return;

      if (res.ok) {
        setContent("");
        setName("");
        setCaptchaAnswer("");
        setReplyTo(null);
        setMessage("评论发表成功");
        setMessageType("success");
        loadComments();
        fetchCaptcha();
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(err.error || "发表失败，请重试");
        setMessageType("error");
        fetchCaptcha();
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (!mountedRef.current) return;
      if (err instanceof Error && err.name === "AbortError") {
        setMessage("请求超时，请检查网络后重试");
      } else {
        setMessage("发表失败，请检查网络");
      }
      setMessageType("error");
      fetchCaptcha();
    } finally {
      if (mountedRef.current) setPosting(false);
    }
  };

  function renderComment(comment: CommentNode, depth: number = 0) {
    const isReply = depth > 0;
    return (
      <div key={comment.id}>
        <div
          className={`p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] ${
            isReply ? "mt-3" : ""
          }`}
        >
          <div className="flex items-center gap-2 text-sm mb-2">
            <span className="font-medium text-[var(--accent-dark)]">
              {comment.name}
            </span>
            {comment.parent_id && (
              <span className="text-xs text-[var(--text-muted)]">回复</span>
            )}
            <span className="text-xs text-[var(--text-muted)]">
              {friendlyTime(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
          <button
            onClick={() => startReply(comment.id, comment.name)}
            className="mt-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            回复
          </button>
        </div>
        {comment.replies.length > 0 && (
          <div
            className={`ml-4 ${depth < 4 ? "border-l-2 border-[var(--border)] pl-4" : ""}`}
          >
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-[var(--border)]">
      <h3 className="text-xl font-semibold text-[var(--text)] mb-6 flex items-center gap-2">
        <CommentIcon size={22} className="text-[var(--accent)]" />
        评论{" "}
        <span className="text-sm font-normal text-[var(--text-muted)]">
          ({comments.length})
        </span>
      </h3>

      {/* Comment list */}
      <div className="space-y-4 mb-8">
        {comments.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] text-center py-8 flex items-center justify-center gap-1.5">
            <CatFaceIcon size={18} className="opacity-50" />
            还没有评论，来做第一个吧
            <CatFaceIcon size={18} className="opacity-50 scale-x-[-1]" />
          </p>
        )}
        {comments.map((c) => renderComment(c))}
      </div>

      {/* Comment form */}
      <div
        ref={formRef}
        className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <h4 className="text-sm font-medium text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
          <CommentIcon size={16} />
          发表评论
          {replyTo && (
            <span className="ml-2 text-xs text-[var(--accent)]">
              回复 @{replyTo.name}
              <button
                onClick={cancelReply}
                className="ml-1.5 text-[var(--text-muted)] hover:text-red-500"
              >
                ✕
              </button>
            </span>
          )}
        </h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Honeypot */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" readOnly />
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="你的名字（留空为匿名）"
            maxLength={50}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm outline-none focus:border-[var(--accent)] transition-colors"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyTo ? `回复 @${replyTo.name}...` : "写下你的想法..."}
            rows={3}
            required
            maxLength={2000}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm outline-none focus:border-[var(--accent)] transition-colors resize-none"
          />

          {/* Captcha */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-[var(--accent-dark)] bg-[var(--bg-secondary)] px-3 py-2 rounded-lg select-none">
              {captchaProblem}
            </span>
            <input
              type="text"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              placeholder="答案"
              maxLength={3}
              required
              className="w-20 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm outline-none focus:border-[var(--accent)] transition-colors text-center"
            />
            <button
              type="button"
              onClick={fetchCaptcha}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-secondary)] transition-colors"
              title="换一题"
            >
              <RefreshIcon size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">
              {content.length}/2000
            </span>
            <button
              type="submit"
              disabled={posting || !content.trim() || !captchaAnswer.trim()}
              className="px-5 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {posting ? (
                "发表中..."
              ) : (
                <>
                  <PawIcon size={16} />
                  {replyTo ? "回复" : "发表"}
                </>
              )}
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`mt-3 text-sm flex items-center gap-1.5 ${
              messageType === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {messageType === "success" && <CheckIcon size={16} />}
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
