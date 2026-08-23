"use client";

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

  return (
    <div className="relative h-[24rem] sm:h-[30rem] select-none">
      {projects.map((p, i) => {
        const angle = (i - mid) * 8;
        const icon = icons[p.slug] ?? "📦";
        return (
          <Link
            key={p.slug}
            href={`/portfolio/${p.slug}`}
            aria-label={p.title}
            className="group absolute bottom-0 left-1/2 -ml-[4.5rem] sm:-ml-[5.5rem] hover:z-50 focus-visible:z-50 outline-none"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: "50% 150%" }}
          >
            <div
              className={
                `w-36 h-56 sm:w-44 sm:h-72 rounded-2xl border border-white/15 bg-gradient-to-br ${faces[i % faces.length]} ` +
                "shadow-xl shadow-black/50 p-3 sm:p-4 flex flex-col justify-between " +
                "transition-all duration-300 ease-out " +
                "group-hover:-translate-y-16 sm:group-hover:-translate-y-24 " +
                "group-hover:border-sky-400/70 group-hover:shadow-sky-500/25 " +
                "group-focus-visible:-translate-y-16 sm:group-focus-visible:-translate-y-24 group-focus-visible:border-sky-400"
              }
            >
              {/* 左上角小圖示:牌疊起來時仍露出的牌角 */}
              <div className="text-lg sm:text-xl">{icon}</div>

              <div className="text-center text-4xl sm:text-5xl opacity-50 group-hover:opacity-90 transition-opacity">
                {icon}
              </div>

              <div>
                <p className="text-xs sm:text-sm font-semibold leading-snug">
                  {p.title}
                </p>
                <p className="text-[10px] text-sky-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  點擊查看詳細介紹 →
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
