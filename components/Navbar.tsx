"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const links = [
  { href: "/", label: "首頁" },
  { href: "/portfolio", label: "作品集" },
  { href: "/blog", label: "部落格" },
  { href: "/#contact", label: "聯絡我" },
];

export default function Navbar() {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [ind, setInd] = useState<{ x: number; w: number; on: boolean }>({
    x: 0,
    w: 0,
    on: false,
  });

  // 指示器停在目前頁面的那一項
  const activeIndex = links.findIndex(
    (l) => l.href === pathname || (l.href !== "/" && pathname.startsWith(l.href))
  );

  const moveTo = useCallback((i: number) => {
    const wrap = wrapRef.current;
    const el = itemRefs.current[i];
    if (!wrap || !el) return;
    const w = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setInd({ x: r.left - w.left, w: r.width, on: true });
  }, []);

  const reset = useCallback(() => {
    if (activeIndex >= 0) moveTo(activeIndex);
    else setInd((s) => ({ ...s, on: false }));
  }, [activeIndex, moveTo]);

  useEffect(() => {
    reset();
    window.addEventListener("resize", reset);
    return () => window.removeEventListener("resize", reset);
  }, [reset]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[#0a0e14]/80 border-b border-white/10">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="group font-bold text-lg tracking-wide">
          William
          <span className="text-sky-400 inline-block transition-transform duration-[var(--dur-2)] ease-[var(--ease-spring)] group-hover:scale-150 group-hover:rotate-12">
            .
          </span>
        </Link>

        <div ref={wrapRef} className="relative flex gap-5 text-sm text-gray-300" onPointerLeave={reset}>
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onPointerEnter={() => moveTo(i)}
              className={
                "py-1 transition-colors duration-[var(--dur-1)] hover:text-sky-300 " +
                (i === activeIndex ? "text-sky-400" : "")
              }
            >
              {l.label}
            </Link>
          ))}
          {/* 在項目之間滑動的發光底線 */}
          <span
            aria-hidden
            className="nav-ind"
            style={{
              transform: `translateX(${ind.x}px)`,
              width: ind.w,
              opacity: ind.on ? 1 : 0,
            }}
          />
        </div>
      </nav>
    </header>
  );
}
