"use client";

import Scene from "@/components/Scene";

// 四層網路:輸入 → 兩層隱藏 → 輸出
const LAYERS = [
  { x: 118, n: 4, label: "INPUT", sub: "感測 / 影像" },
  { x: 258, n: 6, label: "HIDDEN", sub: "512" },
  { x: 398, n: 6, label: "HIDDEN", sub: "512" },
  { x: 528, n: 3, label: "OUTPUT", sub: "判讀" },
];
const TOKENS = ["偵測到", "第 3 軸", "扭力異常", "·", "建議", "降速 15%"];

function ys(n: number) {
  const gap = 32;
  const top = 158 - ((n - 1) * gap) / 2;
  return Array.from({ length: n }, (_, i) => top + i * gap);
}

export default function InferenceFlow() {
  const d = (ms: number) => ({ animationDelay: `${ms}ms` });
  const nodes = LAYERS.map((l) => ({ ...l, ys: ys(l.n) }));

  return (
    <Scene label="地端 AI 推論流程:輸入經過網路層層傳遞後產生回應">
      <svg viewBox="0 0 640 300" className="w-full h-auto" role="img">
        <rect className="sc-fade" width="640" height="300" fill="url(#pDots)" />

        {/* 每層的範圍框,讓結構讀得出來 */}
        {nodes.map((l, li) => {
          const top = Math.min(...l.ys) - 20;
          const h = Math.max(...l.ys) - Math.min(...l.ys) + 40;
          return (
            <g key={`box${li}`} className="sc-fade" style={d(220 + li * 130)}>
              <rect x={l.x - 26} y={top} width="52" height={h} rx="10"
                fill="rgba(56,189,248,0.03)" stroke="rgba(56,189,248,0.16)" strokeWidth="0.8" />
              <text x={l.x} y={top - 10} textAnchor="middle" fill="rgba(125,211,252,0.6)" fontSize="8"
                fontFamily="var(--font-mono), monospace" letterSpacing="1.5">{l.label}</text>
              <text x={l.x} y={top + h + 16} textAnchor="middle" fill="rgba(186,230,253,0.4)" fontSize="8"
                fontFamily="var(--font-mono), monospace">{l.sub}</text>
            </g>
          );
        })}

        {/* 突觸:訊號沿著連線往右流動,粗細依「權重」分兩級 */}
        <g>
          {nodes.slice(0, -1).map((l, li) =>
            l.ys.map((y1, i) =>
              nodes[li + 1].ys.map((y2, j) => {
                const strong = (i + j) % 3 === 0;
                return (
                  <line
                    key={`${li}-${i}-${j}`}
                    className="ai-syn sc-fade"
                    style={{
                      animationDelay: `${300 + li * 180}ms, ${((i + j) % 6) * 260}ms`,
                      animationDuration: "520ms, 1900ms",
                    }}
                    x1={l.x + 8} y1={y1} x2={nodes[li + 1].x - 8} y2={y2}
                    stroke={li === 2 ? "rgba(167,139,250,0.45)" : "rgba(56,189,248,0.4)"}
                    strokeWidth={strong ? 1.1 : 0.55}
                  />
                );
              })
            )
          )}
        </g>

        {/* 節點:外圈 + 漸層本體 + 高光 */}
        {nodes.map((l, li) => (
          <g key={li}>
            {l.ys.map((y, i) => (
              <g key={i}>
                <circle className="sc-pop" style={d(260 + li * 150 + i * 55)}
                  cx={l.x} cy={y} r="9.5" fill="none"
                  stroke={li === 3 ? "rgba(167,139,250,0.35)" : "rgba(56,189,248,0.3)"} strokeWidth="0.8" />
                <circle className="ai-node sc-pop"
                  style={{ animationDelay: `${260 + li * 150 + i * 55}ms, ${li * 300 + i * 160}ms` }}
                  cx={l.x} cy={y} r="6"
                  fill={li === 3 ? "#a78bfa" : "#38bdf8"} filter="url(#fGlow)" />
                <circle cx={l.x - 1.6} cy={y - 1.8} r="1.6" fill="rgba(255,255,255,0.55)" />
              </g>
            ))}
          </g>
        ))}

        {/* 輸出面板:逐詞串流 */}
        <g className="sc-rise" style={d(1200)}>
          <rect x="16" y="14" width="608" height="46" rx="9"
            fill="rgba(6,10,16,0.88)" stroke="rgba(167,139,250,0.3)" />
          <line x1="16" y1="34" x2="624" y2="34" stroke="rgba(167,139,250,0.18)" />
          <text x="28" y="28" fill="rgba(167,139,250,0.7)" fontSize="8"
            fontFamily="var(--font-mono), monospace" letterSpacing="2">
            LOCAL INFERENCE · 離線執行
          </text>
          <circle className="scope-blink" cx="614" cy="24" r="2.6" fill="#a78bfa" />
          <g fontFamily="var(--font-mono), monospace" fontSize="13">
            {TOKENS.map((t, i) => (
              <text key={i} className="ai-token" style={d(1600 + i * 260)}
                x={28 + TOKENS.slice(0, i).join(" ").length * 7.6} y="52"
                fill={i >= 4 ? "#c4b5fd" : "#bae6fd"}>{t}</text>
            ))}
            <text className="ai-caret" x={28 + TOKENS.join(" ").length * 7.6} y="52" fill="#a78bfa">▌</text>
          </g>
        </g>

        {/* 左下:執行環境 */}
        <g className="sc-rise" style={d(1350)} fontFamily="var(--font-mono), monospace">
          <rect x="16" y="252" width="188" height="34" rx="6"
            fill="rgba(6,10,16,0.7)" stroke="rgba(56,189,248,0.2)" />
          <circle cx="32" cy="269" r="3.5" fill="#4ade80" />
          <text x="44" y="266" fill="rgba(186,230,253,0.6)" fontSize="8.5">GPU 本機執行</text>
          <text x="44" y="279" fill="rgba(125,211,252,0.4)" fontSize="7.5">0 雲端請求 · 資料不出機房</text>
        </g>

        {/* 右下:延遲 */}
        <g className="sc-rise" style={d(1450)} fontFamily="var(--font-mono), monospace">
          <rect x="452" y="252" width="172" height="34" rx="6"
            fill="rgba(6,10,16,0.7)" stroke="rgba(167,139,250,0.2)" />
          <text x="464" y="266" fill="rgba(186,230,253,0.45)" fontSize="8">LATENCY</text>
          <text x="612" y="267" textAnchor="end" fill="#c4b5fd" fontSize="12">42 ms</text>
          <text x="464" y="279" fill="rgba(186,230,253,0.45)" fontSize="8">TOKENS/s</text>
          <text x="612" y="280" textAnchor="end" fill="#c4b5fd" fontSize="10">87</text>
        </g>
      </svg>
    </Scene>
  );
}
