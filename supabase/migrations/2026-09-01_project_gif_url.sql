-- 專案預覽 GIF:手機點一下卡牌時,上方簡介卡右側顯示的動圖
-- 使用方式:Supabase 後台 → SQL Editor 貼上執行一次
-- 之後把 GIF 上傳到任何可公開存取的網址(例如 Supabase Storage),再 update 對應列即可,如:
--   update projects set gif_url = 'https://.../robot-arm.gif' where slug = 'robot-arm-android';

alter table projects add column if not exists gif_url text;
