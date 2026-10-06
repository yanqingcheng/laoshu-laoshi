import { getOpenAI } from "./openai.server";
import { AI_MODELS } from "./config";

// One place that sends a JSON prompt to the text/vision model and records the
// attempt (tokens, elapsed, success) in model_calls. Missing usage stays null
// (unknown), never zero. Cost is left null until per-model rates are confirmed.

export interface JsonCallOpts {
  learnerId: string;
  jobId?: string | null;
  stage: string;
  prompt: string;
  images?: string[]; // https or data: URLs, in order
  attempt?: number;
}

async function logCall(row: Record<string, unknown>) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("model_calls").insert(row as never);
  } catch {
    /* logging must never break the job */
  }
}

export async function jsonCall<T = unknown>(o: JsonCallOpts): Promise<T> {
  const client = getOpenAI();
  const t0 = Date.now();
  const content: unknown[] = [{ type: "input_text", text: o.prompt }];
  for (const url of o.images ?? []) content.push({ type: "input_image", image_url: url, detail: "high" });
  let usage: { input_tokens?: number; output_tokens?: number; input_tokens_details?: { cached_tokens?: number } } | undefined;
  try {
    const res = await client.responses.create({
      model: AI_MODELS.text,
      input: [{ role: "user", content }] as never,
      reasoning: { effort: "low" },
      text: { format: { type: "json_object" } },
      store: false,
    } as never);
    usage = (res as { usage?: typeof usage }).usage;
    const text = (res as { output_text?: string }).output_text ?? "";
    const parsed = JSON.parse(text) as T;
    await logCall({
      learner_id: o.learnerId, job_id: o.jobId ?? null, stage: o.stage, model: AI_MODELS.text, attempt: o.attempt ?? 1,
      input_tokens: usage?.input_tokens ?? null, output_tokens: usage?.output_tokens ?? null,
      cached_tokens: usage?.input_tokens_details?.cached_tokens ?? null, cost_usd: null, elapsed_ms: Date.now() - t0, ok: true,
    });
    return parsed;
  } catch (e) {
    await logCall({
      learner_id: o.learnerId, job_id: o.jobId ?? null, stage: o.stage, model: AI_MODELS.text, attempt: o.attempt ?? 1,
      input_tokens: usage?.input_tokens ?? null, output_tokens: usage?.output_tokens ?? null, cached_tokens: null,
      cost_usd: null, elapsed_ms: Date.now() - t0, ok: false, error: (e as Error).message.slice(0, 500),
    });
    throw e;
  }
}

/** Retry once (one repair attempt per failing stage), then give up truthfully. */
export async function jsonCallOnceRepair<T>(o: JsonCallOpts, valid: (x: T) => string | null): Promise<T> {
  let last = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const out = await jsonCall<T>({ ...o, attempt, prompt: attempt === 1 ? o.prompt : `${o.prompt}\n\nYour previous answer was rejected: ${last}. Return a corrected JSON object.` });
      const bad = valid(out);
      if (!bad) return out;
      last = bad;
    } catch (e) {
      last = (e as Error).message;
    }
  }
  throw new Error(`${o.stage} failed after one repair: ${last}`);
}
