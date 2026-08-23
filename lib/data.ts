export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  image_url: string | null;
  tags: string[];
  sort_order: number;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  published_at: string;
};

// Supabase 尚未設定或資料表為空時的預設內容
export const fallbackProjects: Project[] = [
  {
    id: "usv-navigation",
    slug: "usv-navigation",
    title: "海上無人船控制韌體與地面導航軟體",
    summary:
      "無人船控制韌體與地面站導航軟體開發,實現航點任務規劃、自動航行與即時遙測。",
    description:
      "負責無人船核心控制韌體撰寫,整合 GPS 與電子羅盤等感測器,實現航向控制與自動航行。\n\n地面站導航軟體提供航點規劃、任務下載、即時遙測監控與手動/自動模式切換,透過無線資料鏈與船體雙向通訊。",
    image_url: null,
    tags: ["韌體", "無人載具", "導航", "地面站"],
    sort_order: 1,
  },
  {
    id: "robot-arm-android",
    slug: "robot-arm-android",
    title: "機械手臂 Android 開發",
    summary:
      "以 Android App 整合 Dobot 機械手臂與 PLC,實現點位教導、程式編輯與 I/O 即時監控。",
    description:
      "透過 TCP API 直接控制六軸機械手臂,搭配 PLC 完成周邊氣動元件與感測器整合。\n\nApp 提供 Jog 操作、點位管理、程式編輯與試跑、DO/DI 狀態即時回饋,讓現場人員不需工程軟體即可完成教導與調機。",
    image_url: null,
    tags: ["Android", "機械手臂", "PLC", "TCP/IP"],
    sort_order: 2,
  },
  {
    id: "multi-tube-injector",
    slug: "multi-tube-injector",
    title: "多管定量注射機機構開發",
    summary:
      "多管路定量注射機構設計,確保各管路出量精準一致,支援快速換線清潔。",
    description:
      "從需求分析、3D 機構設計到樣機驗證,完成多管路同步定量注射機構。\n\n重點在各管路出量一致性與定量精度,並兼顧拆裝清潔與換線效率。",
    image_url: null,
    tags: ["機構設計", "定量注射", "自動化設備"],
    sort_order: 3,
  },
  {
    id: "hydraulic-press",
    slug: "hydraulic-press",
    title: "油壓壓底機機構開發",
    summary: "油壓壓底機整機機構設計,含模具定位、行程控制與安全防護。",
    description:
      "完成油壓壓底機的整機機構開發:油壓缸選型與行程規劃、模具快速定位機構、機台剛性結構設計。\n\n並導入安全防護設計,兼顧產能與操作安全。",
    image_url: null,
    tags: ["機構設計", "油壓", "產線設備"],
    sort_order: 4,
  },
  {
    id: "ai-smart-box",
    slug: "ai-smart-box",
    title: "AI 互動智慧盒",
    summary: "結合地端 AI 模型與感測硬體的互動裝置,離線也能對話互動。",
    description:
      "整合地端大型語言模型與語音、感測硬體的互動裝置,不依賴雲端服務即可對話與互動。\n\n涵蓋硬體選型、系統整合與應用軟體開發,圖片與更多細節即將更新。",
    image_url: null,
    tags: ["AI", "嵌入式", "地端部署"],
    sort_order: 5,
  },
  {
    id: "local-movie-gen",
    slug: "local-movie-gen",
    title: "地端電影生成工作站",
    summary:
      "本地部署的 AI 影像生成工作站,從劇本、分鏡到影片的離線生成流程。",
    description:
      "建置完全在地端運行的 AI 電影生成工作站:從劇本發想、分鏡、畫面生成到影片合成,全流程離線完成,素材與創作內容不出機房。\n\n涵蓋 GPU 工作站硬體規劃、模型部署與生成流程整合。",
    image_url: null,
    tags: ["AI", "影像生成", "地端部署", "GPU"],
    sort_order: 6,
  },
  {
    id: "local-mv-gen",
    slug: "local-mv-gen",
    title: "地端 MV 生成工作站",
    summary: "音樂 MV 自動生成的地端工作站,整合音樂節拍與 AI 畫面生成。",
    description:
      "在地端工作站上整合音樂分析與 AI 影像生成,依歌曲節拍與歌詞意境自動生成 MV 畫面並完成剪輯合成。\n\n全程離線運行,適合對版權與隱私敏感的創作流程。",
    image_url: null,
    tags: ["AI", "音樂影像", "地端部署"],
    sort_order: 7,
  },
];

export const profile = {
  name: "William",
  title: "機電整合工程師",
  skills: ["AI 整合", "機電整合", "機構設計"],
  intro:
    "專注於 AI 與機電系統的整合應用:從機構設計、PLC 與機械手臂控制,到 Android 應用與 AI 模型落地,打造完整的自動化解決方案。",
  // TODO: 補上實際聯絡方式
  email: "",
  github: "https://github.com/paul771127",
  linkedin: "",
};
