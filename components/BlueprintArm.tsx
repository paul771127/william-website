"use client";

import Scene from "@/components/Scene";

const SKY = "#38bdf8";
const FAINT = "rgba(125, 211, 252, 0.18)";

/**
 * 機構藍圖:捲進畫面時線條依序自己畫出來(底座 → 連桿 → 關節 → 夾爪 → 標註 →
 * 角度弧),畫完之後三軸開始連續運動,像一張活起來的設計圖。
 * 繪製/播放的時機由 Scene 統一處理。
 */
export default function BlueprintArm() {
  // 依序繪製的節奏
  const d = (ms: number) => ({ animationDelay: `${ms}ms` });


  return (
    <Scene label="機械手臂機構藍圖:線條依序繪製後開始運動">
      {/* 繪製時掃過的掃描線 */}
      <div
        aria-hidden
        className="bp-scan pointer-events-none absolute inset-x-0 top-0 h-24 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(56,189,248,0.12) 55%, rgba(56,189,248,0.5))",
        }}
      />

      <svg
        viewBox="0 0 640 420"
        className="w-full h-auto"
        role="img"
        aria-label="六軸機械手臂機構藍圖,線條依序繪製後開始運動"
      >
        {/* 格線 */}
        <g className="sc-fade" style={d(0)} stroke={FAINT} strokeWidth="0.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="420" />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 40} x2="640" y2={i * 40} />
          ))}
        </g>

        {/* 中心線(點劃線) */}
        <line
          className="sc-draw"
          style={d(220)}
          pathLength={1}
          strokeDasharray={1}
          x1="140" y1="40" x2="140" y2="400"
          stroke="rgba(125,211,252,0.35)" strokeWidth="1"
        />

        {/* 底座 + 剖面線 */}
        <rect
          className="sc-draw" style={d(420)} pathLength={1} strokeDasharray={1}
          x="90" y="330" width="100" height="28" rx="3"
          fill="rgba(56,189,248,0.06)" stroke={SKY} strokeWidth="2"
        />
        <g className="sc-draw" style={d(560)} stroke="rgba(125,211,252,0.5)" strokeWidth="1">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} pathLength={1} strokeDasharray={1}
              x1={88 + i * 12} y1="372" x2={100 + i * 12} y2="358" />
          ))}
        </g>
        <line className="sc-draw" style={d(560)} pathLength={1} strokeDasharray={1}
          x1="80" y1="372" x2="200" y2="372" stroke="rgba(125,211,252,0.5)" strokeWidth="1" />

        {/* ---- 手臂本體:巢狀旋轉,運動學才正確 ---- */}
        <g className="bp-arm1">
          {/* 連桿 1 */}
          <path
            className="sc-draw" style={d(760)} pathLength={1} strokeDasharray={1}
            d="M126 330 L126 190 A14 14 0 0 1 154 190 L154 330 Z"
            fill="rgba(56,189,248,0.07)" stroke={SKY} strokeWidth="2.5"
          />
          <text className="sc-fade" style={d(1500)} x="164" y="266"
            fill="rgba(186,230,253,0.75)" fontSize="13" fontFamily="var(--font-mono), monospace">
            L1
          </text>

          <g className="bp-arm2">
            {/* 連桿 2 */}
            <path
              className="sc-draw" style={d(1040)} pathLength={1} strokeDasharray={1}
              d="M129 190 L129 85 A11 11 0 0 1 151 85 L151 190 Z"
              fill="rgba(56,189,248,0.07)" stroke={SKY} strokeWidth="2.5"
            />
            <text className="sc-fade" style={d(1600)} x="160" y="140"
              fill="rgba(186,230,253,0.75)" fontSize="13" fontFamily="var(--font-mono), monospace">
              L2
            </text>

            {/* 夾爪:兩指開合 */}
            <g className="bp-gripA">
              <path className="sc-draw" style={d(1320)} pathLength={1} strokeDasharray={1}
                d="M133 85 L120 56 L128 50" fill="none" stroke={SKY} strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <g className="bp-gripB">
              <path className="sc-draw" style={d(1320)} pathLength={1} strokeDasharray={1}
                d="M147 85 L160 56 L152 50" fill="none" stroke={SKY} strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* 關節 2 */}
            <circle className="sc-pop" style={{ ...d(1180), transformBox: "fill-box", transformOrigin: "center" }}
              cx="140" cy="190" r="9" fill="#0a0e14" stroke={SKY} strokeWidth="2.5" />
            <circle className="sc-pop" style={{ ...d(1260), transformBox: "fill-box", transformOrigin: "center" }}
              cx="140" cy="190" r="3" fill={SKY} />
          </g>
        </g>

        {/* 關節 1(底座軸心) */}
        <circle className="sc-pop" style={{ ...d(900), transformBox: "fill-box", transformOrigin: "center" }}
          cx="140" cy="330" r="12" fill="#0a0e14" stroke={SKY} strokeWidth="2.5" />
        <circle className="sc-pop" style={{ ...d(980), transformBox: "fill-box", transformOrigin: "center" }}
          cx="140" cy="330" r="4" fill={SKY} />

        {/* 角度弧 + 標註 */}
        <path className="sc-draw" style={d(1900)} pathLength={1} strokeDasharray={1}
          d="M140 260 A70 70 0 0 1 200 295" fill="none"
          stroke="rgba(167,139,250,0.9)" strokeWidth="1.5" />
        <text className="sc-fade" style={d(2100)} x="205" y="290"
          fill="rgba(196,181,253,0.95)" fontSize="13" fontFamily="var(--font-mono), monospace">
          θ1 ±180°
        </text>

        {/* 尺寸線:高度 */}
        <g stroke="rgba(125,211,252,0.55)" strokeWidth="1">
          <line className="sc-draw" style={d(1700)} pathLength={1} strokeDasharray={1}
            x1="560" y1="50" x2="560" y2="330" />
          <line className="sc-draw" style={d(1700)} pathLength={1} strokeDasharray={1}
            x1="554" y1="50" x2="566" y2="50" />
          <line className="sc-draw" style={d(1700)} pathLength={1} strokeDasharray={1}
            x1="554" y1="330" x2="566" y2="330" />
        </g>
        <text className="sc-fade" style={d(1950)} x="572" y="196"
          fill="rgba(186,230,253,0.8)" fontSize="13" fontFamily="var(--font-mono), monospace">
          280
        </text>

        {/* 尺寸線:底座寬 */}
        <g stroke="rgba(125,211,252,0.55)" strokeWidth="1">
          <line className="sc-draw" style={d(1780)} pathLength={1} strokeDasharray={1}
            x1="90" y1="396" x2="190" y2="396" />
          <line className="sc-draw" style={d(1780)} pathLength={1} strokeDasharray={1}
            x1="90" y1="390" x2="90" y2="402" />
          <line className="sc-draw" style={d(1780)} pathLength={1} strokeDasharray={1}
            x1="190" y1="390" x2="190" y2="402" />
        </g>
        <text className="sc-fade" style={d(2000)} x="206" y="401"
          fill="rgba(186,230,253,0.8)" fontSize="13" fontFamily="var(--font-mono), monospace">
          100
        </text>

        {/* 圖框標題 */}
        <g className="sc-fade" style={d(2200)} fontFamily="var(--font-mono), monospace">
          <text x="380" y="60" fill="rgba(186,230,253,0.5)" fontSize="11" letterSpacing="3">
            DWG-001 / 2-AXIS ARM
          </text>
          <text x="380" y="80" fill="rgba(125,211,252,0.35)" fontSize="11" letterSpacing="3">
            SCALE 1:2 · REV A
          </text>
        </g>
      </svg>
    </Scene>
  );
}
