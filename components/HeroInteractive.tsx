"use client";

import { useEffect, useRef } from "react";
import CircuitField from "@/components/CircuitField";

const MAGNET_R = 140; // 標題字元受游標吸引的半徑
const MAGNET_PULL = 0.3;

export default function HeroInteractive({
  name,
  title,
  skills,
  intro,
}: {
  name: string;
  title: string;
  skills: string[];
  intro: string;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let px = 0;
    let py = 0;

    const applyPointer = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      section.style.setProperty("--mx", `${px - r.left}px`);
      section.style.setProperty("--my", `${py - r.top}px`);
      // 視差:整個標題群跟著游標輕微偏移
      const nx = (px - r.left) / r.width - 0.5;
      const ny = (py - r.top) / r.height - 0.5;
      section.style.setProperty("--px", `${nx * 18}px`);
      section.style.setProperty("--py", `${ny * 12}px`);

      for (const el of charRefs.current) {
        if (!el) continue;
        const b = el.getBoundingClientRect();
        const dx = px - (b.left + b.width / 2);
        const dy = py - (b.top + b.height / 2);
        const d = Math.hypot(dx, dy);
        if (d < MAGNET_R) {
          const f = (1 - d / MAGNET_R) * MAGNET_PULL;
          el.style.transform = `translate(${dx * f}px, ${dy * f - f * 30}px) scale(${1 + f * 0.22})`;
        } else if (el.style.transform) {
          el.style.transform = "";
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(applyPointer);
    };

    // 捲動連動:往下捲時 hero 後退淡出
    let sraf = 0;
    const onScroll = () => {
      if (sraf) return;
      sraf = requestAnimationFrame(() => {
        sraf = 0;
        const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
        parallaxRef.current?.style.setProperty("--sp", String(p));
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (sraf) cancelAnimationFrame(sraf);
    };
  }, []);

  const ticker = [...skills, ...skills, ...skills, ...skills];

  return (
    <section
      ref={sectionRef}
      className="hero-spot relative left-1/2 w-screen -translate-x-1/2 -mt-16 min-h-[88vh] flex flex-col justify-center overflow-hidden"
    >
      {/* 氛圍層:極光 + 電路場 */}
      <div aria-hidden className="aurora">
        <span />
        <span />
        <span />
      </div>
      <CircuitField className="pointer-events-none absolute inset-0 h-full w-full hero-mask opacity-70" />

      <div
        ref={parallaxRef}
        className="scroll-parallax relative z-[1] px-4 sm:px-6 max-w-5xl mx-auto w-full"
        style={{ transform: "translate(var(--px, 0), var(--py, 0))" }}
      >
        {/* 編號 + 標籤 */}
        <div className="fx-rise font-mono-ui flex items-center gap-3 text-[11px] tracking-[0.35em] text-sky-400/90 uppercase">
          <span className="h-px w-10 bg-sky-400/60 line-draw" />
          01 — Portfolio
        </div>

        {/* 巨型名字:漸層填字、光掃過、游標磁吸 */}
        <h1 className="font-display mt-4 leading-[0.86] tracking-[-0.045em] font-bold">
          <span className="sr-only">{name}</span>
          <span
            aria-hidden
            className="display-fill block"
            style={{ fontSize: "clamp(3.6rem, 17vw, 13rem)" }}
          >
            {name.split("").map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                ref={(el) => {
                  charRefs.current[i] = el;
                }}
                className="fx-rise inline-block will-change-transform"
                style={{ animationDelay: `${120 + i * 60}ms` }}
              >
                {ch}
              </span>
            ))}
          </span>
        </h1>

        {/* 職稱 + 簡介:左右不對稱排版 */}
        <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-12">
          <p
            className="fx-rise font-display text-xl sm:text-2xl text-white/90 whitespace-nowrap"
            style={{ animationDelay: "520ms" }}
          >
            {title}
          </p>
          <p
            className="fx-rise text-gray-400 leading-relaxed max-w-xl sm:border-l sm:border-white/10 sm:pl-12"
            style={{ animationDelay: "640ms" }}
          >
            {intro}
          </p>
        </div>
      </div>

      {/* 技能跑馬燈:貼在 hero 底部,無限橫向流動 */}
      <div className="relative z-[1] mt-14 border-y border-white/10 bg-white/[0.02] py-3 marquee-mask">
        <div className="marquee-track font-mono-ui text-sm tracking-[0.2em] uppercase">
          {ticker.map((s, i) => (
            <span key={i} className="flex items-center">
              <span className={i % 2 ? "text-sky-300/90" : "text-white/70"}>{s}</span>
              <span className="mx-6 text-sky-500/50">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* 往下捲提示 */}
      <div className="relative z-[1] mt-10 flex justify-center">
        <span className="font-mono-ui text-[10px] tracking-[0.3em] text-white/35 uppercase animate-bounce">
          scroll ↓
        </span>
      </div>
    </section>
  );
}
