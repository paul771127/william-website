"use client";

import Scene from "@/components/Scene";

const JOG = ["J1+", "J2+", "J3+", "J1−", "J2−", "J3−"];
const POINTS = [
  ["P01", "取料位", "ok"],
  ["P02", "對位", "run"],
  ["P03", "放料位", ""],
  ["P04", "原點", ""],
];
const IO = [
  ["DO1", "夾爪", "#4ade80"],
  ["DO2", "吸盤", "#4ade80"],
  ["DO3", "蜂鳴", "#f59e0b"],
];

export default function AndroidPanel() {
  const d = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <Scene label="Android 控制 App 介面:Jog 操作、點位清單與 I/O 狀態">
      <svg viewBox="0 0 640 300" className="w-full h-auto" role="img">
        <rect className="sc-fade" width="640" height="300" fill="url(#pDots)" />

        {/* 手機:機身 + 側鍵 + 螢幕內凹 */}
        <g>
          <rect className="sc-draw" style={d(120)} pathLength={1} strokeDasharray={1}
            x="208" y="12" width="224" height="276" rx="28"
            fill="rgba(8,13,20,0.95)" stroke="rgba(125,211,252,0.65)" strokeWidth="2.2" />
          {/* 側鍵 */}
          <rect className="sc-fade" style={d(420)} x="205" y="72" width="3" height="22" rx="1.5"
            fill="rgba(125,211,252,0.4)" />
          <rect className="sc-fade" style={d(460)} x="205" y="102" width="3" height="34" rx="1.5"
            fill="rgba(125,211,252,0.4)" />
          <rect className="sc-fade" style={d(500)} x="432" y="84" width="3" height="28" rx="1.5"
            fill="rgba(125,211,252,0.4)" />
          {/* 螢幕 */}
          <rect className="sc-draw" style={d(300)} pathLength={1} strokeDasharray={1}
            x="217" y="21" width="206" height="258" rx="21"
            fill="url(#gScreen)" stroke="rgba(56,189,248,0.25)" strokeWidth="1" />
          {/* 聽筒 */}
          <rect className="sc-fade" style={d(480)} x="300" y="29" width="40" height="4" rx="2"
            fill="rgba(125,211,252,0.3)" />
        </g>

        {/* 狀態列 */}
        <g className="sc-fade" style={d(560)} fontFamily="var(--font-mono), monospace" fontSize="8"
          fill="rgba(186,230,253,0.55)">
          <text x="228" y="48">09:41</text>
          <g transform="translate(386,42)">
            {[3, 5, 7, 9].map((h, i) => (
              <rect key={i} x={i * 3.5} y={9 - h} width="2.2" height={h}
                fill={i < 3 ? "rgba(186,230,253,0.7)" : "rgba(186,230,253,0.25)"} />
            ))}
          </g>
          <rect x="404" y="34" width="14" height="8" rx="2" fill="none" stroke="rgba(186,230,253,0.5)" strokeWidth="0.8" />
          <rect x="405.5" y="35.5" width="9" height="5" rx="1" fill="rgba(74,222,128,0.8)" />
        </g>

        {/* App bar */}
        <g className="sc-rise" style={d(640)}>
          <rect x="217" y="54" width="206" height="34" fill="rgba(56,189,248,0.08)" />
          <line x1="217" y1="88" x2="423" y2="88" stroke="rgba(56,189,248,0.25)" strokeWidth="0.8" />
          <g stroke="rgba(186,230,253,0.7)" strokeWidth="1.4" strokeLinecap="round">
            <line x1="229" y1="67" x2="241" y2="67" />
            <line x1="229" y1="71.5" x2="241" y2="71.5" />
            <line x1="229" y1="76" x2="241" y2="76" />
          </g>
          <text x="252" y="76" fill="#e0f2fe" fontSize="12" fontFamily="var(--font-mono), monospace">
            Dobot 控制台
          </text>
          <circle cx="408" cy="71" r="4" fill="rgba(74,222,128,0.9)" />
        </g>

        {/* 連線狀態 */}
        <g className="sc-rise" style={d(700)} fontFamily="var(--font-mono), monospace">
          <text x="228" y="104" fill="rgba(74,222,128,0.85)" fontSize="8">
            ● TCP 192.168.1.6:29999 已連線
          </text>
        </g>

        {/* Jog 按鈕 */}
        {JOG.map((j, i) => {
          const x = 228 + (i % 3) * 63;
          const y = 114 + Math.floor(i / 3) * 42;
          return (
            <g key={j} className="sc-pop" style={d(800 + i * 85)}>
              <g className={i === 0 ? "and-jog" : undefined}>
                <rect x={x} y={y} width="55" height="34" rx="9"
                  fill="url(#gMetal)" stroke="rgba(56,189,248,0.5)" strokeWidth="1" />
                <rect x={x + 1.5} y={y + 1.5} width="52" height="12" rx="7"
                  fill="rgba(255,255,255,0.05)" />
                <text x={x + 27.5} y={y + 22} textAnchor="middle" fill="#bae6fd" fontSize="11.5"
                  fontFamily="var(--font-mono), monospace">{j}</text>
              </g>
            </g>
          );
        })}

        {/* 觸控漣漪 */}
        <g className="and-tap sc-fade" style={d(1500)}>
          <circle className="and-ripple" cx="255" cy="131" r="2" fill="none"
            stroke="rgba(224,242,254,0.9)" strokeWidth="1.5" />
        </g>

        {/* 點位清單 */}
        <g className="sc-fade" style={d(1250)} fontFamily="var(--font-mono), monospace">
          <text x="228" y="208" fill="rgba(125,211,252,0.5)" fontSize="7.5" letterSpacing="1.5">
            TEACH POINTS
          </text>
        </g>
        {POINTS.map(([id, name, st], i) => (
          <g key={id} className="sc-rise" style={d(1320 + i * 120)}>
            <rect x="228" y={216 + i * 20} width="184" height="17" rx="4"
              fill={st === "run" ? "rgba(56,189,248,0.18)" : "rgba(255,255,255,0.03)"}
              stroke={st === "run" ? "rgba(56,189,248,0.5)" : "transparent"} strokeWidth="0.8" />
            <text x="235" y={228 + i * 20} fill="rgba(125,211,252,0.65)" fontSize="8.5"
              fontFamily="var(--font-mono), monospace">{id}</text>
            <text x="266" y={228 + i * 20} fill={st === "run" ? "#bae6fd" : "rgba(186,230,253,0.55)"}
              fontSize="9" fontFamily="var(--font-mono), monospace">{name}</text>
            {st === "ok" && <text x="400" y={228 + i * 20} textAnchor="end" fill="rgba(74,222,128,0.8)" fontSize="8.5">✓</text>}
            {st === "run" && <circle className="scope-blink" cx="398" cy={224 + i * 20} r="3" fill="#38bdf8" />}
          </g>
        ))}

        {/* 左:DO 輸出 */}
        <g className="sc-rise" style={d(1000)} fontFamily="var(--font-mono), monospace">
          <rect x="18" y="48" width="160" height="104" rx="7"
            fill="rgba(6,10,16,0.7)" stroke="rgba(56,189,248,0.22)" />
          <text x="30" y="66" fill="rgba(125,211,252,0.55)" fontSize="8" letterSpacing="1.5">DIGITAL OUT</text>
          <line x1="30" y1="72" x2="166" y2="72" stroke="rgba(56,189,248,0.18)" />
          {IO.map(([id, name, color], i) => (
            <g key={id}>
              <circle className={`and-io${i + 1}`} cx="38" cy={90 + i * 22} r="5" fill={color}
                filter="url(#fGlow)" />
              <circle cx="38" cy={90 + i * 22} r="7.5" fill="none" stroke="rgba(125,211,252,0.2)" strokeWidth="0.7" />
              <text x="54" y={93 + i * 22} fill="rgba(125,211,252,0.6)" fontSize="8.5">{id}</text>
              <text x="84" y={93 + i * 22} fill="rgba(186,230,253,0.6)" fontSize="9">{name}</text>
            </g>
          ))}
        </g>

        {/* 左下:PLC */}
        <g className="sc-rise" style={d(1150)} fontFamily="var(--font-mono), monospace">
          <rect x="18" y="164" width="160" height="56" rx="7"
            fill="rgba(6,10,16,0.7)" stroke="rgba(56,189,248,0.22)" />
          <text x="30" y="182" fill="rgba(125,211,252,0.55)" fontSize="8" letterSpacing="1.5">PLC NX102</text>
          <line x1="30" y1="188" x2="166" y2="188" stroke="rgba(56,189,248,0.18)" />
          <circle cx="38" cy="204" r="4" fill="#4ade80" />
          <text x="52" y="207" fill="rgba(134,239,172,0.9)" fontSize="9">RUN</text>
          <text x="104" y="207" fill="rgba(186,230,253,0.45)" fontSize="8.5">EtherCAT</text>
        </g>

        {/* 右:即時姿態 */}
        <g className="sc-rise" style={d(1100)} fontFamily="var(--font-mono), monospace">
          <rect x="462" y="48" width="160" height="124" rx="7"
            fill="rgba(6,10,16,0.7)" stroke="rgba(56,189,248,0.22)" />
          <text x="474" y="66" fill="rgba(125,211,252,0.55)" fontSize="8" letterSpacing="1.5">POSE / mm</text>
          <line x1="474" y1="72" x2="610" y2="72" stroke="rgba(56,189,248,0.18)" />
          {[["X", "218.4"], ["Y", "-64.9"], ["Z", "112.7"], ["R", "35.2"]].map(([k, v], i) => (
            <g key={k}>
              <text x="474" y={92 + i * 23} fill="rgba(186,230,253,0.45)" fontSize="9">{k}</text>
              <text x="610" y={92 + i * 23} textAnchor="end" fill="#7dd3fc" fontSize="12">{v}</text>
              <line x1="474" y1={96 + i * 23} x2="610" y2={96 + i * 23}
                stroke="rgba(56,189,248,0.08)" strokeWidth="0.6" />
            </g>
          ))}
        </g>

        {/* 右下:速度倍率 */}
        <g className="sc-rise" style={d(1250)} fontFamily="var(--font-mono), monospace">
          <rect x="462" y="184" width="160" height="56" rx="7"
            fill="rgba(6,10,16,0.7)" stroke="rgba(56,189,248,0.22)" />
          <text x="474" y="202" fill="rgba(125,211,252,0.55)" fontSize="8" letterSpacing="1.5">SPEED</text>
          <rect x="474" y="212" width="136" height="6" rx="3" fill="rgba(56,189,248,0.12)" />
          <rect x="474" y="212" width="82" height="6" rx="3" fill="#38bdf8" filter="url(#fGlow)" />
          <text x="610" y="234" textAnchor="end" fill="#7dd3fc" fontSize="11">60%</text>
        </g>
      </svg>
    </Scene>
  );
}
