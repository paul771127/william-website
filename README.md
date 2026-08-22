# William 個人網站

Next.js (Vercel) + Supabase 的個人網站:作品集、部落格、AI 客服。

## 本機開發

```powershell
npm install
Copy-Item .env.local.example .env.local   # 填入各項金鑰(可先全空)
npm run dev                                # http://localhost:3000
```

沒填任何金鑰也能跑:作品集顯示內建預設內容、部落格顯示「即將上線」、AI 客服回固定訊息。

## 部署步驟(只需做一次)

### 1. 推上 GitHub

```powershell
# 在 GitHub 網頁上建立新 repo:paul771127/william-website(不要勾任何初始化選項)
git remote add origin https://github.com/paul771127/william-website.git
git push -u origin main
```

### 2. Supabase

1. 到 https://supabase.com → 用 GitHub 登入 → New project(區域選 Tokyo / Northeast Asia)
2. 左側 **SQL Editor** → 貼上 `supabase/schema.sql` 全部內容 → Run
3. 左側 **Project Settings → API**,抄下三個值:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`(保密,只放 Vercel 環境變數)

### 3. Vercel

1. 到 https://vercel.com → 用 GitHub 登入 → Add New → Project → 選 `william-website` repo
2. **Environment Variables** 填入上面三個值,再加:
   - `ANTHROPIC_API_KEY`(見下方 AI 客服)
   - `CHAT_MODEL`(選填,預設 `claude-opus-5`)
3. 按 Deploy,完成後會得到 `https://william-website-xxx.vercel.app`

之後只要 `git push`,Vercel 就會自動重新部署。

### 4. AI 客服(唯一需要付費的部分)

1. 到 https://console.anthropic.com → 註冊 → API Keys → 建立金鑰
2. 需要儲值(最低 USD $5),按用量計費;個人網站客服流量通常每月遠低於 $5
3. 把金鑰填到 Vercel 的 `ANTHROPIC_API_KEY` 環境變數 → Redeploy
4. 想更省:`CHAT_MODEL` 設為 `claude-haiku-4-5`(約為預設模型 1/5 價格)

沒填金鑰時客服會顯示「尚未啟用」的固定回覆,網站其他功能完全正常。

## 更新內容

- **作品集 / 部落格**:直接在 Supabase 後台 **Table Editor** 改 `projects` / `posts` 資料表,不用重新部署(頁面最多 60 秒後更新)
- **個人資料 / 聯絡方式**:改 `lib/data.ts` 的 `profile`,git push 即可
- **客服人設**:改 `app/api/chat/route.ts` 的 `SYSTEM_PROMPT`
- **客服對話紀錄**:Supabase Table Editor → `chat_logs`

## 架構

```
瀏覽器
  ├─ 頁面(Vercel,Next.js App Router,ISR 60s)
  │    ├─ /          首頁(自介、精選作品、聯絡)
  │    ├─ /portfolio 作品集   ← Supabase projects 表
  │    └─ /blog      部落格   ← Supabase posts 表
  └─ AI 客服浮動視窗
       └─ POST /api/chat(Vercel serverless)
            ├─ Claude API(回覆)
            └─ Supabase chat_logs(紀錄,service role)
```
