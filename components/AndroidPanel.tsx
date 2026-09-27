"use client";

import Scene from "@/components/Scene";

const JOG = ["J1+", "J2+", "J3+", "J1−", "J2−", "J3−"];
const POINTS = ["P01  取料位", "P02  對位", "P03  放料位", "P04  原點"];

export default function AndroidPanel() {
  return (
    <Scene label="Android 控制 App 介面:Jog 操作、點位清單與 I/O 狀態">
      <svg viewBox="0 0 640 300" className="w-full h-auto" role="img">
        {/* 手機外框 */}
        <g className="sc-draw" style={{ animationDelay: "120ms" }}>
          <rect pathLength={1} strokeDasharray={1}
            x="196" y="14" width="248" height="272" rx="26"
            fill="rgba(7,11,17,0.9)" stroke="#38bdf8" strokeWidth="2" />
        </g>
        <rect className="sc-fade" style={{ animationDelay: "500ms" }}
          x="296" y="22" width="48" height="5" rx="2.5" fill="rgba(125,211,252,0.4)" />

        {/* 標題列 */}
        <g className="sc-rise" style={{ animationDelay: "560ms" }} fontFamily="var(--font-mono), monospace">
          <text x="214" y="52" fill="#e0f2fe" fontSize="12">Dobot 控制台</text>
          <text x="214" y="66" fill="rgba(74,222,128,0.9)" fontSize="9">● TCP 192.168.1.6 已連線</text>
        </g>

        {/* Jog 按鈕:依序彈出,並有一顆持續被按下 */}
        {JOG.map((j, i) => {
          const x = 212 + (i % 3) * 76;
          const y = 82 + Math.floor(i / 3) * 46;
          return (
            <g key={j} className="sc-pop" style={{ animationDelay: `${700 + i * 90}ms` }}>
              <g className={i === 0 ? "and-jog" : undefined}>
                <rect x={x} y={y} width="66" height="36" rx="8"
                  fill="rgba(56,189,248,0.1)" stroke="rgba(56,189,248,0.45)" />
                <text x={x + 33} y={y + 23} textAnchor="middle" fill="#7dd3fc" fontSize="12"
                  fontFamily="var(--font-mono), monospace">{j}</text>
              </g>
            </g>
          );
        })}

        {/* 觸控漣漪:在四顆按鈕之間跳 */}
        <g className="and-tap sc-fade" style={{ animationDelay: "1500ms" }}>
          <circle className="and-ripple" cx="245" cy="100" r="2" fill="none"
            stroke="rgba(224,242,254,0.9)" strokeWidth="1.5" />
        </g>

        {/* 點位清單:逐列滑入 */}
        {POINTS.map((p, i) => (
          <g key={p} className="sc-rise" style={{ animationDelay: `${1300 + i * 130}ms` }}>
            <rect x="212" y={180 + i * 24} width="216" height="20" rx="4"
              fill={i === 1 ? "rgba(56,189,248,0.16)" : "rgba(255,255,255,0.03)"} />
            <text x="220" y={194 + i * 24} fill={i === 1 ? "#bae6fd" : "rgba(186,230,253,0.6)"}
              fontSize="10" fontFamily="var(--font-mono), monospace">{p}</text>
          </g>
        ))}

        {/* 左側:DO 輸出狀態 */}
        <g className="sc-rise" style={{ animationDelay: "1000ms" }} fontFamily="var(--font-mono), monospace">
          <text x="24" y="56" fill="rgba(125,211,252,0.55)" fontSize="9" letterSpacing="2">DIGITAL OUT</text>
          {["DO1 夾爪", "DO2 吸盤", "DO3 蜂鳴"].map((t, i) => (
            <g key={t}>
              <circle className={`and-io${i + 1}`} cx="30" cy={78 + i * 26} r="5"
                fill={i === 2 ? "#f59e0b" : "#4ade80"} />
              <text x="44" y={82 + i * 26} fill="rgba(186,230,253,0.6)" fontSize="10">{t}</text>
            </g>
          ))}
        </g>

        {/* 右側:即時座標 */}
        <g className="sc-rise" style={{ animationDelay: "1150ms" }} fontFamily="var(--font-mono), monospace">
          <text x="464" y="56" fill="rgba(125,211,252,0.55)" fontSize="9" letterSpacing="2">POSE</text>
          {[["X", "218.4"], ["Y", "-64.9"], ["Z", "112.7"], ["R", "35.2"]].map(([k, v], i) => (
            <g key={k}>
              <text x="464" y={80 + i * 22} fill="rgba(186,230,253,0.55)" fontSize="10">{k}</text>
              <text x="486" y={80 + i * 22} fill="#7dd3fc" fontSize="11">{v}</text>
            </g>
          ))}
          <text x="464" y="186" fill="rgba(125,211,252,0.55)" fontSize="9" letterSpacing="2">PLC</text>
          <text x="464" y="204" fill="rgba(74,222,128,0.85)" fontSize="10">NX102 RUN</text>
        </g>
      </svg>
    </Scene>
  );
}
