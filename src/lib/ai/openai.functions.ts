import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkConfiguredModels, pingTextModel } from "./openai.server";

// Truthful AI connection check for the dev page: confirms the OpenAI key
// works, lists which configured model IDs the account can see, and makes one
// tiny live text call. Reports failures verbatim — never faked.
export const checkAiConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const models = await checkConfiguredModels();
    if (!models.ok) return { ok: false as const, stage: "key", error: models.error };
    const ping = await pingTextModel();
    return {
      ok: ping.ok,
      stage: ping.ok ? ("done" as const) : ("text" as const),
      models: models.models,
      reply: ping.reply,
      error: ping.error,
    };
  });

// Mints a short-lived Realtime client secret for the browser. The real API
// key never leaves the server; the browser only gets a token valid ~1 minute.
export const createVoiceSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { AI_MODELS, VOICE_CAST } = await import("./config");
    const key = process.env["OPENAI_API_KEY"];
    if (!key) return { ok: false as const, error: "OPENAI_API_KEY is not configured" };
    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        expires_after: { anchor: "created_at", seconds: 60 },
        session: {
          type: "realtime",
          model: AI_MODELS.realtime,
          instructions: "This is a connection check. Say one short friendly sentence in simple Mandarin: 你好！",
          audio: { output: { voice: VOICE_CAST.hostMouse } },
        },
      }),
    });
    const j: any = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false as const, error: `${r.status}: ${j?.error?.message ?? "unknown error"}` };
    return { ok: true as const, value: j.value as string, expiresAt: j.expires_at as number, model: AI_MODELS.realtime };
  });
