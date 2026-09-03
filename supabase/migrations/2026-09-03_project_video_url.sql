-- 專案展示影片:卡牌展開後的詳細介紹頁播放
-- 使用方式:Supabase 後台 → SQL Editor 貼上執行一次
-- 之後填入網址即可,兩種都支援:
--   1) mp4 直連(建議放 Supabase Storage):
--      update projects set video_url = 'https://.../demo.mp4' where slug = 'robot-arm-android';
--   2) YouTube / Vimeo 的「嵌入」網址:
--      update projects set video_url = 'https://www.youtube.com/embed/XXXXXXXXXXX' where slug = 'ai-smart-box';

alter table projects add column if not exists video_url text;
