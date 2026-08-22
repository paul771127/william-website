export type Project = {
  id: string;
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
    id: "robot-arm-android",
    title: "機械手臂 Android 開發",
    summary:
      "以 Android App 整合 Dobot 機械手臂與 PLC,實現點位教導、程式編輯與 I/O 即時監控。",
    description:
      "透過 TCP API 直接控制六軸機械手臂,搭配 PLC 完成周邊氣動元件與感測器整合。App 提供 Jog 操作、點位管理、程式試跑與 DO/DI 狀態回饋。",
    image_url: null,
    tags: ["Android", "機械手臂", "PLC", "TCP/IP"],
    sort_order: 1,
  },
  {
    id: "ai-smart-box",
    title: "AI 智慧盒",
    summary: "結合 AI 模型與嵌入式硬體的智慧裝置,細節與圖片即將更新。",
    description: null,
    image_url: null,
    tags: ["AI", "嵌入式"],
    sort_order: 2,
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
