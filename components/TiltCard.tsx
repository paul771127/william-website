"use client";

import { useRef } from "react";

const MAX_TILT = 9; // 最大傾角(度)

/**
 * 3D 傾斜卡片:滑鼠在卡片上移動時,卡片會朝游標方向傾斜,
 * 並有一道跟著游標跑的高光,做出實體卡片被光照到的感覺。
 */
export default function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const raf = useRef(0);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const x = e.clientX;
    const y = e.clientY;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const r = el.getBoundingClientRect();
      const px = (x - r.left) / r.width; // 0~1
      const py = (y - r.top) / r.height;
      el.style.setProperty("--ry", `${(px - 0.5) * MAX_TILT * 2}deg`);
      el.style.setProperty("--rx", `${-(py - 0.5) * MAX_TILT * 2}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
      el.style.setProperty("--lift", "1");
    });
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--lift", "0");
  };

  return (
    <div className="tilt-wrap" onPointerMove={onMove} onPointerLeave={reset}>
      <div ref={ref} className="tilt-inner">
        {children}
      </div>
    </div>
  );
}
