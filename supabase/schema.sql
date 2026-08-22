-- 使用方式:在 Supabase 後台 → SQL Editor 貼上整份執行一次即可
-- 建立三張表:作品集 projects、部落格 posts、客服紀錄 chat_logs

-- ===== 作品集 =====
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  description text,
  image_url text,
  tags text[] default '{}',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ===== 部落格 =====
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null,
  published boolean default false,
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ===== AI 客服對話紀錄 =====
create table if not exists chat_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  user_message text not null,
  assistant_message text not null,
  created_at timestamptz default now()
);

-- ===== Row Level Security =====
alter table projects enable row level security;
alter table posts enable row level security;
alter table chat_logs enable row level security;

-- 訪客(anon)只能讀作品集與已發佈文章
create policy "public read projects" on projects
  for select using (true);

create policy "public read published posts" on posts
  for select using (published = true);

-- chat_logs 不開放任何 anon 存取(只有 service role 從伺服器端寫入)

-- ===== 範例資料 =====
insert into projects (title, summary, description, tags, sort_order) values
  ('機械手臂 Android 開發',
   '以 Android App 整合 Dobot 機械手臂與 PLC,實現點位教導、程式編輯與 I/O 即時監控。',
   '透過 TCP API 直接控制六軸機械手臂,搭配 PLC 完成周邊氣動元件與感測器整合。App 提供 Jog 操作、點位管理、程式試跑與 DO/DI 狀態回饋。',
   array['Android','機械手臂','PLC','TCP/IP'], 1),
  ('AI 智慧盒',
   '結合 AI 模型與嵌入式硬體的智慧裝置,細節與圖片即將更新。',
   null,
   array['AI','嵌入式'], 2);

insert into posts (slug, title, excerpt, content, published) values
  ('hello-world', '網站上線了',
   '個人網站正式上線,這裡會分享 AI 整合與機電開發的實戰筆記。',
   E'# 網站上線了\n\n個人網站正式上線!\n\n這裡會分享:\n\n- 機械手臂與 PLC 整合開發\n- Android 工業應用\n- AI 模型落地經驗\n\n敬請期待。', true);
