"use client";

import { useRef } from "react";

const PULL = 0.32; // 往游標靠過去的比例
const RANGE = 1.5; // 感應範圍(元件尺寸的倍數)

/** 磁吸按鈕:游標靠近時整顆被吸過去,離開彈回原位 */
export default function MagneticButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const raf = useRef(0);

  const onMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el) return;
    const cx = e.clientX;
    const cy = e.clientY;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const r = el.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2);
      const dy = cy - (r.top + r.height / 2);
      const within = Math.abs(dx) < r.width * RANGE && Math.abs(dy) < r.height * RANGE;
      el.style.transform = within
        ? `translate(${dx * PULL}px, ${dy * PULL}px)`
        : "translate(0,0)";
    });
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0,0)";
  };

  return (
    <span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={
        "inline-block transition-transform duration-[var(--dur-2)] ease-[var(--ease-spring)] " +
        className
      }
    >
      {children}
    </span>
  );
}
