"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number };
type Pulse = { a: number; b: number; t: number; speed: number };

const LINK_DIST = 130; // 兩節點多近才連線(px)
const CURSOR_R = 200; // 游標的影響半徑
const DRIFT = 0.16; // 節點自走速度

/**
 * 電路粒子場:節點自由漂移、鄰近者連線,游標會把附近節點吸過來並點亮線路,
 * 線上偶爾跑過訊號脈衝(機電/AI 的電路意象)。
 */
export default function CircuitField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    let raf = 0;
    let running = true;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      if (w === 0 || h === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(16, Math.min(58, Math.round((w * h) / 17000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * DRIFT * 2,
        vy: (Math.random() - 0.5) * DRIFT * 2,
      }));
      pulses = [];
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);

      // 節點移動:自走 + 游標吸引 + 邊界回彈
      for (const p of nodes) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
        }
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < CURSOR_R && d > 1) {
            const pull = (1 - d / CURSOR_R) * 0.6;
            p.x += (dx / d) * pull;
            p.y += (dy / d) * pull;
          }
        }
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
      }

      // 連線:距離越近越亮,靠近游標的線額外加亮
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK_DIST) continue;
          let alpha = (1 - d / LINK_DIST) * 0.33;
          if (pointer.active) {
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const pd = Math.hypot(pointer.x - mx, pointer.y - my);
            if (pd < CURSOR_R) alpha += (1 - pd / CURSOR_R) * 0.5;
          }
          ctx.strokeStyle = `rgba(56, 189, 248, ${Math.min(alpha, 0.85)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // 節點本體
      for (const p of nodes) {
        const near = pointer.active
          ? Math.max(0, 1 - Math.hypot(pointer.x - p.x, pointer.y - p.y) / CURSOR_R)
          : 0;
        const r = 1.4 + near * 2.2;
        ctx.fillStyle = `rgba(125, 211, 252, ${0.45 + near * 0.55})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (near > 0.35) {
          ctx.fillStyle = `rgba(56, 189, 248, ${(near - 0.35) * 0.25})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 訊號脈衝:沿著連線跑過去
      if (!reduced && nodes.length > 2 && pulses.length < 5 && Math.random() < 0.035) {
        const a = Math.floor(Math.random() * nodes.length);
        let b = Math.floor(Math.random() * nodes.length);
        if (b === a) b = (b + 1) % nodes.length;
        if (Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y) < LINK_DIST) {
          pulses.push({ a, b, t: 0, speed: 0.012 + Math.random() * 0.016 });
        }
      }
      pulses = pulses.filter((pu) => {
        pu.t += pu.speed;
        if (pu.t >= 1) return false;
        const a = nodes[pu.a];
        const b = nodes[pu.b];
        if (!a || !b) return false;
        const x = a.x + (b.x - a.x) * pu.t;
        const y = a.y + (b.y - a.y) * pu.t;
        const fade = Math.sin(pu.t * Math.PI);
        ctx.fillStyle = `rgba(186, 230, 253, ${0.9 * fade})`;
        ctx.beginPath();
        ctx.arc(x, y, 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(56, 189, 248, ${0.28 * fade})`;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      if (running) raf = requestAnimationFrame(step);
    };

    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active =
        pointer.x >= 0 && pointer.x <= r.width && pointer.y >= 0 && pointer.y <= r.height;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    const start = () => {
      if (raf) return;
      running = true;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    // 捲出畫面或切到別的分頁就停,不浪費效能
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    start();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
