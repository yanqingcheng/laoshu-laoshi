import OpenAI from "openai";
import { AI_MODELS } from "./config";

// Server-only OpenAI client. The key lives in the OPENAI_API_KEY secret and
// is read inside handlers — never at module scope, never in browser code.

export function getOpenAI(): OpenAI {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

export interface ModelAvailability {
  id: string;
  available: boolean;
}

// Confirm the configured model IDs against the account rather than guessing.
export async function checkConfiguredModels(): Promise<{
  ok: boolean;
  models: ModelAvailability[];
  error?: string;
}> {
  try {
    const client = getOpenAI();
    const wanted = Object.values(AI_MODELS) as string[];
    const available: string[] = [];
    const page = await client.models.list();
    for (const m of page.data) available.push(m.id);
    const models = wanted.map((id) => ({
      id,
      available: available.includes(id),
    }));
    return { ok: true, models };
  } catch (err) {
    return {
      ok: false,
      models: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// Minimal live text call to prove the key works end to end.
export async function pingTextModel(): Promise<{
  ok: boolean;
  reply?: string;
  error?: string;
}> {
  try {
    const client = getOpenAI();
    const res = await client.chat.completions.create({
      model: AI_MODELS.text,
      messages: [
        { role: "user", content: "Reply with exactly: 你好" },
      ],
      max_completion_tokens: 16,
    });
    const reply = res.choices[0]?.message?.content?.trim() ?? "";
    return { ok: true, reply };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
