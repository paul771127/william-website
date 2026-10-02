/**
 * 五個面板共用的 SVG 資源:漸層、發光、箭頭、網點、剖面線。
 * 整頁只渲染一次,各面板用 id 引用,避免五份重複定義。
 */
export default function SvgDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute pointer-events-none">
      <defs>
        {/* 金屬件:由上而下的受光 */}
        <linearGradient id="gMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.30" />
          <stop offset="45%" stopColor="#0ea5e9" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.22" />
        </linearGradient>
        {/* 強調件 */}
        <linearGradient id="gViolet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.18" />
        </linearGradient>
        {/* 螢幕由中心往外微微變暗 */}
        <radialGradient id="gScreen" cx="50%" cy="42%" r="78%">
          <stop offset="0%" stopColor="#0b1724" />
          <stop offset="100%" stopColor="#05080d" />
        </radialGradient>
        {/* 焦點光暈 */}
        <radialGradient id="gHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>

        {/* 柔光:給線條一點輝度,不會糊掉 */}
        <filter id="fGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="fGlowSoft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 尺寸線箭頭 */}
        <marker id="mArrow" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1 L10 5 L0 9 Z" fill="rgba(125,211,252,0.85)" />
        </marker>

        {/* 細網點底:比格線更乾淨 */}
        <pattern id="pDots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="rgba(125,211,252,0.16)" />
        </pattern>
        {/* 主格線(每 80) */}
        <pattern id="pGrid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80 0 L0 0 0 80" fill="none" stroke="rgba(125,211,252,0.07)" strokeWidth="1" />
        </pattern>
        {/* 45° 剖面線 */}
        <pattern id="pHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(125,211,252,0.42)" strokeWidth="1" />
        </pattern>
        {/* 滾花/網目,給夾爪與握持面 */}
        <pattern id="pKnurl" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="rgba(186,230,253,0.5)" strokeWidth="0.7" />
          <line x1="0" y1="0" x2="5" y2="0" stroke="rgba(186,230,253,0.5)" strokeWidth="0.7" />
        </pattern>
      </defs>
    </svg>
  );
}
