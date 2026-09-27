"use client";

import { useEffect, useRef, useState } from "react";

const NAME = "William";
const HOLD_MS = 1850; // 幕停留多久才升起
const DONE_AT = 2900; // 之後把整層從 DOM 移除

/**
 * 開場動畫(每個瀏覽階段只播一次):
 * 掃描線橫過 → 名字的字母從四散的位置飛回定位 → 幕由下往上升起露出頁面。
 *
 * 重點:幕的升起是純 CSS 動畫。就算 JS 完全沒跑,幕一樣會自己升上去,
 * 不會發生「JS 掛了整個網站是黑的」。JS 只負責跳過重播與事後清除。
 */
export default function IntroCurtain() {
  const [gone, setGone] = useState(false);
  // 字母的散落起點只在第一次渲染時決定
  const scatter = useRef(
    NAME.split("").map(() => ({
      x: (Math.random() - 0.5) * 520,
      y: (Math.random() - 0.5) * 360,
      r: (Math.random() - 0.5) * 120,
    }))
  );

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("intro-played") === "1";
    } catch {
      seen = false; // 無痕模式讀不到就當沒看過
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      setGone(true);
      return;
    }
    try {
      sessionStorage.setItem("intro-played", "1");
    } catch {
      /* 存不進去就下次再播一次,無妨 */
    }
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      setGone(true);
      document.body.style.overflow = "";
    }, DONE_AT);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className="intro-curtain fixed inset-0 z-[300] bg-[#0a0e14] flex items-center justify-center overflow-hidden pointer-events-none"
    >
      {/* 掃描線 */}
      <div
        className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-sky-400 to-transparent"
        style={{
          animation: "introSweep 1.5s var(--ease-in-out) both",
          boxShadow: "0 0 24px rgba(56,189,248,0.9)",
        }}
      />

      {/* 名字:字母從散落位置飛回定位 */}
      <div className="relative flex text-5xl sm:text-7xl font-bold tracking-tight">
        {NAME.split("").map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            className="inline-block"
            style={
              {
                "--ix": `${scatter.current[i].x}px`,
                "--iy": `${scatter.current[i].y}px`,
                "--ir": `${scatter.current[i].r}deg`,
                animation: `introLetter 1s var(--ease-spring) ${300 + i * 70}ms both`,
              } as React.CSSProperties
            }
          >
            {ch}
          </span>
        ))}
        <span
          className="text-sky-400"
          style={{ animation: "introLetter 0.7s var(--ease-spring) 900ms both" }}
        >
          .
        </span>
      </div>
    </div>
  );
}
