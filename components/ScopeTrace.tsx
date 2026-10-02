"use client";

import Scene from "@/components/Scene";

const PERIOD = 80; // 一個波形週期的寬度
const REPEAT = 11; // 畫這麼多週期,捲動才不會露出盡頭
const X0 = 54; // 螢幕左緣
const Y0 = 30; // 螢幕上緣
const SW = 470; // 螢幕寬
const SH = 212; // 螢幕高

/** 方波(PWM):duty 決定高電位佔比,轉角帶一點上升時間才像真的 */
function pwm(yLow: number, yHigh: number, duty: number) {
  const rise = 2.5;
  let d = `M0 ${yLow}`;
  for (let i = 0; i < REPEAT; i++) {
    const x = i * PERIOD;
    const xh = x + PERIOD * duty;
    d += ` L${xh - rise} ${yLow} L${xh + rise} ${yHigh} L${x + PERIOD - rise} ${yHigh} L${x + PERIOD + rise} ${yLow}`;
  }
  return d;
}
/** 正交編碼器:與 A 相差 90° */
function quad(yLow: number, yHigh: number, shift: number) {
  let d = `M0 ${yHigh}`;
  for (let i = 0; i < REPEAT; i++) {
    const x = i * PERIOD + shift;
    d += ` L${x} ${yHigh} L${x} ${yLow} L${x + PERIOD / 2} ${yLow} L${x + PERIOD / 2} ${yHigh}`;
  }
  return d;
}
/** 類比取樣:弦波疊高頻漣波 */
function analog(mid: number, amp: number) {
  let d = `M0 ${mid}`;
  for (let x = 0; x <= REPEAT * PERIOD; x += 6) {
    const y =
      mid -
      Math.sin((x / PERIOD) * Math.PI * 2) * amp -
      Math.sin((x / PERIOD) * Math.PI * 7) * amp * 0.11;
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return d;
}

const ROWS = [
  { label: "CH1", sub: "PWM 20 kHz", color: "#38bdf8", d: pwm(96, 56, 0.62), y: 76 },
  { label: "CH2", sub: "ENC A/B", color: "#22d3ee", d: quad(160, 124, 0), y: 142 },
  { label: "CH3", sub: "I_fb ADC", color: "#a78bfa", d: analog(206, 22), y: 206 },
];

export default function ScopeTrace() {
  const d = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <Scene label="示波器畫面:PWM、正交編碼器與電流回授訊號">
      <svg viewBox="0 0 640 300" className="w-full h-auto" role="img">
        {/* 機殼 */}
        <rect className="sc-fade" x="10" y="10" width="620" height="280" rx="12"
          fill="rgba(10,16,24,0.6)" stroke="rgba(56,189,248,0.18)" />

        {/* 螢幕:內凹的玻璃面 */}
        <rect className="sc-draw" style={d(100)} pathLength={1} strokeDasharray={1}
          x={X0 - 8} y={Y0 - 8} width={SW + 16} height={SH + 16} rx="6"
          fill="url(#gScreen)" stroke="rgba(56,189,248,0.45)" strokeWidth="1.6" />

        {/* 刻度:細分格 + 主格 + 中央十字 */}
        <g className="sc-fade" style={d(260)}>
          <g stroke="rgba(125,211,252,0.09)" strokeWidth="0.5">
            {Array.from({ length: 47 }).map((_, i) => (
              <line key={`v${i}`} x1={X0 + i * 10} y1={Y0} x2={X0 + i * 10} y2={Y0 + SH} />
            ))}
            {Array.from({ length: 22 }).map((_, i) => (
              <line key={`h${i}`} x1={X0} y1={Y0 + i * 10} x2={X0 + SW} y2={Y0 + i * 10} />
            ))}
          </g>
          <g stroke="rgba(125,211,252,0.2)" strokeWidth="0.8">
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`V${i}`} x1={X0 + i * 47} y1={Y0} x2={X0 + i * 47} y2={Y0 + SH} />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`H${i}`} x1={X0} y1={Y0 + i * 42.4} x2={X0 + SW} y2={Y0 + i * 42.4} />
            ))}
          </g>
          {/* 中央十字與刻度牙 */}
          <g stroke="rgba(125,211,252,0.42)" strokeWidth="0.9">
            <line x1={X0 + SW / 2} y1={Y0} x2={X0 + SW / 2} y2={Y0 + SH} />
            <line x1={X0} y1={Y0 + SH / 2} x2={X0 + SW} y2={Y0 + SH / 2} />
            {Array.from({ length: 23 }).map((_, i) => (
              <line key={`t${i}`} x1={X0 + i * 20} y1={Y0 + SH / 2 - 3} x2={X0 + i * 20} y2={Y0 + SH / 2 + 3} />
            ))}
          </g>
        </g>

        <defs>
          <clipPath id="scopeClip">
            <rect x={X0} y={Y0} width={SW} height={SH} rx="2" />
          </clipPath>
        </defs>

        {/* 波形 */}
        <g clipPath="url(#scopeClip)">
          {ROWS.map((r, i) => (
            <g key={r.label} transform={`translate(${X0},0)`}>
              <g className="scope-scroll">
                <path
                  className="sc-draw"
                  style={{ animationDelay: `${420 + i * 220}ms`, animationDuration: "1000ms" }}
                  pathLength={1}
                  strokeDasharray={1}
                  d={r.d}
                  fill="none"
                  stroke={r.color}
                  strokeWidth="1.9"
                  strokeLinejoin="round"
                  filter="url(#fGlow)"
                />
              </g>
            </g>
          ))}
          {/* 掃描游標 */}
          <rect className="scope-sweep sc-fade" style={d(1100)}
            x={X0} y={Y0} width="2" height={SH} fill="rgba(224,242,254,0.5)" />
        </g>

        {/* 觸發準位 + 標記 */}
        <g className="sc-fade" style={d(1200)}>
          <line x1={X0} y1="76" x2={X0 + SW} y2="76"
            stroke="rgba(251,191,36,0.4)" strokeWidth="0.8" strokeDasharray="4 4" />
          <path d={`M${X0 - 7} 76 l7 -5 0 10 z`} fill="rgba(251,191,36,0.9)" />
          <text x={X0 + SW - 26} y="72" fill="rgba(251,191,36,0.75)" fontSize="9"
            fontFamily="var(--font-mono), monospace">T</text>
        </g>

        {/* 通道標籤:色塊 + 名稱 + 說明 */}
        {ROWS.map((r, i) => (
          <g key={`l${r.label}`} className="sc-rise" style={d(640 + i * 150)}>
            <rect x="16" y={r.y - 11} width="4" height="14" rx="2" fill={r.color} />
            <text x="26" y={r.y} fill={r.color} fontSize="11"
              fontFamily="var(--font-mono), monospace" letterSpacing="0.5">{r.label}</text>
            <text x="16" y={r.y + 14} fill="rgba(186,230,253,0.45)" fontSize="8.5"
              fontFamily="var(--font-mono), monospace">{r.sub}</text>
          </g>
        ))}

        {/* 右側量測表 */}
        <g className="sc-rise" style={d(1000)} fontFamily="var(--font-mono), monospace">
          <rect x="540" y="30" width="84" height="130" rx="5"
            fill="rgba(6,10,16,0.75)" stroke="rgba(56,189,248,0.25)" />
          <text x="548" y="44" fill="rgba(125,211,252,0.5)" fontSize="8" letterSpacing="1.5">MEASURE</text>
          <line x1="548" y1="50" x2="616" y2="50" stroke="rgba(56,189,248,0.2)" />
          {[
            ["Freq", "20.0k", "#38bdf8"],
            ["Duty", "62.1%", "#38bdf8"],
            ["Δt", "31.2µ", "#22d3ee"],
            ["Vpp", "3.28V", "#22d3ee"],
            ["Irms", "1.84A", "#a78bfa"],
          ].map(([k, v, c], i) => (
            <g key={k}>
              <text x="548" y={66 + i * 18} fill="rgba(186,230,253,0.5)" fontSize="9">{k}</text>
              <text x="616" y={66 + i * 18} textAnchor="end" fill={c as string} fontSize="10">{v}</text>
            </g>
          ))}
        </g>

        {/* 左側電位刻度 */}
        <g className="sc-fade" style={d(420)} fontFamily="var(--font-mono), monospace"
          fontSize="7.5" fill="rgba(125,211,252,0.4)" textAnchor="end">
          {[["3V3", 56], ["0V", 96], ["3V3", 124], ["0V", 160], ["+2A", 184], ["-2A", 228]].map(([t, y], i) => (
            <text key={i} x={X0 - 12} y={(y as number) + 3}>{t}</text>
          ))}
        </g>

        {/* 狀態列 */}
        <g className="sc-rise" style={d(1180)} fontFamily="var(--font-mono), monospace" fontSize="10">
          <circle className="scope-blink" cx="24" cy="266" r="3.5" fill="#4ade80" />
          <text x="34" y="270" fill="rgba(74,222,128,0.9)">RUN</text>
          <text x="76" y="270" fill="rgba(186,230,253,0.45)">TRIG ↑ CH1 1.65V</text>
          <text x="214" y="270" fill="rgba(186,230,253,0.45)">50 µs/div</text>
          <text x="306" y="270" fill="rgba(186,230,253,0.45)">1 V/div</text>
          <text x="382" y="270" fill="rgba(186,230,253,0.45)">12.5 MSa/s</text>
          <text x="492" y="270" fill="rgba(125,211,252,0.6)">STM32 · TIM1</text>
        </g>
      </svg>
    </Scene>
  );
}
