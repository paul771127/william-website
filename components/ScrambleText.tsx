"use client";

import { useEffect, useRef, useState } from "react";

// 亂碼字元池:分中英兩套,換上去時字寬才不會跳動
const POOL_CJK = "電機構整合資料模組系統控制訊號運算迴路介面驅動感測";
const POOL_ASCII = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$@";

const CHAR_MS = 42; // 每個字元解碼的間隔
const SETTLE = 3; // 每個字元定下來之前先亂跳幾次

function isCjk(ch: string) {
  return /[　-鿿豈-﫿]/.test(ch);
}
function randGlyph(ch: string) {
  const pool = isCjk(ch) ? POOL_CJK : POOL_ASCII;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** 捲進畫面時,標題像訊號被解碼一樣從亂碼逐字還原 */
export default function ScrambleText({
  text,
  className = "",
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span";
}) {
  // SSR 直接輸出正確文字,爬蟲與無 JS 都讀得到
  const [display, setDisplay] = useState(text);
  const [running, setRunning] = useState(false);
  const hostRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        const chars = Array.from(text);
        let resolved = 0;
        let tick = 0;
        setRunning(true);

        timer = window.setInterval(() => {
          tick++;
          if (tick % SETTLE === 0) resolved++;
          if (resolved > chars.length) {
            window.clearInterval(timer);
            setDisplay(text);
            setRunning(false);
            return;
          }
          setDisplay(
            chars
              .map((c, i) => {
                if (i < resolved) return c;
                if (c === " ") return c;
                return randGlyph(c);
              })
              .join("")
          );
        }, CHAR_MS);
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) window.clearInterval(timer);
    };
  }, [text]);

  return (
    <Tag
      ref={hostRef as React.Ref<never>}
      className={className}
      aria-label={text}
      title={undefined}
    >
      <span aria-hidden className={running ? "scramble-on" : undefined}>
        {display}
      </span>
    </Tag>
  );
}
