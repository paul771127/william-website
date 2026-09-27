"use client";

import { useEffect, useRef, useState } from "react";

const NAME = "William";
const DONE_AT = 3000; // 之後把整層從 DOM 移除

/**
 * 開場序列(每個瀏覽階段只播一次):
 * 掃描線橫過 + 載入計數 0→100 → 名字的字母從四散處飛回定位
 * → 上下兩片幕往外分開,像簾幕拉開一樣露出頁面。
 *
 * 幕的分開是純 CSS 動畫:就算 JS 完全沒跑,頁面一樣會露出來。
 */
export default function IntroCurtain() {
  const [gone, setGone] = useState(false);
  // 計數用 JS 跑;沒有 JS 時整個不顯示,不會卡在 0 看起來像壞掉
  const [count, setCount] = useState<number | null>(null);
  const scatter = useRef(
    NAME.split("").map(() => ({
      x: (Math.random() - 0.5) * 560,
      y: (Math.random() - 0.5) * 380,
      r: (Math.random() - 0.5) * 140,
    }))
  );

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("intro-played") === "1";
    } catch {
      seen = false;
    }
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    try {
      sessionStorage.setItem("intro-played", "1");
    } catch {
      /* 存不進去就下次再播一次 */
    }
    document.body.style.overflow = "hidden";

    // 載入計數 0 → 100
    const startedAt = performance.now();
    let craf = requestAnimationFrame(function step(now) {
      const p = Math.min(1, (now - startedAt) / 1700);
      // 先快後慢,像真的在載入
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) craf = requestAnimationFrame(step);
    });

    const t = setTimeout(() => {
      setGone(true);
      document.body.style.overflow = "";
    }, DONE_AT);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(craf);
      document.body.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div aria-hidden className="intro-curtain fixed inset-0 z-[300] pointer-events-none">
      {/* 上下兩片幕 */}
      <div className="intro-panel-top absolute inset-x-0 top-0 h-1/2 bg-[#0a0e14]" />
      <div className="intro-panel-bottom absolute inset-x-0 bottom-0 h-1/2 bg-[#0a0e14]" />

      {/* 中央內容:幕分開前先淡出 */}
      <div className="intro-center absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-sky-400 to-transparent"
          style={{ animation: "introSweep 1.5s var(--ease-in-out) both", boxShadow: "0 0 24px rgba(56,189,248,0.9)" }}
        />

        <div className="font-display relative flex text-5xl sm:text-8xl font-bold tracking-tight">
          {NAME.split("").map((ch, i) => (
            <span
              key={`${ch}-${i}`}
              className="inline-block"
              style={
                {
                  "--ix": `${scatter.current[i].x}px`,
                  "--iy": `${scatter.current[i].y}px`,
                  "--ir": `${scatter.current[i].r}deg`,
                  animation: `introLetter 1s var(--ease-spring) ${260 + i * 65}ms both`,
                } as React.CSSProperties
              }
            >
              {ch}
            </span>
          ))}
          <span
            className="text-sky-400"
            style={{ animation: "introLetter 0.7s var(--ease-spring) 880ms both" }}
          >
            .
          </span>
        </div>

        {/* 載入計數 0 → 100 */}
        <div className="font-mono-ui mt-8 flex items-baseline gap-1 text-sky-300/70 text-sm tracking-[0.3em]">
          <span className="tabular-nums">{count ?? ""}</span>
          {count !== null && <span>%</span>}
        </div>
      </div>
    </div>
  );
}
