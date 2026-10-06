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
