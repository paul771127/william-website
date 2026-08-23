"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Project } from "@/lib/data";

const icons: Record<string, string> = {
  "usv-navigation": "🚤",
  "robot-arm-android": "🦾",
  "multi-tube-injector": "💉",
  "hydraulic-press": "🏭",
  "ai-smart-box": "🤖",
  "local-movie-gen": "🎬",
  "local-mv-gen": "🎵",
};

const faces = [
  "from-sky-800/80 to-slate-950",
  "from-indigo-800/80 to-slate-950",
  "from-cyan-800/80 to-slate-950",
  "from-blue-800/80 to-slate-950",
  "from-violet-800/80 to-slate-950",
  "from-teal-800/80 to-slate-950",
  "from-slate-700/80 to-slate-950",
];

export default function CardFan({ projects }: { projects: Project[] }) {
  const mid = (projects.length - 1) / 2;
  // 觸控裝置(無滑鼠懸停):第一下抽牌、第二下才進介紹頁
  const [canHover, setCanHover] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  return (
    <div
      className="relative h-[26rem] sm:h-[32rem] select-none"
      onClick={(e) => {
        // 點到背景空白處收回抽出的牌
        if (e.target === e.currentTarget) setSelected(null);
      }}
    >
      {projects.map((p, i) => {
        const angle = (i - mid) * 6;
        const icon = icons[p.slug] ?? "📦";
        const isSelected = selected === i;
        return (
          <Link
            key={p.slug}
            href={`/portfolio/${p.slug}`}
            aria-label={p.title}
            onClick={(e) => {
              if (!canHover && !isSelected) {
                e.preventDefault();
                setSelected(i);
              }
            }}
            className={
              "group absolute bottom-12 sm:bottom-16 left-1/2 -ml-[4.5rem] sm:-ml-[5.5rem] hover:z-50 focus-visible:z-50 outline-none" +
              (isSelected ? " z-50" : "")
            }
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: "50% 210%" }}
          >
            <div
              className={
                `w-36 h-56 sm:w-44 sm:h-72 rounded-2xl border bg-gradient-to-br ${faces[i % faces.length]} ` +
                "shadow-xl shadow-black/50 p-3 sm:p-4 flex flex-col justify-between " +
                "transition-all duration-300 ease-out " +
                "group-hover:-translate-y-8 sm:group-hover:-translate-y-12 " +
                "group-hover:border-sky-400/70 group-hover:shadow-sky-500/25 " +
                "group-focus-visible:-translate-y-8 sm:group-focus-visible:-translate-y-12 group-focus-visible:border-sky-400 " +
                (isSelected
                  ? "-translate-y-8 sm:-translate-y-12 border-sky-400/70 shadow-sky-500/25"
                  : "border-white/15")
              }
            >
              {/* 左上角小圖示:牌疊起來時仍露出的牌角 */}
              <div className="text-lg sm:text-xl">{icon}</div>

              <div
                className={
                  "text-center text-4xl sm:text-5xl transition-opacity group-hover:opacity-90 " +
                  (isSelected ? "opacity-90" : "opacity-50")
                }
              >
                {icon}
              </div>

              <div>
                <p className="text-xs sm:text-sm font-semibold leading-snug">
                  {p.title}
                </p>
                <p
                  className={
                    "text-[10px] text-sky-300 mt-1 transition-opacity group-hover:opacity-100 " +
                    (isSelected ? "opacity-100" : "opacity-0")
                  }
                >
                  {canHover ? "點擊查看詳細介紹 →" : "再點一下看詳細介紹 →"}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
