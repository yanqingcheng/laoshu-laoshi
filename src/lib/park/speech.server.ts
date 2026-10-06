import { createHash, randomUUID } from "node:crypto";
import { toFile } from "openai";
import { AI_MODELS, VOICE_CAST } from "@/lib/ai/config";
import { getOpenAI } from "@/lib/ai/openai.server";
import { normalizeSpeechText } from "./drills";

const delivery = "Speak only the supplied Chinese text in clear, natural standard Mandarin. Read every syllable exactly once. Use natural tone sandhi. Do not explain, translate, add greetings, or speak the instructions. Use an unhurried teaching pace.";
const profile = { role: "narrator", model: AI_MODELS.tts, voice: VOICE_CAST.narrator, delivery, approval: "provisional" };
type Attempt = { runId: string; attempt: number; startedAt: string; durationMs: number; ttsModel: string; sttModel: string; voice: string; ttsRequestId: string | null; sttRequestId: string | null; ttsUsage: unknown; sttUsage: unknown; cost: null; check: string; audioHash: string | null };
type Clip = { dataUrl: string; attempts: Attempt[]; model: string; voice: string; listeningReviewed: false };
const cache = new Map<string, Clip>();
const pending = new Map<string, Promise<Clip>>();
const limits = new Map<string, { start: number; count: number }>();
let modelsCheckedAt = 0;

export async function checkedDrillSpeech(userId: string, text: string): Promise<Clip> {
  if (!text || text.length > 160) throw new Error("This practice clip is too long.");
  const client = getOpenAI().withOptions({ maxRetries: 0, timeout: 25_000 });
  const key = createHash("sha256").update(JSON.stringify({ profile, text })).digest("hex");
  const hit = cache.get(key);
  if (hit) return hit;
  const active = pending.get(key);
  if (active) return active;
  const now = Date.now();
  // Per-process guard. Production-wide quotas must also be set at the provider.
  for (const [id, value] of limits) if (now - value.start > 3_600_000) limits.delete(id);
  const allowance = limits.get(userId) ?? { start: now, count: 0 };
  if (allowance.count >= 30) throw new Error("The audio preparation limit has been reached. Try a reading drill and return later.");
  allowance.count++;
  limits.set(userId, allowance);
  const work = (async () => {
    const signal = AbortSignal.timeout(55_000);
    if (Date.now() - modelsCheckedAt > 300_000) {
      const models = await client.models.list({ signal });
      for (const model of [AI_MODELS.tts, AI_MODELS.stt]) if (!models.data.some((m) => m.id === model)) throw new Error("The configured speech models are unavailable. Try a reading drill for now.");
      modelsCheckedAt = Date.now();
    }
    const attempts: Attempt[] = [];
    const started = Date.now();
    for (let attempt = 1; attempt <= 2; attempt++) {
      if (Date.now() - started > 55_000) break;
      const began = Date.now();
      const record: Attempt = { runId: randomUUID(), attempt, startedAt: new Date().toISOString(), durationMs: 0, ttsModel: AI_MODELS.tts, sttModel: AI_MODELS.stt, voice: profile.voice, ttsRequestId: null, sttRequestId: null, ttsUsage: null, sttUsage: null, cost: null, check: "failed", audioHash: null };
      try {
        const speech = await client.audio.speech.create({ model: profile.model, voice: profile.voice, input: text, instructions: delivery, response_format: "wav" }, { signal });
        record.ttsRequestId = speech.headers.get("x-request-id");
        const bytes = Buffer.from(await speech.arrayBuffer());
        if (bytes.length < 100 || bytes.length > 4_000_000 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WAVE") throw new Error("Speech returned an invalid audio file.");
        record.audioHash = createHash("sha256").update(bytes).digest("hex");
        // No source-text hint: it would bias this independent completeness check.
        const transcribed = await client.audio.transcriptions.create({ model: AI_MODELS.stt, file: await toFile(bytes, "practice.wav", { type: "audio/wav" }), language: "zh", response_format: "json" }, { signal }).withResponse();
        record.sttRequestId = transcribed.request_id;
        record.sttUsage = (transcribed.data as unknown as { usage?: unknown }).usage ?? null;
        const matches = normalizeSpeechText(transcribed.data.text) === normalizeSpeechText(text);
        record.check = matches ? "transcript-matches-source; pronunciation-not-human-reviewed" : "transcript-mismatch-or-uncertain-homophone";
        record.durationMs = Date.now() - began;
        attempts.push(record);
        console.info("drill-speech-attempt", JSON.stringify(record));
        if (matches) {
          const clip: Clip = { dataUrl: `data:audio/wav;base64,${bytes.toString("base64")}`, attempts, model: profile.model, voice: profile.voice, listeningReviewed: false };
          if (cache.size >= 100) cache.delete(cache.keys().next().value!);
          cache.set(key, clip);
          return clip;
        }
      } catch (error) {
        record.durationMs = Date.now() - began;
        if (!attempts.includes(record)) attempts.push(record);
        console.info("drill-speech-attempt", JSON.stringify(record));
        // Network/provider failures remain failures; retry is user controlled.
        throw new Error("Audio could not be prepared. Please retry, or choose a reading drill.", { cause: error });
      }
    }
    throw new Error("We could not verify the whole recording, so it has been withheld. Try another word or a reading drill.");
  })();
  pending.set(key, work);
  try { return await work; } finally { pending.delete(key); }
}
