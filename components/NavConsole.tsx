"use client";

import Scene from "@/components/Scene";

const ROUTE = "M70 250 L190 196 L330 224 L452 140 L556 176";
const WPS = [
  { x: 70, y: 250, n: "WP0" },
  { x: 190, y: 196, n: "WP1" },
  { x: 330, y: 224, n: "WP2" },
  { x: 452, y: 140, n: "WP3" },
  { x: 556, y: 176, n: "WP4" },
];
// 四組輪流顯示的遙測讀數
const TELEM = [
  { hdg: "042°", sog: "6.2 kn", xte: "1.4 m" },
  { hdg: "068°", sog: "6.8 kn", xte: "0.7 m" },
  { hdg: "031°", sog: "7.1 kn", xte: "2.2 m" },
  { hdg: "055°", sog: "6.5 kn", xte: "0.9 m" },
];

export default function NavConsole() {
  return (
    <Scene label="地面站導航畫面:航點規劃與無人船即時軌跡">
      <svg viewBox="0 0 640 300" className="w-full h-auto" role="img">
        {/* 海圖格線 */}
        <g className="sc-fade" stroke="rgba(125,211,252,0.1)" strokeWidth="0.5">
          {Array.from({ length: 17 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 40} x2="640" y2={i * 40} />
          ))}
        </g>

        {/* 雷達掃描 */}
        <g className="sc-fade" style={{ animationDelay: "200ms" }}>
          <circle cx="556" cy="60" r="34" fill="none" stroke="rgba(56,189,248,0.25)" strokeWidth="1" />
          <circle cx="556" cy="60" r="20" fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth="1" />
          <g className="nav-radar">
            <path d="M556 60 L556 26 A34 34 0 0 1 586 47 Z" fill="rgba(56,189,248,0.25)" />
          </g>
        </g>

        {/* 規劃航線(虛線) */}
        <path
          className="sc-draw" style={{ animationDelay: "300ms", animationDuration: "1200ms" }}
          pathLength={1} strokeDasharray={1}
          d={ROUTE} fill="none" stroke="rgba(125,211,252,0.45)" strokeWidth="1.5"
        />

        {/* 實際航跡:略偏離規劃線,像真的有橫向誤差 */}
        <path
          className="sc-draw" style={{ animationDelay: "1400ms", animationDuration: "1600ms" }}
          pathLength={1} strokeDasharray={1}
          d="M70 250 Q130 218 190 200 Q262 214 330 226 Q392 188 452 144 Q506 152 556 178"
          fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"
          filter="drop-shadow(0 0 6px rgba(56,189,248,0.8))"
        />

        {/* 航點 */}
        {WPS.map((w, i) => (
          <g key={w.n}>
            <circle className="nav-ping" cx={w.x} cy={w.y} r="5" fill="none"
              stroke="rgba(56,189,248,0.7)" strokeWidth="1.5"
              style={{ animationDelay: `${2000 + i * 420}ms` }} />
            <circle className="sc-pop" style={{ animationDelay: `${420 + i * 180}ms` }}
              cx={w.x} cy={w.y} r="5" fill="#0a0e14" stroke="#38bdf8" strokeWidth="2" />
            <text className="sc-fade" style={{ animationDelay: `${560 + i * 180}ms` }}
              x={w.x + 10} y={w.y - 9} fill="rgba(186,230,253,0.7)" fontSize="10"
              fontFamily="var(--font-mono), monospace">{w.n}</text>
          </g>
        ))}

        {/* 無人船:沿著航線行進,船首自動對準航向 */}
        <g className="nav-boat sc-fade" style={{ animationDelay: "1900ms" }}>
          <path d="M-9 -6 L11 0 L-9 6 L-5 0 Z" fill="#e0f2fe"
            stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round" />
        </g>

        {/* 遙測讀數:四組輪播 */}
        <g className="sc-rise" style={{ animationDelay: "1100ms" }}>
          <rect x="16" y="16" width="176" height="74" rx="8"
            fill="rgba(7,11,17,0.85)" stroke="rgba(56,189,248,0.3)" />
          <text x="28" y="36" fill="rgba(125,211,252,0.55)" fontSize="9"
            fontFamily="var(--font-mono), monospace" letterSpacing="2">TELEMETRY</text>
          {TELEM.map((t, i) => (
            <g key={i} className="nav-readout" style={{ animationDelay: `${2000 + i * 2000}ms` }}
              fontFamily="var(--font-mono), monospace">
              <text x="28" y="56" fill="rgba(186,230,253,0.6)" fontSize="10">HDG</text>
              <text x="62" y="56" fill="#7dd3fc" fontSize="12">{t.hdg}</text>
              <text x="118" y="56" fill="rgba(186,230,253,0.6)" fontSize="10">SOG</text>
              <text x="118" y="72" fill="#7dd3fc" fontSize="12">{t.sog}</text>
              <text x="28" y="72" fill="rgba(186,230,253,0.6)" fontSize="10">XTE</text>
              <text x="62" y="72" fill="#a78bfa" fontSize="12">{t.xte}</text>
            </g>
          ))}
        </g>

        {/* 模式列 */}
        <g className="sc-rise" style={{ animationDelay: "1500ms" }}
          fontFamily="var(--font-mono), monospace" fontSize="11">
          <text x="16" y="288" fill="rgba(74,222,128,0.9)">● AUTO</text>
          <text x="92" y="288" fill="rgba(186,230,253,0.5)">MISSION 4/5 WP</text>
          <text x="230" y="288" fill="rgba(186,230,253,0.5)">LINK 98%</text>
          <text x="330" y="288" fill="rgba(186,230,253,0.5)">GPS FIX RTK</text>
        </g>
      </svg>
    </Scene>
  );
}
