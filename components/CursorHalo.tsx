"use client";

import { useEffect, useRef } from "react";

const LAG = 0.16; // 光暈追上游標的速度(0~1,越小越黏)

/**
 * 跟著游標的光暈環:平時是小圈,移到可點擊的東西上會放大變亮。
 * 只在有滑鼠的裝置啟用,而且不遮蔽原生游標。
 */
export default function CursorHalo() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = -200;
    let ty = -200;
    let x = tx;
    let y = ty;
    let raf = 0;
    let shown = false;

    const tick = () => {
      x += (tx - x) * LAG;
      y += (ty - y) * LAG;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        el.style.opacity = "1";
      }
      // 停在可互動元素上 → 光暈放大
      const hot = (e.target as Element | null)?.closest?.(
        "a, button, [role='dialog'], .tilt-wrap, .skill-pill"
      );
      el.style.width = hot ? "64px" : "26px";
      el.style.height = hot ? "64px" : "26px";
      el.style.borderColor = hot ? "rgba(34,211,238,0.9)" : "rgba(56,189,248,0.45)";
      el.style.background = hot ? "rgba(34,211,238,0.10)" : "rgba(56,189,248,0.04)";
    };
    const onLeave = () => {
      shown = false;
      el.style.opacity = "0";
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="cursor-halo border"
      style={{ width: 26, height: 26, opacity: 0, borderColor: "rgba(56,189,248,0.45)" }}
    />
  );
}
