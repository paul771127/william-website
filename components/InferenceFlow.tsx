"use client";

import Scene from "@/components/Scene";

// 四層網路:輸入 → 兩層隱藏 → 輸出
const LAYERS = [
  { x: 96, n: 4, label: "輸入" },
  { x: 236, n: 6, label: "隱藏層" },
  { x: 376, n: 6, label: "隱藏層" },
  { x: 508, n: 3, label: "輸出" },
];
const TOKENS = ["偵測到", "第 3 軸", "扭力異常", "→", "建議", "降速 15%"];

function ys(n: number) {
  const gap = 34;
  const top = 150 - ((n - 1) * gap) / 2;
  return Array.from({ length: n }, (_, i) => top + i * gap);
}

export default function InferenceFlow() {
  const nodes = LAYERS.map((l) => ({ ...l, ys: ys(l.n) }));

  return (
    <Scene label="地端 AI 推論流程:輸入經過網路層層傳遞後產生回應">
      <svg viewBox="0 0 640 300" className="w-full h-auto" role="img">
        {/* 突觸:訊號沿著連線往右流動 */}
        <g>
          {nodes.slice(0, -1).map((l, li) =>
            l.ys.map((y1, i) =>
              nodes[li + 1].ys.map((y2, j) => (
                <line
                  key={`${li}-${i}-${j}`}
                  className="ai-syn sc-fade"
                  style={{
                    animationDelay: `${300 + li * 180}ms, ${((i + j) % 6) * 260}ms`,
                    animationDuration: "520ms, 1900ms",
                  }}
                  x1={l.x} y1={y1} x2={nodes[li + 1].x} y2={y2}
                  stroke={li === 2 ? "rgba(167,139,250,0.5)" : "rgba(56,189,248,0.45)"}
                  strokeWidth="1"
                />
              ))
            )
          )}
        </g>

        {/* 節點 */}
        {nodes.map((l, li) => (
          <g key={li}>
            {l.ys.map((y, i) => (
              <circle
                key={i}
                className="ai-node sc-pop"
                style={{ animationDelay: `${200 + li * 160 + i * 60}ms, ${(li * 300 + i * 160)}ms` }}
                cx={l.x} cy={y} r="6"
                fill={li === 3 ? "#a78bfa" : "#38bdf8"}
              />
            ))}
            <text className="sc-fade" style={{ animationDelay: `${500 + li * 160}ms` }}
              x={l.x} y="272" textAnchor="middle" fill="rgba(125,211,252,0.5)" fontSize="10"
              fontFamily="var(--font-mono), monospace">{l.label}</text>
          </g>
        ))}

        {/* 輸出的文字:逐詞吐出來,像串流生成 */}
        <g className="sc-fade" style={{ animationDelay: "1200ms" }}>
          <rect x="16" y="16" width="608" height="40" rx="8"
            fill="rgba(7,11,17,0.8)" stroke="rgba(167,139,250,0.3)" />
          <text x="28" y="34" fill="rgba(167,139,250,0.7)" fontSize="9"
            fontFamily="var(--font-mono), monospace" letterSpacing="2">LOCAL INFERENCE · 離線執行</text>
          <g fontFamily="var(--font-mono), monospace" fontSize="12">
            {TOKENS.map((t, i) => (
              <text key={i} className="ai-token"
                style={{ animationDelay: `${1600 + i * 260}ms` }}
                x={28 + TOKENS.slice(0, i).join(" ").length * 7.4} y="50"
                fill={i >= 4 ? "#c4b5fd" : "#bae6fd"}>{t}</text>
            ))}
            <text className="ai-caret" x={28 + TOKENS.join(" ").length * 7.4} y="50" fill="#a78bfa">▌</text>
          </g>
        </g>

        {/* 右下角執行資訊 */}
        <g className="sc-rise" style={{ animationDelay: "1400ms" }}
          fontFamily="var(--font-mono), monospace" fontSize="10">
          <text x="470" y="290" fill="rgba(186,230,253,0.45)">GPU 本機 · 0 雲端請求</text>
        </g>
      </svg>
    </Scene>
  );
}
