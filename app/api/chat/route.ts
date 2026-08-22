import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { profile, fallbackProjects } from "@/lib/data";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.CHAT_MODEL || "claude-opus-5";
const MAX_TURNS = 20; // 保留最近 20 則訊息,控制成本

const SYSTEM_PROMPT = `你是 William 個人網站的 AI 客服助理,使用繁體中文回答(訪客用其他語言時跟隨對方語言)。

關於 William:
- 職稱:${profile.title}
- 專長:${profile.skills.join("、")}
- 簡介:${profile.intro}
- GitHub:${profile.github}

代表作品:
${fallbackProjects.map((p) => `- ${p.title}:${p.summary}`).join("\n")}

守則:
1. 回答簡潔友善,一般不超過 150 字。
2. 只回答與 William、他的專長、作品、合作洽談相關的問題;無關話題請禮貌婉拒並拉回主題。
3. 不確定的細節(報價、時程、私人資訊)不要編造,請訪客透過聯絡方式與 William 直接聯繫。
4. 訪客表達合作意願時,引導對方留下需求描述並到「聯絡我」區塊取得聯絡方式。`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  let body: { messages?: ChatMessage[]; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "no user message" }, { status: 400 });
  }

  // 未設定 API key 時的降級回覆:網站照常運作,客服回固定訊息
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      reply:
        "AI 客服目前尚未啟用,請透過頁面下方的 GitHub 或聯絡方式與 William 聯繫,謝謝!",
    });
  }

  const client = new Anthropic();

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2048,
      output_config: { effort: "low" },
      // 安全分類器拒答時,同一請求自動改由後備模型完成
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({
        reply: "這個問題我無法回答,請換個方式詢問,或直接與 William 聯繫。",
      });
    }

    const reply = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    // 對話紀錄寫入 Supabase(未設定 service role key 時跳過,失敗不影響回覆)
    const admin = getSupabaseAdmin();
    if (admin) {
      const { error } = await admin.from("chat_logs").insert({
        session_id: body.sessionId ?? null,
        user_message: messages[messages.length - 1].content,
        assistant_message: reply,
      });
      if (error) console.error("chat_logs insert failed:", error.message);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { reply: "目前詢問人數較多,請稍後再試。" },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}:`, error.message);
    } else {
      console.error("chat route error:", error);
    }
    return NextResponse.json(
      { reply: "客服暫時無法回應,請稍後再試,或直接與 William 聯繫。" },
      { status: 500 },
    );
  }
}
