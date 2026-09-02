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

// 牌面一律不透明(疊在一起時不能透出底下那張)
const faces = [
  "from-sky-800 to-slate-950",
  "from-indigo-800 to-slate-950",
  "from-cyan-800 to-slate-950",
  "from-blue-800 to-slate-950",
  "from-violet-800 to-slate-950",
  "from-teal-800 to-slate-950",
  "from-slate-700 to-slate-950",
];

/**
 * 淡出拆成兩層:
 * - veil:背景色遮罩蓋在牌上,越靠邊越暗、融進背景(牌本身仍不透明,不會透出底下的牌)
 * - alpha:只有快到可視範圍邊緣(fade < 0.25)才真的變透明,讓循環接回時看不到跳接
 */
function fadeLayers(fade: number) {
  return { veil: 1 - fade, alpha: Math.min(1, fade / 0.25) };
}

type Rect = { x: number; y: number; w: number; h: number };
type Phase = "closed" | "opening" | "open" | "closing";

const OPEN_MS = 520;
const CLOSE_MS = 380;

// 扇形參數:每張牌相隔的角度、旋轉中心距離(卡牌高度的倍數)
const STEP_DEG = { mobile: 13, desktop: 11 };
const RADIUS_RATIO = 2.1; // transform-origin: 50% 210%
const DRAG_THRESHOLD = 8; // px,超過才算拖曳(否則視為點擊)
const MOBILE_VISIBLE = 5; // 手機同時看得到的牌數(其餘在環上但透明)
// 慣性(整個輪盤):放手後速度以 exp(-t/τ) 衰減,τ 越大轉越久;慢到 V_STOP 以下就滑進最近的一張
const FRICTION_TAU_MS = 550;
const V_STOP = 0.0012; // 槽位/ms
const SETTLE_TAU_MS = 140; // 最後吸附到整張牌的時間常數
const V_MAX = 0.03; // 速度上限(槽位/ms),避免一撥飛太快

/** 由「面板目前位置」換算出「縮回卡牌位置」所需的 transform(transform-origin 為左上角) */
function transformTo(panel: HTMLElement, target: Rect | null) {
  const p = panel.getBoundingClientRect();
  if (!target) return "scale(0.85)";
  return `translate(${target.x - p.left}px, ${target.y - p.top}px) scale(${target.w / p.width}, ${target.h / p.height})`;
}

/** 把「第 i 張牌 + 轉動偏移」換算成環狀的槽位(-N/2 ~ N/2),超出邊緣就從另一邊回來 */
function toSlot(i: number, offset: number, n: number) {
  const s = i - (n - 1) / 2 + offset;
  return ((((s + n / 2) % n) + n) % n) - n / 2;
}

/** 離中心越遠越淡:中間 1,到可視範圍邊緣(half 個槽位)降到 0;範圍外的牌完全透明 */
function fadeOf(slot: number, half: number) {
  const t = Math.abs(slot) / half;
  return Math.max(0, 1 - t * t);
}

export default function CardFan({ projects }: { projects: Project[] }) {
  const n = projects.length;
  const mid = (n - 1) / 2;
  const [isDesktop, setIsDesktop] = useState(true);
  // 輪盤是否在動(拖曳或慣性滑行中):動的時候中央牌不抽高、上方簡介卡先淡出
  const [wheelBusy, setWheelBusy] = useState(false);

  // 手牌轉動(以「槽位」為單位,1 = 一張牌的間距)
  const [offset, setOffset] = useState(0);
  const dragRef = useRef<{
    x: number;
    startOffset: number;
    pxPerSlot: number;
    lastX: number;
    lastT: number;
    v: number; // 槽位/ms
    raf: number;
    live: number; // 拖曳中的即時 offset
  } | null>(null);
  const movedRef = useRef(false); // 這次 pointer 有沒有拖曳過(用來吃掉隨後的 click)
  const prevSlotRef = useRef<number[]>([]);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const liveOffsetRef = useRef(0); // DOM 上目前的 offset(拖曳/慣性中會跟 state 不同步)
  const spinRef = useRef<number>(0); // 慣性迴圈的 rAF id(0 = 沒在轉)

  // 展開面板狀態
  const [active, setActive] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("closed");
  const originRef = useRef<Rect | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pushedRef = useRef(false); // 有沒有 pushState 過(關閉時要不要 history.back)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // React state 改變(例如點牌置中)時同步 DOM 端的 offset;卸載時停掉慣性迴圈
  useEffect(() => {
    liveOffsetRef.current = offset;
  }, [offset]);
  useEffect(() => () => cancelAnimationFrame(spinRef.current), []);

  const step = isDesktop ? STEP_DEG.desktop : STEP_DEG.mobile;
  // 可視範圍的半寬(槽位數):桌機整副都看得到,手機只露出中間 MOBILE_VISIBLE 張
  const visibleHalf = isDesktop ? n / 2 : Math.min(n / 2, MOBILE_VISIBLE / 2);

  const measure = (i: number): Rect | null => {
    const el = cardRefs.current[i];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  };

  /** 直接把某個 offset 的排版寫進 DOM(拖曳時用,不經過 React 重繪,才會順) */
  const applyLayout = useCallback(
    (o: number) => {
      liveOffsetRef.current = o;
      for (let i = 0; i < n; i++) {
        const el = btnRefs.current[i];
        if (!el) continue;
        const slot = toSlot(i, o, n);
        const fade = fadeOf(slot, visibleHalf);
        const { veil, alpha } = fadeLayers(fade);
        el.style.transform = `rotate(${slot * step}deg)`;
        el.style.setProperty("--fade", String(alpha));
        el.style.setProperty("--veil", String(veil));
        el.style.setProperty("--z", String(Math.round(slot + mid)));
        el.style.pointerEvents = fade > 0 ? "" : "none";
        prevSlotRef.current[i] = slot;
      }
    },
    [n, step, mid, visibleHalf]
  );

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
    // 輪盤還在轉 → 這一碰是「抓停」,不算點牌
    const grabbing = spinRef.current !== 0;
    if (grabbing) {
      cancelAnimationFrame(spinRef.current);
      spinRef.current = 0;
      btnRefs.current.forEach((el) => el && (el.style.transition = "none"));
      setWheelBusy(true);
    }
    const start = liveOffsetRef.current;
    dragRef.current = {
      x: e.clientX,
      startOffset: start,
      pxPerSlot,
      lastX: e.clientX,
      lastT: e.timeStamp,
      v: 0,
      raf: 0,
      live: start,
    };
    movedRef.current = grabbing;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!movedRef.current && Math.abs(dx) < DRAG_THRESHOLD) return;
    if (!movedRef.current) {
      movedRef.current = true;
      setWheelBusy(true);
      e.currentTarget.setPointerCapture(e.pointerId);
      // 拖曳期間關掉位移動畫,手指到哪牌就到哪
      btnRefs.current.forEach((el) => el && (el.style.transition = "none"));
    }
    // 速度估計(給放手後的慣性用)
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) {
      const inst = (e.clientX - d.lastX) / d.pxPerSlot / dt;
      d.v = d.v * 0.6 + inst * 0.4;
      d.lastX = e.clientX;
      d.lastT = e.timeStamp;
    }
    d.live = d.startOffset + dx / d.pxPerSlot;
    if (!d.raf) {
      d.raf = requestAnimationFrame(() => {
        d.raf = 0;
        applyLayout(d.live);
      });
    }
  };
  const endDrag = () => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d || !movedRef.current) return;
    if (d.raf) cancelAnimationFrame(d.raf);
    applyLayout(d.live);

    // ---- 整個輪盤的慣性:每幀 offset += v·dt,v 依摩擦衰減;牌繞過循環點也照樣連續 ----
    let o = d.live;
    let v = Math.max(-V_MAX, Math.min(V_MAX, d.v));
    // 輕撥(速度很小、不到半格)也至少換一張,手感比較像翻牌
    const moved = d.live - d.startOffset;
    if (Math.abs(v) < V_STOP && Math.abs(moved) > 0.15 && Math.abs(moved) < 0.5) {
      v = Math.sign(moved) * V_STOP * 1.5;
    }
    let target: number | null = null; // 進入吸附階段後鎖定的整張牌位置
    let settleTau = SETTLE_TAU_MS;
    let last = performance.now();

    const tick = (t: number) => {
      const dt = Math.min(t - last, 48); // 分頁切走再回來時避免一次跳太遠
      last = t;
      if (target === null) {
        o += v * dt;
        v *= Math.exp(-dt / FRICTION_TAU_MS);
        if (Math.abs(v) < V_STOP) {
          // 剩餘滑行距離 ≈ v·τ,選定停在哪一張;一定要在前進方向上,不能倒退
          let tgt = Math.round(o + v * FRICTION_TAU_MS);
          if ((tgt - o) * v <= 0) tgt = v > 0 ? Math.ceil(o) : Math.floor(o);
          target = tgt;
          // 時間常數 = 距離 / 速度 → 吸附階段的初速剛好等於目前速度,不會突然加速
          const speed = Math.abs(v);
          settleTau =
            speed < 1e-4
              ? SETTLE_TAU_MS
              : Math.max(60, Math.min(FRICTION_TAU_MS, Math.abs(tgt - o) / speed));
        }
      } else {
        // 指數逼近整張牌位置(臨界阻尼,不會來回彈)
        o += (target - o) * (1 - Math.exp(-dt / settleTau));
        if (Math.abs(target - o) < 0.002) {
          o = target;
          applyLayout(o);
          spinRef.current = 0;
          btnRefs.current.forEach((el) => el && (el.style.transition = ""));
          // offset 以 n 為週期,正規化避免數字無限長大(排版完全相同)
          setOffset(((o % n) + n) % n);
          setWheelBusy(false);
          return;
        }
      }
      applyLayout(o);
      spinRef.current = requestAnimationFrame(tick);
    };
    // 拖曳期間 transition 已關閉,慣性迴圈同樣逐幀寫入,結束後才交還給 class 的動畫
    spinRef.current = requestAnimationFrame(tick);
  };

  const project = active !== null ? projects[active] : null;
  const showing = phase === "open";

  return (
    <>
      <div
        className="relative h-[29rem] sm:h-[35rem] select-none"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {projects.map((p, i) => {
          const slot = toSlot(i, offset, n);
          const angle = slot * step;
          const fade = fadeOf(slot, visibleHalf);
          // 剛從另一邊繞回來的牌不要做位移動畫,否則會橫掃整個扇形
          const jumped = Math.abs(slot - (prevSlotRef.current[i] ?? slot)) > 1;
          prevSlotRef.current[i] = slot;
          // 用 class 而不是 inline style 控制 transition:inline 的時間字串在 WebKit 會被序列化成秒,造成 hydration 警告
          const transitionClass = jumped
            ? "transition-none"
            : "transition-[transform,opacity] duration-[380ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]";

          const icon = icons[p.slug] ?? "📦";
          // 停在正中央的牌自動微抽高、亮邊框、淡入上方簡介
          const isCentered =
            !wheelBusy && active === null && Math.abs(slot) < 0.01;
          const isActive = active === i;
          return (
            <button
              type="button"
              key={p.slug}
              ref={(el) => {
                btnRefs.current[i] = el;
              }}
              aria-label={p.title}
              aria-expanded={isActive}
              onClick={(e) => {
                if (movedRef.current) {
                  // 拖曳結束後的 click 不算點牌
                  e.preventDefault();
                  movedRef.current = false;
                  return;
                }
                if (!isCentered) {
                  // 點旁邊的牌 → 轉到中央(簡介會跟著換),點中央那張才展開
                  centerCard(i);
                  return;
                }
                openCard(i);
              }}
              className={
                "group absolute bottom-12 sm:bottom-16 left-1/2 -ml-[4.5rem] sm:-ml-[5rem] outline-none cursor-pointer will-change-transform " +
                "z-(--z) hover:z-50 focus-visible:z-50 " +
                "opacity-(--fade) hover:opacity-100 focus-visible:opacity-100 " +
                transitionClass +
                (isCentered ? " z-50 opacity-100" : "")
              }
              style={
                {
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: `50% ${RADIUS_RATIO * 100}%`,
                  // 疊放順序跟著環狀位置走(右邊的牌壓在左邊的牌上)
                  "--z": Math.round(slot + mid),
                  "--fade": fadeLayers(fade).alpha,
                  "--veil": fadeLayers(fade).veil,
                  // 完全透明(可視範圍外)的牌不可點
                  pointerEvents: fade > 0 ? undefined : "none",
                } as React.CSSProperties
              }
            >
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={
                  `relative w-36 h-56 sm:w-40 sm:h-72 rounded-2xl border bg-gradient-to-br ${faces[i % faces.length]} ` +
                  "shadow-xl shadow-black/50 p-3 sm:p-4 flex flex-col justify-between " +
                  "transition-all duration-300 ease-out " +
                  "group-focus-visible:-translate-y-8 sm:group-focus-visible:-translate-y-12 group-focus-visible:border-sky-400 " +
                  (isCentered
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
                    (isCentered ? "opacity-90" : "opacity-50")
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
                      (isCentered ? "opacity-100" : "opacity-0")
                    }
                  >
                    點擊展開 →
                  </p>
                </div>

                {/* 淡出遮罩:背景色蓋在牌上,越靠邊越暗;滑過/選中時掀開 */}
                <div
                  aria-hidden
                  className={
                    "absolute inset-0 rounded-2xl bg-[#0a0e14] pointer-events-none " +
                    "opacity-(--veil) group-hover:opacity-0 group-focus-visible:opacity-0" +
                    (isCentered ? " opacity-0" : "")
                  }
                />
              </div>
            </button>
          );
        })}

        {/* 停在中央的那張牌,上方自動淡入專案簡介(左文字、右 GIF);轉動中先淡出 */}
        {(() => {
          // 中央牌 = 槽位 0 的那張:i - mid + offset = 0
          const ci = ((Math.round(mid - offset) % n) + n) % n;
          const pp = projects[ci];
          if (!pp) return null;
          const visible = !wheelBusy && active === null;
          const gif = pp.gif_url ?? pp.image_url;
          return (
              <div
                onClick={() => openCard(ci)}
                className={
                  // 貼在抽高卡牌的上緣:牌頂距容器底部 = bottom(3/4rem)+牌高(14/18rem)+抽高(2/3rem)
                  "absolute bottom-[20rem] sm:bottom-[26rem] left-1/2 -translate-x-1/2 w-[94%] max-w-md z-[60] " +
                  "rounded-2xl border border-sky-400/40 bg-slate-900/95 shadow-lg shadow-black/50 " +
                  "p-3 flex items-center gap-3 transition-all duration-300 " +
                  (visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none")
                }
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug">{pp.title}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-3">
                    {pp.summary}
                  </p>
                  <p className="text-[11px] text-sky-300 mt-1">點牌或點這裡展開 →</p>
                </div>
                <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                  {gif ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={gif} alt={pp.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl animate-bounce">{icons[pp.slug] ?? "📦"}</span>
                  )}
                </div>
              </div>
            );
          })()}
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
