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

// 扇形參數:每張牌相隔的角度、旋轉中心距離(卡牌高度的倍數)
const STEP_DEG = { mobile: 13, desktop: 11 };
const RADIUS_RATIO = 2.1; // transform-origin: 50% 210%
const DRAG_THRESHOLD = 8; // px,超過才算拖曳(否則視為點擊)

/** 由「面板目前位置」換算出「縮回卡牌位置」所需的 transform(transform-origin 為左上角) */
function transformTo(panel: HTMLElement, target: Rect | null) {
  const p = panel.getBoundingClientRect();
  if (!target) return "scale(0.85)";
  return `translate(${target.x - p.left}px, ${target.y - p.top}px) scale(${target.w / p.width}, ${target.h / p.height})`;
}

/** 把「第 i 張牌 + 轉動偏移」換算成環狀的槽位(-N/2 ~ N/2),超出邊緣就從另一邊回來 */
function toSlot(i: number, offset: number, n: number) {
  const s = i + offset;
  return ((((s + n / 2) % n) + n) % n) - n / 2;
}

export default function CardFan({ projects }: { projects: Project[] }) {
  const n = projects.length;
  const mid = (n - 1) / 2;
  // 觸控裝置(無滑鼠懸停):第一下抽牌、第二下才展開
  const [canHover, setCanHover] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  // 手牌轉動(以「槽位」為單位,1 = 一張牌的間距)
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; startOffset: number; pxPerSlot: number } | null>(null);
  const movedRef = useRef(false); // 這次 pointer 有沒有拖曳過(用來吃掉隨後的 click)
  const prevSlotRef = useRef<number[]>([]);

  // 展開面板狀態
  const [active, setActive] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("closed");
  const originRef = useRef<Rect | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pushedRef = useRef(false); // 有沒有 pushState 過(關閉時要不要 history.back)

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
    const mq = window.matchMedia("(min-width: 640px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const step = isDesktop ? STEP_DEG.desktop : STEP_DEG.mobile;

  const measure = (i: number): Rect | null => {
    const el = cardRefs.current[i];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  };

  /** 把第 i 張牌轉到正中央(走最短方向) */
  const centerCard = useCallback(
    (i: number) => {
      setOffset((o) => o - toSlot(i, o, n));
    },
    [n]
  );

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
    if (i >= 0) {
      centerCard(i);
      openCard(i, false);
    }
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

  // ---- 左右拖曳轉動手牌 ----
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (n < 2 || active !== null) return;
    const h = cardRefs.current[0]?.offsetHeight ?? 224;
    // 每個槽位在螢幕上大約的水平距離 = 半徑 × 角度(弧度)
    const pxPerSlot = h * RADIUS_RATIO * ((step * Math.PI) / 180);
    dragRef.current = { x: e.clientX, startOffset: offset, pxPerSlot };
    movedRef.current = false;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!movedRef.current && Math.abs(dx) < DRAG_THRESHOLD) return;
    if (!movedRef.current) {
      movedRef.current = true;
      setDragging(true);
      setSelected(null);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setOffset(d.startOffset + dx / d.pxPerSlot);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d || !movedRef.current) return;
    const dx = e.clientX - d.x;
    let target = d.startOffset + dx / d.pxPerSlot;
    // 輕滑(不到半格)也至少換一張,手感比較像翻牌
    if (Math.abs(target - d.startOffset) < 0.5 && Math.abs(dx) > 24) {
      target = d.startOffset + Math.sign(dx);
    }
    setOffset(Math.round(target));
    setDragging(false);
  };

  const project = active !== null ? projects[active] : null;
  const showing = phase === "open";

  return (
    <>
      <div
        className="relative h-[27rem] sm:h-[33rem] select-none"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={(e) => {
          // 點到背景空白處收回抽出的牌
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        {projects.map((p, i) => {
          const slot = toSlot(i, offset, n);
          const angle = slot * step;
          // 超過最外側槽位(正在繞到另一邊)的牌淡出,避免看到跳接
          const beyond = Math.abs(slot) - mid;
          const opacity = beyond <= 0 ? 1 : Math.max(0, 1 - beyond / (n / 2 - mid));
          // 剛從另一邊繞回來的牌不要做位移動畫,否則會橫掃整個扇形
          const jumped = Math.abs(slot - (prevSlotRef.current[i] ?? slot)) > 1;
          prevSlotRef.current[i] = slot;
          const transition =
            dragging || jumped
              ? "none"
              : "transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 380ms";

          const icon = icons[p.slug] ?? "📦";
          const isSelected = selected === i;
          const isActive = active === i;
          return (
            <button
              type="button"
              key={p.slug}
              aria-label={p.title}
              aria-expanded={isActive}
              onClick={(e) => {
                if (movedRef.current) {
                  // 拖曳結束後的 click 不算點牌
                  e.preventDefault();
                  movedRef.current = false;
                  return;
                }
                if (!canHover && !isSelected) {
                  setSelected(i);
                  centerCard(i);
                  return;
                }
                openCard(i);
              }}
              className={
                "group absolute bottom-12 sm:bottom-16 left-1/2 -ml-[4.5rem] sm:-ml-[5rem] outline-none cursor-pointer " +
                "z-(--z) hover:z-50 focus-visible:z-50" +
                (isSelected ? " z-50" : "")
              }
              style={
                {
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: `50% ${RADIUS_RATIO * 100}%`,
                  opacity,
                  transition,
                  // 疊放順序跟著環狀位置走(右邊的牌壓在左邊的牌上)
                  "--z": Math.round(slot + mid),
                } as React.CSSProperties
              }
            >
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={
                  `w-36 h-56 sm:w-40 sm:h-72 rounded-2xl border bg-gradient-to-br ${faces[i % faces.length]} ` +
                  "shadow-xl shadow-black/50 p-3 sm:p-4 flex flex-col justify-between " +
                  "transition-all duration-300 ease-out " +
                  "group-hover:-translate-y-8 sm:group-hover:-translate-y-12 " +
                  "group-hover:border-sky-400/70 group-hover:shadow-sky-500/25 " +
                  "group-focus-visible:-translate-y-8 sm:group-focus-visible:-translate-y-12 group-focus-visible:border-sky-400 " +
                  (isSelected
                    ? "-translate-y-10 scale-105 border-sky-400 shadow-sky-500/40 "
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

                {/* 文字集中在牌的左側:那是被下一張牌疊住後仍露出的區域 */}
                <div className="text-left w-[5.5rem] sm:w-[6.5rem]">
                  <p className="text-xs sm:text-sm font-semibold leading-snug">{p.title}</p>
                  <p
                    className={
                      "text-[11px] text-sky-300 mt-1 transition-opacity group-hover:opacity-100 " +
                      (isSelected ? "opacity-100" : "opacity-0")
                    }
                  >
                    {canHover ? "點擊展開 →" : "再點一下展開 →"}
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
