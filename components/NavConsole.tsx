"use client";

import Scene from "@/components/Scene";

const ROUTE = "M70 250 L190 196 L330 224 L452 140 L556 176";
const TRACK =
  "M70 250 Q130 218 190 200 Q262 214 330 226 Q392 188 452 144 Q506 152 556 178";
const WPS = [
  { x: 70, y: 250, n: "WP0" },
  { x: 190, y: 196, n: "WP1" },
  { x: 330, y: 224, n: "WP2" },
  { x: 452, y: 140, n: "WP3" },
  { x: 556, y: 176, n: "WP4" },
];
const TELEM = [
  { hdg: "042°", sog: "6.2", xte: "1.4" },
  { hdg: "068°", sog: "6.8", xte: "0.7" },
  { hdg: "031°", sog: "7.1", xte: "2.2" },
  { hdg: "055°", sog: "6.5", xte: "0.9" },
];

/** 羅盤玫瑰:外圈刻度 + 四方位 + 指北針 */
function CompassRose({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="rgba(6,10,16,0.5)" stroke="rgba(56,189,248,0.3)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r * 0.78} fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth="0.6" />
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i / 36) * Math.PI * 2 - Math.PI / 2;
        const major = i % 9 === 0;
        const r1 = r * (major ? 0.74 : 0.86);
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * r1}
            y1={cy + Math.sin(a) * r1}
            x2={cx + Math.cos(a) * r * 0.97}
            y2={cy + Math.sin(a) * r * 0.97}
            stroke={major ? "rgba(125,211,252,0.7)" : "rgba(125,211,252,0.28)"}
            strokeWidth={major ? 1 : 0.6}
          />
        );
      })}
      {/* 指北針 */}
      <path d={`M${cx} ${cy - r * 0.62} L${cx + 5} ${cy} L${cx} ${cy + r * 0.2} L${cx - 5} ${cy} Z`}
        fill="rgba(224,242,254,0.9)" />
      <path d={`M${cx} ${cy + r * 0.2} L${cx + 5} ${cy} L${cx} ${cy - r * 0.62} Z`}
        fill="rgba(56,189,248,0.45)" />
      <text x={cx} y={cy - r - 4} textAnchor="middle" fill="rgba(186,230,253,0.7)" fontSize="8"
        fontFamily="var(--font-mono), monospace">N</text>
    </g>
  );
}

export default function NavConsole() {
  const d = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <Scene label="地面站導航畫面:航點規劃與無人船即時軌跡">
      <svg viewBox="0 0 640 300" className="w-full h-auto" role="img">
        <rect className="sc-fade" width="640" height="300" fill="url(#gScreen)" />
        <rect className="sc-fade" style={d(60)} width="640" height="300" fill="url(#pDots)" />

        {/* 等深線:兩條柔和的曲線,讓海圖不是空的 */}
        <g className="sc-draw" style={{ ...d(160), animationDuration: "1400ms" }} fill="none">
          <path pathLength={1} strokeDasharray={1}
            d="M-10 110 Q120 70 250 100 Q380 130 520 84 Q590 62 650 78"
            stroke="rgba(56,189,248,0.13)" strokeWidth="1" />
          <path pathLength={1} strokeDasharray={1}
            d="M-10 284 Q140 252 268 272 Q400 292 530 250 Q600 228 650 240"
            stroke="rgba(56,189,248,0.13)" strokeWidth="1" />
        </g>

        {/* 經緯格 + 標籤 */}
        <g className="sc-fade" style={d(120)}>
          <g stroke="rgba(125,211,252,0.07)" strokeWidth="0.6">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 80} y1="0" x2={i * 80} y2="300" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 75} x2="640" y2={i * 75} />
            ))}
          </g>
          <g fill="rgba(125,211,252,0.3)" fontSize="7.5" fontFamily="var(--font-mono), monospace">
            {["121°32′", "121°33′", "121°34′", "121°35′"].map((t, i) => (
              <text key={t} x={84 + i * 160} y="12">{t}</text>
            ))}
            {["25°09′", "25°08′"].map((t, i) => (
              <text key={t} x="6" y={82 + i * 150}>{t}</text>
            ))}
          </g>
        </g>

        {/* 規劃航線 */}
        {/* 規劃航線保持虛線外觀,所以用淡入而不是描繪(兩者都要吃 strokeDasharray) */}
        <path className="sc-fade" style={{ ...d(340), animationDuration: "900ms" }}
          d={ROUTE} fill="none" stroke="rgba(125,211,252,0.4)" strokeWidth="1.3" strokeDasharray="7 5" />

        {/* 實際航跡:發光主線 + 底下較寬的淡暈 */}
        <path className="sc-draw" style={{ ...d(1400), animationDuration: "1600ms" }}
          pathLength={1} strokeDasharray={1}
          d={TRACK} fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth="7" strokeLinecap="round" />
        <path className="sc-draw" style={{ ...d(1400), animationDuration: "1600ms" }}
          pathLength={1} strokeDasharray={1}
          d={TRACK} fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" filter="url(#fGlow)" />

        {/* 航點:方框標籤 + 引線 */}
        {WPS.map((w, i) => (
          <g key={w.n}>
            <circle className="nav-ping" cx={w.x} cy={w.y} r="5" fill="none"
              stroke="rgba(56,189,248,0.65)" strokeWidth="1.4" style={d(2000 + i * 420)} />
            <g className="sc-pop" style={d(440 + i * 170)}>
              <path d={`M${w.x} ${w.y - 7} L${w.x + 7} ${w.y} L${w.x} ${w.y + 7} L${w.x - 7} ${w.y} Z`}
                fill="#060a10" stroke="#38bdf8" strokeWidth="1.6" />
              <circle cx={w.x} cy={w.y} r="1.8" fill="#38bdf8" />
            </g>
            <g className="sc-fade" style={d(600 + i * 170)}>
              <line x1={w.x + 7} y1={w.y - 7} x2={w.x + 15} y2={w.y - 15}
                stroke="rgba(125,211,252,0.35)" strokeWidth="0.6" />
              <rect x={w.x + 15} y={w.y - 26} width="34" height="13" rx="2"
                fill="rgba(6,10,16,0.8)" stroke="rgba(56,189,248,0.3)" strokeWidth="0.6" />
              <text x={w.x + 19} y={w.y - 16} fill="rgba(186,230,253,0.75)" fontSize="8.5"
                fontFamily="var(--font-mono), monospace">{w.n}</text>
            </g>
          </g>
        ))}

        {/* 無人船:船體 + 尾流 */}
        <g className="nav-boat sc-fade" style={d(1900)}>
          <path d="M-22 0 L-8 -3 L-8 3 Z" fill="rgba(125,211,252,0.28)" />
          <path d="M-10 -7 L13 0 L-10 7 L-6 0 Z" fill="#e0f2fe" stroke="#0ea5e9"
            strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="-1" cy="0" r="1.8" fill="#0ea5e9" />
        </g>

        {/* 羅盤 */}
        <g className="sc-fade" style={d(700)}>
          <CompassRose cx={578} cy={62} r={30} />
        </g>

        {/* 遙測面板 */}
        <g className="sc-rise" style={d(1000)} fontFamily="var(--font-mono), monospace">
          <rect x="14" y="14" width="190" height="80" rx="7"
            fill="rgba(6,10,16,0.88)" stroke="rgba(56,189,248,0.3)" />
          <line x1="14" y1="34" x2="204" y2="34" stroke="rgba(56,189,248,0.2)" />
          <text x="24" y="28" fill="rgba(125,211,252,0.6)" fontSize="8" letterSpacing="2">TELEMETRY</text>
          <circle className="scope-blink" cx="194" cy="24" r="2.6" fill="#4ade80" />
          {TELEM.map((t, i) => (
            <g key={i} className="nav-readout" style={d(2000 + i * 2000)}>
              <text x="24" y="54" fill="rgba(186,230,253,0.45)" fontSize="8">HDG</text>
              <text x="24" y="70" fill="#7dd3fc" fontSize="14">{t.hdg}</text>
              <text x="92" y="54" fill="rgba(186,230,253,0.45)" fontSize="8">SOG kn</text>
              <text x="92" y="70" fill="#7dd3fc" fontSize="14">{t.sog}</text>
              <text x="152" y="54" fill="rgba(186,230,253,0.45)" fontSize="8">XTE m</text>
              <text x="152" y="70" fill="#a78bfa" fontSize="14">{t.xte}</text>
            </g>
          ))}
          <text x="24" y="88" fill="rgba(125,211,252,0.35)" fontSize="7.5">RTK FIX · LINK 98%</text>
        </g>

        {/* 比例尺 */}
        <g className="sc-fade" style={d(1300)} fontFamily="var(--font-mono), monospace">
          <line x1="470" y1="276" x2="546" y2="276" stroke="rgba(125,211,252,0.6)" strokeWidth="1" />
          <line x1="470" y1="272" x2="470" y2="280" stroke="rgba(125,211,252,0.6)" strokeWidth="1" />
          <line x1="508" y1="273" x2="508" y2="279" stroke="rgba(125,211,252,0.4)" strokeWidth="1" />
          <line x1="546" y1="272" x2="546" y2="280" stroke="rgba(125,211,252,0.6)" strokeWidth="1" />
          <text x="470" y="290" fill="rgba(186,230,253,0.45)" fontSize="8">0</text>
          <text x="540" y="290" fill="rgba(186,230,253,0.45)" fontSize="8">200 m</text>
        </g>

        {/* 模式列 */}
        <g className="sc-rise" style={d(1500)} fontFamily="var(--font-mono), monospace" fontSize="10">
          <rect x="14" y="258" width="110" height="20" rx="4"
            fill="rgba(74,222,128,0.12)" stroke="rgba(74,222,128,0.4)" />
          <circle cx="26" cy="268" r="3" fill="#4ade80" />
          <text x="36" y="272" fill="rgba(134,239,172,0.95)">AUTO · 任務中</text>
          <text x="136" y="272" fill="rgba(186,230,253,0.45)">MISSION 4/5 WP</text>
          <text x="256" y="272" fill="rgba(186,230,253,0.45)">ETA 04:12</text>
        </g>
      </svg>
    </Scene>
  );
}
