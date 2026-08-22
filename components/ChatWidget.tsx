"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "您好!我是 William 的 AI 助理,想了解他的專長或作品都可以問我。",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID();
    }
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 送出時去掉開場白,只傳真實對話
          messages: next.slice(1),
          sessionId: sessionIdRef.current,
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? "客服暫時無法回應,請稍後再試。",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "連線失敗,請檢查網路後再試一次。" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* 浮動按鈕 */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="AI 客服"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-2xl shadow-lg shadow-sky-500/30 transition-colors"
      >
        {open ? "×" : "💬"}
      </button>

      {/* 聊天視窗 */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[28rem] rounded-2xl border border-white/15 bg-[#0d1420] shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 bg-white/5">
            <p className="font-semibold text-sm">AI 客服</p>
            <p className="text-xs text-gray-400">由 Claude 驅動,回覆僅供參考</p>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap " +
                    (m.role === "user"
                      ? "bg-sky-500 text-white rounded-br-sm"
                      : "bg-white/10 text-gray-200 rounded-bl-sm")
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm text-gray-400">
                  輸入中…
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) send();
              }}
              placeholder="輸入問題…"
              className="flex-1 bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-400"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-4 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white text-sm transition-colors"
            >
              送出
            </button>
          </div>
        </div>
      )}
    </>
  );
}
