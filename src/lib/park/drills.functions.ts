import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { sentenceEligible, type DrillRound, type DrillWord } from "./drills";

export const getDrillMaterial = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getLearner, queryWords } = await import("@/lib/memory/core.server");
    const { ref } = await import("@/lib/course.server");
    const learner = await getLearner(context.supabase, context.userId);
    const repertoire = await queryWords(context.supabase, learner, { status: "repertoire" });
    const words: DrillWord[] = repertoire.filter((w) => !!w.pinyin).map((w) => ({ id: w.id, hanzi: w.hanzi, pinyin: w.pinyin, meaning: w.meaning, altReadings: w.alt_readings ?? [] }));
    const reference = await ref();
    const allowed = new Set(words.map((w) => w.id));
    const sentences: DrillRound[] = [];
    for (const word of words) {
      for (const target of reference.targetsByWord.get(word.id) ?? []) {
        const s = reference.sentences.get(target.sentence_id);
        if (!s || !sentenceEligible(s.tokens, allowed) || !s.tokens.some((t) => t.id === word.id)) continue;
        sentences.push({ id: `${s.id}:${word.id}`, sentenceId: s.id, word, tokens: s.tokens });
        break;
      }
    }
    return { words, sentences, speechConfigured: !!process.env["OPENAI_API_KEY"] };
  });

/** IDs only: clients cannot turn this endpoint into an arbitrary speech service. */
export const getDrillAudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ wordId: z.string().uuid(), sentenceId: z.string().uuid().optional() }))
  .handler(async ({ context, data }) => {
    const { getLearner, queryWords } = await import("@/lib/memory/core.server");
    const learner = await getLearner(context.supabase, context.userId);
    const repertoire = await queryWords(context.supabase, learner, { status: "repertoire" });
    const word = repertoire.find((w) => w.id === data.wordId);
    if (!word) throw new Error("This word is not in your learned vocabulary yet.");
    let text = word.hanzi;
    if (data.sentenceId) {
      const { ref } = await import("@/lib/course.server");
      const reference = await ref();
      const sentence = reference.sentences.get(data.sentenceId);
      const isTarget = (reference.targetsByWord.get(word.id) ?? []).some((t) => t.sentence_id === data.sentenceId);
      if (!sentence || !isTarget || !sentenceEligible(sentence.tokens, new Set(repertoire.map((w) => w.id)))) throw new Error("This sentence is not available for your vocabulary yet.");
      text = sentence.tokens.map((t) => t.w).join("");
    }
    const { checkedDrillSpeech } = await import("./speech.server");
    const clip = await checkedDrillSpeech(context.userId, text);
    return { dataUrl: clip.dataUrl, model: clip.model, voice: clip.voice, listeningReviewed: clip.listeningReviewed };
  });
