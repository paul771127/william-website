"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

type Rect = { x: number; y: number; w: number; h: number };
type Phase = "closed" | "opening" | "open" | "closing";

const OPEN_MS = 520;
const CLOSE_MS = 380;

/** 由「面板目前位置」換算出「縮回卡牌位置」所需的 transform(transform-origin 為左上角) */
function transformTo(panel: HTMLElement, target: Rect | null) {
  const p = panel.getBoundingClientRect();
  if (!target) return "scale(0.85)";
  return `translate(${target.x - p.left}px, ${target.y - p.top}px) scale(${target.w / p.width}, ${target.h / p.height})`;
}

export default function CardFan({ projects }: { projects: Project[] }) {
  const mid = (projects.length - 1) / 2;
  // 觸控裝置(無滑鼠懸停):第一下抽牌、第二下才展開
  const [canHover, setCanHover] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  // 展開面板狀態
  const [active, setActive] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("closed");
  const originRef = useRef<Rect | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pushedRef = useRef(false); // 有沒有 pushState 過(關閉時要不要 history.back)

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const measure = (i: number): Rect | null => {
    const el = cardRefs.current[i];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  };

  const openCard = useCallback(
    (i: number, pushHistory = true) => {
      originRef.current = measure(i);
      setActive(i);
      setPhase("opening");
      setSelected(null);
      if (pushHistory) {
        window.history.pushState({ card: projects[i].slug }, "", `/portfolio#${projects[i].slug}`);
        pushedRef.current = true;
      }
    },
    [projects]
  );

  /** 真正播放收回動畫(不動 history) */
  const animateClose = useCallback(() => {
    setPhase((prev) => (prev === "closed" || prev === "closing" ? prev : "closing"));
  }, []);

  /** 使用者主動關閉:有 push 過就 back(由 popstate 觸發收回),否則直接收回 */
  const requestClose = useCallback(() => {
    if (phase !== "open" && phase !== "opening") return;
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", "/portfolio");
      animateClose();
    }
  }, [phase, animateClose]);

  // 網址帶 #slug 直接開啟(分享連結用)
  useEffect(() => {
    const slug = window.location.hash.slice(1);
    if (!slug) return;
    const i = projects.findIndex((p) => p.slug === slug);
    if (i >= 0) openCard(i, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 手機返回鍵 / 瀏覽器上一頁 → 收回卡牌
  useEffect(() => {
    const onPop = () => {
      pushedRef.current = false;
      animateClose();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [animateClose]);

  // Esc 關閉、鎖住背景捲動
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, requestClose]);

  // FLIP:面板先「縮成卡牌的位置與大小」,下一幀再放大到定位
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (phase === "opening") {
      el.style.transition = "none";
      el.style.transform = transformTo(el, originRef.current);
      void el.offsetWidth; // 強制 reflow,讓起始狀態生效
      el.style.transition = "";
      const raf = requestAnimationFrame(() => {
        el.style.transform = "";
        setPhase("open");
      });
      return () => cancelAnimationFrame(raf);
    }
    if (phase === "closing") {
      el.style.transform = transformTo(el, active !== null ? measure(active) : null);
      const t = setTimeout(() => {
        setActive(null);
        setPhase("closed");
      }, CLOSE_MS);
      return () => clearTimeout(t);
    }
  }, [phase, active]);

  const project = active !== null ? projects[active] : null;
  const showing = phase === "open";

  return (
    <>
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
          const isActive = active === i;
          return (
            <button
              type="button"
              key={p.slug}
              aria-label={p.title}
              aria-expanded={isActive}
              onClick={() => {
                if (!canHover && !isSelected) {
                  setSelected(i);
                  return;
                }
                openCard(i);
              }}
              className={
                "group absolute bottom-12 sm:bottom-16 left-1/2 -ml-[4.5rem] sm:-ml-[5.5rem] hover:z-50 focus-visible:z-50 outline-none cursor-pointer" +
                (isSelected ? " z-50" : "")
              }
              style={{ transform: `rotate(${angle}deg)`, transformOrigin: "50% 210%" }}
            >
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={
                  `w-36 h-56 sm:w-44 sm:h-72 rounded-2xl border bg-gradient-to-br ${faces[i % faces.length]} ` +
                  "shadow-xl shadow-black/50 p-3 sm:p-4 flex flex-col justify-between " +
                  "transition-all duration-300 ease-out " +
                  "group-hover:-translate-y-8 sm:group-hover:-translate-y-12 " +
                  "group-hover:border-sky-400/70 group-hover:shadow-sky-500/25 " +
                  "group-focus-visible:-translate-y-8 sm:group-focus-visible:-translate-y-12 group-focus-visible:border-sky-400 " +
                  (isSelected
                    ? "-translate-y-8 sm:-translate-y-12 border-sky-400/70 shadow-sky-500/25 "
                    : "border-white/15 ") +
                  // 被展開的那張牌從手牌中「抽走」
                  (isActive && phase !== "closed" ? "opacity-0" : "opacity-100")
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

                <div className="text-left">
                  <p className="text-xs sm:text-sm font-semibold leading-snug">{p.title}</p>
                  <p
                    className={
                      "text-[10px] text-sky-300 mt-1 transition-opacity group-hover:opacity-100 " +
                      (isSelected ? "opacity-100" : "opacity-0")
                    }
                  >
                    {canHover ? "點擊展開卡牌 →" : "再點一下展開卡牌 →"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 展開的卡牌面板 */}
      {project && active !== null && (
        <div
          className={
            "fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-8 " +
            "bg-black/70 backdrop-blur-sm transition-opacity duration-300 " +
            (showing ? "opacity-100" : "opacity-0")
          }
          onClick={(e) => {
            if (e.target === e.currentTarget) requestClose();
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            style={{
              transformOrigin: "0 0",
              transitionProperty: "transform",
              transitionDuration: `${phase === "closing" ? CLOSE_MS : OPEN_MS}ms`,
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
              willChange: "transform",
            }}
            className={
              `w-full max-w-3xl h-full max-h-[88dvh] sm:max-h-[85vh] rounded-2xl border border-sky-400/60 ` +
              `bg-gradient-to-br ${faces[active % faces.length]} shadow-2xl shadow-sky-500/20 ` +
              "overflow-hidden flex flex-col"
            }
          >
            {/* 卡牌頂部 / 主視覺 */}
            <div className="relative shrink-0 h-40 sm:h-56 bg-black/30 flex items-center justify-center">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl sm:text-7xl opacity-80">
                  {icons[project.slug] ?? "📦"}
                </span>
              )}
              <button
                type="button"
                onClick={requestClose}
                aria-label="收起卡牌"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* 內文:展開到位後才淡入,避免拉伸動畫時文字變形 */}
            <div
              className={
                "flex-1 overflow-y-auto p-5 sm:p-8 space-y-5 transition-opacity duration-300 " +
                (showing ? "opacity-100 delay-150" : "opacity-0")
              }
            >
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-bold">{project.title}</h2>
                <div className="flex flex-wrap gap-2">
                  {project.tags?.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-full bg-sky-400/10 text-sky-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-base sm:text-lg text-gray-200 leading-relaxed">
                  {project.summary}
                </p>
              </div>

              {project.description ? (
                <div className="space-y-4 text-gray-300 leading-relaxed border-t border-white/10 pt-5">
                  {project.description.split(/\n{2,}/).map((para, i) => (
                    <p key={i} className="whitespace-pre-wrap">
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 border-t border-white/10 pt-5">
                  詳細介紹與圖片即將更新。
                </p>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={requestClose}
                  className="text-sm text-sky-300 hover:text-sky-200 underline underline-offset-4"
                >
                  收起卡牌
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
