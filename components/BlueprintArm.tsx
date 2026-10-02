"use client";

import Scene from "@/components/Scene";

const SKY = "#38bdf8";
// 線寬階層:外形 / 細節 / 作圖線 — 有層次圖才不會像草稿
const W_OUTLINE = 2.4;
const W_DETAIL = 1.1;
const W_CONSTRUCT = 0.6;

/** 軸承:外環、內環、滾珠 */
function Bearing({ cx, cy, r, delay }: { cx: number; cy: number; r: number; delay: number }) {
  const balls = 8;
  return (
    <g>
      <circle
        className="sc-pop"
        style={{ animationDelay: `${delay}ms` }}
        cx={cx}
        cy={cy}
        r={r}
        fill="#060a10"
        stroke={SKY}
        strokeWidth={W_OUTLINE}
      />
      <circle
        className="sc-pop"
        style={{ animationDelay: `${delay + 60}ms` }}
        cx={cx}
        cy={cy}
        r={r * 0.62}
        fill="none"
        stroke="rgba(125,211,252,0.6)"
        strokeWidth={W_DETAIL}
      />
      {Array.from({ length: balls }).map((_, i) => {
        const a = (i / balls) * Math.PI * 2;
        return (
          <circle
            key={i}
            className="sc-pop"
            style={{ animationDelay: `${delay + 110 + i * 18}ms` }}
            cx={cx + Math.cos(a) * r * 0.81}
            cy={cy + Math.sin(a) * r * 0.81}
            r={r * 0.13}
            fill="rgba(186,230,253,0.85)"
          />
        );
      })}
      <circle
        className="sc-pop"
        style={{ animationDelay: `${delay + 160}ms` }}
        cx={cx}
        cy={cy}
        r={r * 0.22}
        fill={SKY}
      />
    </g>
  );
}

/** 連桿:帶倒角的側面輪廓 + 內部減重孔與壁厚線 */
function Link({
  x,
  yTop,
  yBot,
  halfW,
  delay,
  holes,
}: {
  x: number;
  yTop: number;
  yBot: number;
  halfW: number;
  delay: number;
  holes: number[];
}) {
  const c = halfW * 0.55; // 倒角
  const d =
    `M${x - halfW} ${yBot} L${x - halfW} ${yTop + c} Q${x - halfW} ${yTop} ${x - halfW + c} ${yTop}` +
    ` L${x + halfW - c} ${yTop} Q${x + halfW} ${yTop} ${x + halfW} ${yTop + c} L${x + halfW} ${yBot} Z`;
  return (
    <g>
      <path
        className="sc-draw"
        style={{ animationDelay: `${delay}ms` }}
        pathLength={1}
        strokeDasharray={1}
        d={d}
        fill="url(#gMetal)"
        stroke={SKY}
        strokeWidth={W_OUTLINE}
        strokeLinejoin="round"
      />
      {/* 內緣細線:做出壁厚 */}
      <path
        className="sc-draw"
        style={{ animationDelay: `${delay + 120}ms` }}
        pathLength={1}
        strokeDasharray={1}
        d={`M${x - halfW + 4} ${yBot} L${x - halfW + 4} ${yTop + c + 2}`}
        fill="none"
        stroke="rgba(125,211,252,0.45)"
        strokeWidth={W_CONSTRUCT}
      />
      <path
        className="sc-draw"
        style={{ animationDelay: `${delay + 120}ms` }}
        pathLength={1}
        strokeDasharray={1}
        d={`M${x + halfW - 4} ${yBot} L${x + halfW - 4} ${yTop + c + 2}`}
        fill="none"
        stroke="rgba(125,211,252,0.45)"
        strokeWidth={W_CONSTRUCT}
      />
      {/* 減重孔 */}
      {holes.map((hy, i) => (
        <g key={i}>
          <circle
            className="sc-pop"
            style={{ animationDelay: `${delay + 220 + i * 70}ms` }}
            cx={x}
            cy={hy}
            r={halfW * 0.42}
            fill="#060a10"
            stroke="rgba(125,211,252,0.55)"
            strokeWidth={W_DETAIL}
          />
          <circle
            className="sc-pop"
            style={{ animationDelay: `${delay + 260 + i * 70}ms` }}
            cx={x}
            cy={hy}
            r={halfW * 0.42 + 3}
            fill="none"
            stroke="rgba(125,211,252,0.2)"
            strokeWidth={W_CONSTRUCT}
            strokeDasharray="2 3"
          />
        </g>
      ))}
    </g>
  );
}

export default function BlueprintArm() {
  const d = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <Scene label="機械手臂機構藍圖:線條依序繪製後開始運動">
      <div
        aria-hidden
        className="bp-scan pointer-events-none absolute inset-x-0 top-0 h-24 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(56,189,248,0.1) 55%, rgba(56,189,248,0.45))",
        }}
      />

      <svg
        viewBox="0 0 640 420"
        className="w-full h-auto"
        role="img"
        aria-label="二軸機械手臂機構圖,含軸承、尺寸標註與運動範圍"
      >
        {/* 底:網點 + 主格線 + 焦點光暈 */}
        <rect className="sc-fade" width="640" height="420" fill="url(#pDots)" />
        <rect className="sc-fade" style={d(60)} width="640" height="420" fill="url(#pGrid)" />
        <ellipse className="sc-fade" style={d(120)} cx="150" cy="240" rx="180" ry="200" fill="url(#gHalo)" />

        {/* 中心線 */}
        <line
          className="sc-draw"
          style={d(220)}
          pathLength={1}
          strokeDasharray={1}
          x1="140"
          y1="36"
          x2="140"
          y2="404"
          stroke="rgba(125,211,252,0.3)"
          strokeWidth={W_CONSTRUCT}
        />

        {/* 運動包絡線:手臂可及範圍 */}
        <path
          className="sc-draw"
          style={{ ...d(2250), animationDuration: "1200ms" }}
          pathLength={1}
          d="M140 85 A245 245 0 0 1 385 330"
          fill="none"
          stroke="rgba(56,189,248,0.25)"
          strokeWidth={W_DETAIL}
          strokeDasharray="6 5"
        />

        {/* 底座:本體 + 地腳螺栓 + 剖面線 */}
        <g>
          <path
            className="sc-draw"
            style={d(420)}
            pathLength={1}
            strokeDasharray={1}
            d="M86 358 L92 330 L188 330 L194 358 Z"
            fill="url(#gMetal)"
            stroke={SKY}
            strokeWidth={W_OUTLINE}
            strokeLinejoin="round"
          />
          <rect className="sc-fade" style={d(620)} x="88" y="358" width="104" height="13" fill="url(#pHatch)" />
          <line
            className="sc-draw"
            style={d(560)}
            pathLength={1}
            strokeDasharray={1}
            x1="80"
            y1="371"
            x2="200"
            y2="371"
            stroke="rgba(125,211,252,0.65)"
            strokeWidth={W_DETAIL}
          />
          {[100, 180].map((x, i) => (
            <g key={x}>
              <circle
                className="sc-pop"
                style={d(700 + i * 60)}
                cx={x}
                cy="344"
                r="4"
                fill="#060a10"
                stroke="rgba(125,211,252,0.7)"
                strokeWidth={W_DETAIL}
              />
              <line
                className="sc-draw"
                style={d(760 + i * 60)}
                pathLength={1}
                strokeDasharray={1}
                x1={x - 6}
                y1="344"
                x2={x + 6}
                y2="344"
                stroke="rgba(125,211,252,0.45)"
                strokeWidth={W_CONSTRUCT}
              />
            </g>
          ))}
        </g>

        {/* ---- 手臂:巢狀旋轉 ---- */}
        <g className="bp-arm1">
          <Link x={140} yTop={190} yBot={332} halfW={15} delay={820} holes={[236, 282]} />
          <g className="sc-fade" style={d(1560)}>
            <line x1="156" y1="262" x2="188" y2="248" stroke="rgba(125,211,252,0.5)" strokeWidth={W_CONSTRUCT} />
            <circle cx="156" cy="262" r="1.6" fill="rgba(125,211,252,0.8)" />
            <text x="192" y="251" fill="rgba(186,230,253,0.8)" fontSize="12" fontFamily="var(--font-mono), monospace">
              L1 142
            </text>
          </g>

          <g className="bp-arm2">
            <Link x={140} yTop={88} yBot={192} halfW={12} delay={1080} holes={[132]} />
            <g className="sc-fade" style={d(1660)}>
              <line x1="153" y1="140" x2="182" y2="128" stroke="rgba(125,211,252,0.5)" strokeWidth={W_CONSTRUCT} />
              <circle cx="153" cy="140" r="1.6" fill="rgba(125,211,252,0.8)" />
              <text x="186" y="131" fill="rgba(186,230,253,0.8)" fontSize="12" fontFamily="var(--font-mono), monospace">
                L2 104
              </text>
            </g>

            {/* 夾爪:指節 + 滾花握持面 */}
            <g className="bp-gripA">
              <path
                className="sc-draw"
                style={d(1320)}
                pathLength={1}
                strokeDasharray={1}
                d="M132 92 L120 58 L130 48"
                fill="none"
                stroke={SKY}
                strokeWidth={W_OUTLINE}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                className="sc-fade"
                style={d(1500)}
                x="120"
                y="52"
                width="9"
                height="12"
                rx="2"
                fill="url(#pKnurl)"
                transform="rotate(-18 124 58)"
              />
            </g>
            <g className="bp-gripB">
              <path
                className="sc-draw"
                style={d(1320)}
                pathLength={1}
                strokeDasharray={1}
                d="M148 92 L160 58 L150 48"
                fill="none"
                stroke={SKY}
                strokeWidth={W_OUTLINE}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                className="sc-fade"
                style={d(1500)}
                x="151"
                y="52"
                width="9"
                height="12"
                rx="2"
                fill="url(#pKnurl)"
                transform="rotate(18 156 58)"
              />
            </g>

            <Bearing cx={140} cy={190} r={10} delay={1180} />
          </g>
        </g>

        <Bearing cx={140} cy={330} r={14} delay={900} />

        {/* 角度弧 */}
        <g className="sc-fade" style={d(1980)}>
          <path
            d="M140 258 A72 72 0 0 1 203 294"
            fill="none"
            stroke="rgba(167,139,250,0.85)"
            strokeWidth={W_DETAIL}
            markerStart="url(#mArrow)"
            markerEnd="url(#mArrow)"
          />
          <text x="208" y="290" fill="rgba(196,181,253,0.95)" fontSize="12" fontFamily="var(--font-mono), monospace">
            θ1 ±180°
          </text>
        </g>

        {/* 尺寸線:總高 */}
        <g className="sc-draw" style={d(1760)} stroke="rgba(125,211,252,0.7)" strokeWidth={W_DETAIL}>
          <line
            pathLength={1}
            strokeDasharray={1}
            x1="556"
            y1="50"
            x2="556"
            y2="330"
            markerStart="url(#mArrow)"
            markerEnd="url(#mArrow)"
          />
          <line pathLength={1} strokeDasharray={1} x1="160" y1="50" x2="552" y2="50" strokeWidth={W_CONSTRUCT} />
          <line pathLength={1} strokeDasharray={1} x1="200" y1="330" x2="552" y2="330" strokeWidth={W_CONSTRUCT} />
        </g>
        <text
          className="sc-fade"
          style={d(1980)}
          x="566"
          y="194"
          fill="rgba(186,230,253,0.85)"
          fontSize="12"
          fontFamily="var(--font-mono), monospace"
        >
          280
        </text>

        {/* 尺寸線:底座寬 */}
        <g className="sc-draw" style={d(1820)} stroke="rgba(125,211,252,0.7)" strokeWidth={W_DETAIL}>
          <line
            pathLength={1}
            strokeDasharray={1}
            x1="86"
            y1="396"
            x2="194"
            y2="396"
            markerStart="url(#mArrow)"
            markerEnd="url(#mArrow)"
          />
          <line pathLength={1} strokeDasharray={1} x1="86" y1="374" x2="86" y2="400" strokeWidth={W_CONSTRUCT} />
          <line pathLength={1} strokeDasharray={1} x1="194" y1="374" x2="194" y2="400" strokeWidth={W_CONSTRUCT} />
        </g>
        <text
          className="sc-fade"
          style={d(2020)}
          x="206"
          y="400"
          fill="rgba(186,230,253,0.85)"
          fontSize="12"
          fontFamily="var(--font-mono), monospace"
        >
          108
        </text>

        {/* 圖框標題欄 */}
        <g className="sc-fade" style={d(2200)} fontFamily="var(--font-mono), monospace">
          <rect
            x="396"
            y="330"
            width="228"
            height="66"
            rx="3"
            fill="rgba(6,10,16,0.75)"
            stroke="rgba(56,189,248,0.3)"
            strokeWidth={W_CONSTRUCT}
          />
          <line x1="396" y1="352" x2="624" y2="352" stroke="rgba(56,189,248,0.22)" strokeWidth={W_CONSTRUCT} />
          <line x1="396" y1="374" x2="624" y2="374" stroke="rgba(56,189,248,0.22)" strokeWidth={W_CONSTRUCT} />
          <line x1="520" y1="352" x2="520" y2="396" stroke="rgba(56,189,248,0.22)" strokeWidth={W_CONSTRUCT} />
          <text x="406" y="345" fill="rgba(186,230,253,0.75)" fontSize="11" letterSpacing="2">
            2-AXIS ARM
          </text>
          <text x="406" y="367" fill="rgba(125,211,252,0.5)" fontSize="9">
            DWG-001
          </text>
          <text x="530" y="367" fill="rgba(125,211,252,0.5)" fontSize="9">
            SCALE 1:2
          </text>
          <text x="406" y="389" fill="rgba(125,211,252,0.5)" fontSize="9">
            AL6061-T6
          </text>
          <text x="530" y="389" fill="rgba(125,211,252,0.5)" fontSize="9">
            REV A
          </text>
        </g>
      </svg>
    </Scene>
  );
}
