"use client";

import Scene from "@/components/Scene";

const W = 560;
const PERIOD = 80; // 一個波形週期的寬度
const REPEAT = 11; // 畫這麼多週期(超過畫布寬度,捲動才不會露出盡頭)

/** 方波(PWM):duty 決定高電位佔比 */
function pwm(y0: number, y1: number, duty: number) {
  let d = `M0 ${y0}`;
  for (let i = 0; i < REPEAT; i++) {
    const x = i * PERIOD;
    const xh = x + PERIOD * duty;
    d += ` L${xh} ${y0} L${xh} ${y1} L${x + PERIOD} ${y1} L${x + PERIOD} ${y0}`;
  }
  return d;
}
/** 正交編碼器 B 相:與 A 相相差 90° */
function quad(y0: number, y1: number, shift: number) {
  let d = `M0 ${y1}`;
  for (let i = 0; i < REPEAT; i++) {
    const x = i * PERIOD + shift;
    d += ` L${x} ${y1} L${x} ${y0} L${x + PERIOD / 2} ${y0} L${x + PERIOD / 2} ${y1}`;
  }
  return d;
}
/** 類比取樣:帶雜訊的弦波 */
function analog(mid: number, amp: number) {
  let d = `M0 ${mid}`;
  for (let x = 0; x <= REPEAT * PERIOD; x += 8) {
    const y =
      mid -
      Math.sin((x / PERIOD) * Math.PI * 2) * amp -
      Math.sin((x / PERIOD) * Math.PI * 7) * amp * 0.12;
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return d;
}

export default function ScopeTrace() {
  const rows = [
    { label: "CH1", sub: "PWM 20 kHz · duty 62%", color: "#38bdf8", d: pwm(96, 56, 0.62) },
    { label: "CH2", sub: "ENC A/B 正交", color: "#22d3ee", d: quad(176, 136, 0) },
    { label: "CH3", sub: "電流回授 ADC", color: "#a78bfa", d: analog(236, 26) },
  ];

  return (
    <Scene label="示波器畫面:PWM、正交編碼器與電流回授訊號">
      <svg viewBox="0 0 640 300" className="w-full h-auto" role="img">
        {/* 刻度格 */}
        <g className="sc-fade" stroke="rgba(125,211,252,0.13)" strokeWidth="0.5">
          {Array.from({ length: 17 }).map((_, i) => (
            <line key={`v${i}`} x1={40 + i * 35} y1="20" x2={40 + i * 35} y2="270" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1="40" y1={20 + i * 35} x2="620" y2={20 + i * 35} />
          ))}
        </g>

        {/* 波形:裁切在畫布內,才看得出是「捲過去」 */}
        <defs>
          <clipPath id="scopeClip">
            <rect x="40" y="20" width={W + 20} height="250" />
          </clipPath>
        </defs>
        <g clipPath="url(#scopeClip)">
          {rows.map((r, i) => (
            <g key={r.label} transform="translate(40,0)">
              <g className="scope-scroll">
                <path
                  className="sc-draw"
                  style={{ animationDelay: `${180 + i * 200}ms`, animationDuration: "1000ms" }}
                  pathLength={1}
                  strokeDasharray={1}
                  d={r.d}
                  fill="none"
                  stroke={r.color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  filter="drop-shadow(0 0 4px currentColor)"
                />
              </g>
            </g>
          ))}
        </g>

        {/* 掃描游標 */}
        <g clipPath="url(#scopeClip)">
          <line
            className="scope-sweep sc-fade"
            style={{ animationDelay: "900ms" }}
            x1="40" y1="20" x2="40" y2="270"
            stroke="rgba(255,255,255,0.35)" strokeWidth="1"
          />
        </g>

        {/* 通道標籤 */}
        {rows.map((r, i) => (
          <g key={`l${r.label}`} className="sc-rise" style={{ animationDelay: `${420 + i * 140}ms` }}>
            <text x="46" y={44 + i * 80} fill={r.color} fontSize="12"
              fontFamily="var(--font-mono), monospace" letterSpacing="1">{r.label}</text>
            <text x="86" y={44 + i * 80} fill="rgba(186,230,253,0.55)" fontSize="11"
              fontFamily="var(--font-mono), monospace">{r.sub}</text>
          </g>
        ))}

        {/* 左側電位刻度 */}
        <g className="sc-fade" style={{ animationDelay: "300ms" }} fontFamily="var(--font-mono), monospace"
          fontSize="9" fill="rgba(125,211,252,0.45)">
          {["3V3", "0V", "3V3", "0V", "+A", "-A"].map((t, i) => (
            <text key={i} x="10" y={60 + i * 36}>{t}</text>
          ))}
        </g>

        {/* 狀態列 */}
        <g className="sc-rise" style={{ animationDelay: "900ms" }}
          fontFamily="var(--font-mono), monospace" fontSize="11">
          <circle className="scope-blink" cx="48" cy="286" r="3.5" fill="#4ade80" />
          <text x="60" y="290" fill="rgba(74,222,128,0.9)">RUN</text>
          <text x="110" y="290" fill="rgba(186,230,253,0.5)">TRIG ↑ CH1</text>
          <text x="230" y="290" fill="rgba(186,230,253,0.5)">50 µs/div</text>
          <text x="340" y="290" fill="rgba(186,230,253,0.5)">Δt 31.2 µs</text>
          <text x="460" y="290" fill="rgba(186,230,253,0.5)">STM32 · TIM1</text>
        </g>
      </svg>
    </Scene>
  );
}
