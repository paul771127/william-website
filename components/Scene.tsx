"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 動畫場景的外殼:統一處理「預設畫好 → JS 掛載後收起 → 捲進畫面才播放」。
 * 這樣每個面板都不必各寫一次 IntersectionObserver,沒有 JS 時也都看得到完整畫面。
 */
export default function Scene({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setArmed(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-label={label}
      className={
        "relative rounded-2xl border border-white/10 bg-[#070b11]/60 overflow-hidden " +
        (armed ? "sc-armed " : "") +
        (run ? "sc-run " : "") +
        className
      }
    >
      {children}

      {/* 四角定位記號 + 內緣暗角,讓每個面板看起來像同一套儀器 */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 100 100"
        preserveAspectRatio="none">
        <defs>
          <radialGradient id="scVig" cx="50%" cy="50%" r="72%">
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#scVig)" />
      </svg>
      <span aria-hidden className="sc-corner sc-corner-tl" />
      <span aria-hidden className="sc-corner sc-corner-tr" />
      <span aria-hidden className="sc-corner sc-corner-bl" />
      <span aria-hidden className="sc-corner sc-corner-br" />
    </div>
  );
}
