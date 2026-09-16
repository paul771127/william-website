"use client";

import { useEffect, useRef } from "react";
import CircuitField from "@/components/CircuitField";

const MAGNET_R = 120; // 標題字元受游標吸引的半徑
const MAGNET_PULL = 0.34; // 吸引強度

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
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      // 聚光燈:游標在區塊內的相對位置
      section.style.setProperty("--mx", `${px - r.left}px`);
      section.style.setProperty("--my", `${py - r.top}px`);

      // 磁吸標題:每個字元往游標靠過去,越近拉得越多、也越亮
      for (const el of charRefs.current) {
        if (!el) continue;
        const b = el.getBoundingClientRect();
        const cx = b.left + b.width / 2;
        const cy = b.top + b.height / 2;
        const dx = px - cx;
        const dy = py - cy;
        const d = Math.hypot(dx, dy);
        if (d < MAGNET_R) {
          const f = (1 - d / MAGNET_R) * MAGNET_PULL;
          el.style.transform = `translate(${dx * f}px, ${dy * f - f * 26}px) scale(${1 + f * 0.5})`;
          el.style.color = `rgb(${125 + f * 260}, ${211 + f * 90}, 252)`;
          el.style.textShadow = `0 0 ${10 + f * 46}px rgba(56,189,248,${f * 1.5})`;
        } else if (el.style.transform) {
          el.style.transform = "";
          el.style.color = "";
          el.style.textShadow = "";
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-spot relative -mt-8 pt-16 pb-12 text-center space-y-6 overflow-hidden rounded-3xl"
    >
      {/* 電路粒子場 */}
      <CircuitField className="pointer-events-none absolute inset-0 h-full w-full hero-mask opacity-80" />

      <div className="relative z-[1] space-y-6">
        <p className="fx-rise text-sky-400 tracking-widest text-sm">
          PORTFOLIO
        </p>

        {/* 名字:逐字浮現,游標靠近會被吸起來 */}
        <h1 className="text-4xl sm:text-6xl font-bold">
          <span className="sr-only">{name}</span>
          <span aria-hidden className="inline-flex justify-center">
            {name.split("").map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                ref={(el) => {
                  charRefs.current[i] = el;
                }}
                className={
                  "fx-rise inline-block will-change-transform transition-[color,text-shadow] duration-200"
                }
                style={{ animationDelay: `${90 + i * 55}ms` }}
              >
                {ch === " " ? " " : ch}
              </span>
            ))}
          </span>
        </h1>

        <p
          className="fx-rise text-xl text-gray-300"
          style={{ animationDelay: "420ms" }}
        >
          {title}
        </p>

        {/* 技能標籤:滑過會浮起發光 */}
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((s, i) => (
            <span
              key={s}
              className={
                "fx-rise skill-pill px-4 py-1.5 rounded-full border border-sky-400/40 text-sky-300 text-sm"
              }
              style={{ animationDelay: `${500 + i * 90}ms` }}
            >
              {s}
            </span>
          ))}
        </div>

        <p
          className={
            "fx-rise max-w-2xl mx-auto text-gray-400 leading-relaxed"
          }
          style={{ animationDelay: "760ms" }}
        >
          {intro}
        </p>
      </div>
    </section>
  );
}
