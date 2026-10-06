import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function hashStr(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) % 2147483647;
}

async function ctxAll(context: Any) {
  const core = await import("@/lib/memory/core.server");
  const course = await import("@/lib/course.server");
  const learner = await core.getLearner(context.supabase, context.userId);
  return { core, course, learner, sb: context.supabase as Any };
}

async function repertoireSets(sb: Any, learnerId: string) {
  const rows: Any[] = [];
  for (let f = 0; ; f += 1000) {
    const { data, error } = await sb.from("learner_words").select("word_id,status").eq("learner_id", learnerId).range(f, f + 999);
    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return {
    repertoire: new Set<string>(rows.filter((r) => r.status === "repertoire").map((r) => r.word_id)),
    queued: new Set<string>(rows.filter((r) => r.status === "queued").map((r) => r.word_id)),
  };
}

function wordView(w: Any) {
  return { id: w.id, hanzi: w.hanzi, pinyin: w.pinyin, meaning: w.meaning, accepted: w.accepted ?? [], altReadings: w.alt_readings ?? [], selfScored: w.self_scored };
}

/** Substitute {USER_NAME}; return null if sentence needs a name the learner lacks. */
function personalise(tokens: Any[], learner: Any) {
  if (!tokens.some((t) => t.w === "{USER_NAME}")) return tokens;
  if (!learner.chinese_name) return null;
  return tokens.map((t) => (t.w === "{USER_NAME}" ? { w: learner.chinese_name, name: true, p: learner.chinese_name_pinyin ?? undefined } : t));
}

function sentenceAllowed(s: Any, targetId: string, allowed: Set<string>, learner: Any) {
  if (s.needs_user_name && !learner.chinese_name) return false;
  return s.tokens.every((t: Any) => t.punct || t.name || t.w === "{USER_NAME}" || t.id === targetId || (t.id && allowed.has(t.id)));
}

function lexiconFor(tokensList: Any[][], ref: Any, rep: Set<string>, queued: Set<string>) {
  const lex: Record<string, Any> = {};
  for (const toks of tokensList)
    for (const t of toks)
      if (t.id && !lex[t.id]) {
        const w = ref.words.get(t.id);
        if (w) lex[t.id] = { hanzi: w.hanzi, pinyin: w.pinyin, meaning: w.meaning, known: rep.has(t.id) || queued.has(t.id) };
      }
  return lex;
}

// ------------------------------------------------------------------ bootstrap
export const bootstrap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { timezone?: string }) => d)
  .handler(async ({ context, data }) => {
    const { core, course, learner, sb } = await ctxAll(context);
    if (data.timezone && learner.timezone === "UTC" && data.timezone !== "UTC") {
      await sb.from("learners").update({ timezone: data.timezone }).eq("id", learner.id);
      learner.timezone = data.timezone;
    }
    let load: Any;
    try {
      load = await course.ensureCourseLoaded();
    } catch (e) {
      return { learner, courseError: (e as Error).message, counts: null, expected: course.EXPECTED };
    }
    void core;
    return { learner, courseError: null, counts: load.counts, loadedNow: load.loaded, expected: course.EXPECTED };
  });

// ------------------------------------------------------------------ home
export const homeSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { core, course, learner, sb } = await ctxAll(context);
    const ref = await course.ref();
    const { repertoire, queued } = await repertoireSets(sb, learner.id);
    const { data: cards, error } = await sb.from("cards").select("word_id,skill,due").eq("learner_id", learner.id);
    if (error) throw new Error(error.message);
    const due = { recognise: 0, produce: 0 };
    for (const c of cards ?? []) if (repertoire.has(c.word_id) && core.isDue(new Date(c.due), learner)) due[c.skill as "recognise" | "produce"]++;
    const lessons = ref.courseLessons.map((l: Any) => ({
      id: l.id, ord: l.ord, title: l.title, total: l.word_ids.length,
      learned: l.word_ids.filter((id: string) => repertoire.has(id)).length,
    }));
    return { learner, due, repertoireCount: repertoire.size, queuedCount: queued.size, lessons };
  });

// ------------------------------------------------------------------ reviews
type Dir = "recognise" | "produce";

async function buildCardViews(items: Any[], ref: Any, learner: Any, rep: Set<string>, queued: Set<string>) {
  return items.map((it: Any, index: number) => {
    const w = ref.words.get(it.wordId);
    let sentence = null;
    if (it.sentenceId) {
      const s = ref.sentences.get(it.sentenceId);
      const toks = s && personalise(s.tokens, learner);
      if (s && toks) {
        const tg = (ref.targetsByWord.get(it.wordId) ?? []).find((t: Any) => t.sentence_id === it.sentenceId);
        const english = s.needs_user_name ? s.english.replaceAll("{USER_NAME}", learner.display_name) : s.english;
        sentence = { tokens: toks, english, gap: tg?.gap ?? null, answers: tg?.answers ?? [] };
      }
    }
    const synonyms = (w.synonyms ?? []).map((h: string) => ref.wordsByHanzi.get(h)?.[0]?.pinyin).filter(Boolean);
    return { index, wordId: it.wordId, skill: it.skill, word: { ...wordView(w), synonymReadings: synonyms }, sentence };
  }).map((v: Any) => ({ ...v, lexicon: lexiconFor(v.sentence ? [v.sentence.tokens] : [], ref, rep, queued) }));
}

export const getReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { direction: Dir; more?: boolean }) => z.object({ direction: z.enum(["recognise", "produce"]), more: z.boolean().optional() }).parse(d))
  .handler(async ({ context, data }) => {
    const { core, course, learner, sb } = await ctxAll(context);
    const time = await import("@/lib/time");
    const tz = time.safeTz(learner.timezone);
    const day = time.localDay(new Date(), tz);
    const ref = await course.ref();
    const { repertoire, queued } = await repertoireSets(sb, learner.id);
    let { data: sess } = await sb.from("review_sessions").select("*").eq("learner_id", learner.id).eq("direction", data.direction).eq("day", day).maybeSingle();
    const finished = sess && sess.items.queue.length === 0 && sess.items.missed.length === 0;
    if (!sess || (data.more && finished)) {
      const { data: cards, error } = await sb.from("cards").select("id,word_id,due").eq("learner_id", learner.id).eq("skill", data.direction);
      if (error) throw new Error(error.message);
      const already = new Set<string>(sess ? sess.items.cards.map((c: Any) => c.wordId) : []);
      const dueCards = (cards ?? []).filter((c: Any) => repertoire.has(c.word_id) && core.isDue(new Date(c.due), learner) && !(data.more && already.has(c.word_id) && false));
      const seed = sess ? (sess.seed + 1) % 2147483647 : hashStr(learner.id + day + data.direction);
      const r = rng(seed);
      const byDay = new Map<string, Any[]>();
      for (const c of dueCards) {
        const d = time.localDay(new Date(c.due), tz);
        byDay.set(d, [...(byDay.get(d) ?? []), c]);
      }
      const ordered = [...byDay.keys()].sort().flatMap((d) => shuffle(byDay.get(d)!, r));
      const n = data.direction === "recognise" ? learner.daily_recognise : learner.daily_produce;
      const chosen = ordered.slice(0, n).map((c: Any) => {
        const cands = (ref.targetsByWord.get(c.word_id) ?? [])
          .map((t: Any) => ref.sentences.get(t.sentence_id))
          .filter((s: Any) => s && sentenceAllowed(s, c.word_id, repertoire, learner));
        const s = cands.length ? cands[Math.floor(r() * cands.length)] : null;
        return { cardId: c.id, wordId: c.word_id, skill: data.direction, sentenceId: s?.id ?? null };
      });
      const items = { cards: chosen, queue: chosen.map((_: Any, i: number) => i), missed: [] as number[] };
      if (sess) {
        const up = await sb.from("review_sessions").update({ seed, items, position: 0, round: 1, grades: [] }).eq("id", sess.id).select("*").single();
        if (up.error) throw new Error(up.error.message);
        sess = up.data;
      } else {
        const ins = await sb.from("review_sessions").insert({ learner_id: learner.id, direction: data.direction, day, seed, items }).select("*").single();
        if (ins.error) {
          const again = await sb.from("review_sessions").select("*").eq("learner_id", learner.id).eq("direction", data.direction).eq("day", day).single();
          if (again.error) throw new Error(ins.error.message);
          sess = again.data;
        } else sess = ins.data;
      }
    }
    const views = await buildCardViews(sess.items.cards, ref, learner, repertoire, queued);
    const { data: cards2 } = await sb.from("cards").select("word_id,due").eq("learner_id", learner.id).eq("skill", data.direction);
    const inSession = new Set(sess.items.cards.map((c: Any) => c.wordId));
    const stillDue = (cards2 ?? []).filter((c: Any) => repertoire.has(c.word_id) && core.isDue(new Date(c.due), learner) && !inSession.has(c.word_id)).length;
    return { session: { id: sess.id, round: sess.round, queue: sess.items.queue, missed: sess.items.missed, grades: sess.grades }, cards: views, stillDue, pinyinOn: learner.pinyin_on };
  });

export const gradeReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) =>
    z.object({ sessionId: z.string().uuid(), index: z.number().int(), outcome: z.enum(["fail", "hard", "good", "easy"]), requestId: z.string().min(8).max(80), missed: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { core, learner, sb } = await ctxAll(context);
    const { data: sess, error } = await sb.from("review_sessions").select("*").eq("id", data.sessionId).single();
    if (error) throw new Error(error.message);
    if ((sess.grades as Any[]).some((g) => g.requestId === data.requestId))
      return { round: sess.round, queue: sess.items.queue, missed: sess.items.missed, grades: sess.grades };
    if (sess.items.queue[0] !== data.index) throw new Error("This card is no longer next — reload the review.");
    const card = sess.items.cards[data.index];
    await core.submitEvidence(sb, learner, { wordId: card.wordId, skill: card.skill, outcome: data.outcome, requestId: data.requestId, activity: "review" });
    const prev = { items: sess.items, round: sess.round };
    const items = { ...sess.items, queue: sess.items.queue.slice(1), missed: [...sess.items.missed] };
    if (data.missed) items.missed.push(data.index);
    let round = sess.round;
    if (items.queue.length === 0 && items.missed.length) {
      items.queue = items.missed;
      items.missed = [];
      round++;
    }
    const grades = [...sess.grades, { requestId: data.requestId, index: data.index, round: sess.round, outcome: data.outcome, missed: data.missed, prev }];
    const up = await sb.from("review_sessions").update({ items, round, grades }).eq("id", sess.id);
    if (up.error) throw new Error(up.error.message);
    return { round, queue: items.queue, missed: items.missed, grades };
  });

export const undoReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { sessionId: string }) => z.object({ sessionId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { core, learner, sb } = await ctxAll(context);
    const { data: sess, error } = await sb.from("review_sessions").select("*").eq("id", data.sessionId).single();
    if (error) throw new Error(error.message);
    const last = (sess.grades as Any[]).at(-1);
    if (!last) return { ok: false };
    const u = await core.undoLast(sb, learner);
    if (!u.undone || u.requestId !== last.requestId) return { ok: false, reason: "The last grade was not from this review." };
    const grades = sess.grades.slice(0, -1);
    const up = await sb.from("review_sessions").update({ items: last.prev.items, round: last.prev.round, grades }).eq("id", sess.id);
    if (up.error) throw new Error(up.error.message);
    return { ok: true, round: last.prev.round, queue: last.prev.items.queue, missed: last.prev.items.missed, grades };
  });

// ------------------------------------------------------------------ lessons
export const getLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { lessonId: string }) => z.object({ lessonId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { course, learner, sb } = await ctxAll(context);
    let ref = await course.ref();
    const { repertoire, queued } = await repertoireSets(sb, learner.id);
    let lesson: Any = ref.courseLessons.find((l: Any) => l.id === data.lessonId);
    let targetsByWord: Map<string, Any[]> = ref.targetsByWord;
    let sentencesById: Map<string, Any> = ref.sentences;
    if (!lesson) {
      // a learner's own book lesson: sentences are learner-owned rows
      const { data: own, error: le } = await sb.from("lessons").select("id,ord,title,word_ids").eq("id", data.lessonId).maybeSingle();
      if (le || !own) throw new Error("Lesson not found");
      lesson = own;
      if (own.word_ids.some((id: string) => !ref.words.has(id))) { course.invalidateRef(); ref = await course.ref(); }
      const { data: ts, error: te } = await sb.from("sentence_targets").select("sentence_id,word_id,gap,answers,sentences!inner(id,tokens,english,needs_user_name,learner_id)").in("word_id", own.word_ids).eq("sentences.learner_id", learner.id);
      if (te) throw new Error(te.message);
      targetsByWord = new Map();
      sentencesById = new Map();
      for (const t of ts ?? []) {
        targetsByWord.set(t.word_id, [...(targetsByWord.get(t.word_id) ?? []), t]);
        sentencesById.set(t.sentence_id, t.sentences);
      }
    }
    const starter = new Set<string>(ref.courseLessons[0]?.word_ids ?? []);
    const allowed = new Set<string>([...repertoire, ...lesson.word_ids, ...starter]);
    const todo = lesson.word_ids.filter((id: string) => !repertoire.has(id));
    const sitting = todo.slice(0, learner.lesson_pace);
    const r = rng(hashStr(lesson.id + learner.id + todo.length));
    const words = sitting.map((id: string) => {
      const w = ref.words.get(id);
      const sents = (targetsByWord.get(id) ?? [])
        .map((t: Any) => ({ t, s: sentencesById.get(t.sentence_id) }))
        .filter((x: Any) => x.s && sentenceAllowed(x.s, id, allowed, learner))
        .map((x: Any) => ({
          id: x.s.id, tokens: personalise(x.s.tokens, learner)!, english: x.s.english.replaceAll("{USER_NAME}", learner.display_name),
          gap: x.t.gap, answers: x.t.answers,
        }));
      return { word: wordView(w), examples: sents.slice(0, 5), sentences: sents };
    });
    const questions = shuffle<Any>(
      words.flatMap((w: Any) => {
        const s1 = w.sentences[0] ?? null;
        const s2 = w.sentences[1] ?? w.sentences[0] ?? null;
        return [
          { key: `${w.word.id}:recognise`, wordId: w.word.id, skill: "recognise", sentence: s1 },
          { key: `${w.word.id}:produce`, wordId: w.word.id, skill: "produce", sentence: s2 },
        ];
      }),
      r,
    );
    const lexicon = lexiconFor(words.flatMap((w: Any) => w.sentences.map((s: Any) => s.tokens)), ref, repertoire, queued);
    return {
      lesson: { id: lesson.id, ord: lesson.ord, title: lesson.title, total: lesson.word_ids.length, remaining: todo.length },
      words: words.map((w: Any) => ({ word: w.word, examples: w.examples })),
      questions,
      lexicon,
      noSentenceWords: words.filter((w: Any) => !w.sentences.length).map((w: Any) => w.word.hanzi),
      pinyinOn: learner.pinyin_on,
    };
  });

export const lessonAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ wordId: z.string().uuid(), skill: z.enum(["recognise", "produce"]), correct: z.boolean(), requestId: z.string().min(8).max(80) }).parse(d))
  .handler(async ({ context, data }) => {
    const { core, learner, sb } = await ctxAll(context);
    return core.submitEvidence(sb, learner, { wordId: data.wordId, skill: data.skill, outcome: data.correct ? "good" : "fail", requestId: data.requestId, activity: "lesson" });
  });

export const declareKnownFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { wordIds: string[] }) => z.object({ wordIds: z.array(z.string().uuid()).max(400) }).parse(d))
  .handler(async ({ context, data }) => {
    const { core, learner, sb } = await ctxAll(context);
    return core.declareKnown(sb, learner, data.wordIds);
  });

// ------------------------------------------------------------------ settings
export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) =>
    z.object({
      display_name: z.string().trim().min(1).max(60).optional(),
      chinese_name: z.string().trim().max(8).nullable().optional(),
      chinese_name_pinyin: z.string().trim().max(40).nullable().optional(),
      about: z.string().max(500).nullable().optional(),
      timezone: z.string().max(60).optional(),
      daily_recognise: z.number().int().min(1).max(200).optional(),
      daily_produce: z.number().int().min(1).max(200).optional(),
      lesson_pace: z.number().int().min(1).max(30).optional(),
      pinyin_on: z.boolean().optional(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { sb, learner } = await ctxAll(context);
    const { error } = await sb.from("learners").update(data).eq("id", learner.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------------------------------------------------------------------ import my words (6.6)
const importSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().optional(),
  vocab: z.array(
    z.object({
      hanzi: z.string().min(1).max(20),
      pinyin: z.string().max(80),
      meaning: z.string().max(500),
      progress: z
        .object({
          recognition: z.object({ due_at: z.string().nullable().optional(), fsrs_state: z.record(z.string(), z.any()) }).nullable().optional(),
          production: z.object({ due_at: z.string().nullable().optional(), fsrs_state: z.record(z.string(), z.any()) }).nullable().optional(),
        })
        .nullable()
        .optional(),
    }),
  ).max(20000),
});

export const importMyWords = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => importSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { core, learner, course } = await ctxAll(context);
    const { markedToNumbered } = await import("@/lib/chinese/pinyin");
    const lastReview = (v: Any) => {
      const ts = [v.progress?.recognition?.fsrs_state?.last_review, v.progress?.production?.fsrs_state?.last_review].filter(Boolean).map((x: string) => Date.parse(x));
      return ts.length ? Math.max(...ts) : -1;
    };
    // dedupe by hanzi, keep most recently reviewed
    const byHanzi = new Map<string, Any>();
    for (const v of data.vocab) {
      const cur = byHanzi.get(v.hanzi);
      if (!cur || lastReview(v) > lastReview(cur)) byHanzi.set(v.hanzi, v);
    }
    const now = new Date();
    const words = [...byHanzi.values()].map((v) => {
      const rec = v.progress?.recognition;
      const pro = v.progress?.production;
      const cards: Any[] = [];
      if (rec || pro) {
        for (const [skill, p] of [["recognise", rec], ["produce", pro]] as const) {
          if (p) cards.push({ skill, state: p.fsrs_state, due: p.due_at ?? p.fsrs_state.due });
          else {
            const d = core.declaredCard(skill, now);
            cards.push({ skill, state: d.state, due: d.due });
          }
        }
      }
      return { hanzi: v.hanzi, pinyin: markedToNumbered(v.pinyin), meaning: v.meaning, origin: "dictionary", cards };
    });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: res, error } = await (supabaseAdmin as Any).rpc("apply_word_import", { uid: learner.id, p: { words } });
    if (error) throw new Error("Import failed, nothing was changed: " + error.message);
    course.invalidateRef();
    return { ...(res as { entered: number; queued: number; skipped: number }), duplicatesInFile: data.vocab.length - byHanzi.size };
  });

// ------------------------------------------------------------------ word card popover: add to my words
export const addToMyWords = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { wordId: string }) => z.object({ wordId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { core, learner, sb } = await ctxAll(context);
    return core.queueWords(sb, learner, [data.wordId]);
  });

// ------------------------------------------------------------------ developer
export const devStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { course, learner, sb } = await ctxAll(context);
    let counts: Any = null;
    let err: string | null = null;
    try {
      counts = await course.courseCounts();
    } catch (e) {
      err = (e as Error).message;
    }
    const { repertoire, queued } = await repertoireSets(sb, learner.id);
    const { count: ev } = await sb.from("evidence").select("id", { count: "exact", head: true }).eq("learner_id", learner.id);
    return { counts, expected: course.EXPECTED, error: err, learner, repertoire: repertoire.size, queued: queued.size, evidence: ev ?? 0 };
  });

export const devSynthetic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { lessons: number }) => z.object({ lessons: z.number().int().min(1).max(26) }).parse(d))
  .handler(async ({ context, data }) => {
    const { core, course, learner, sb } = await ctxAll(context);
    const ref = await course.ref();
    const ids = ref.courseLessons.slice(0, data.lessons).flatMap((l: Any) => l.word_ids);
    await sb.from("learners").update({ is_synthetic: true, display_name: "Synthetic dev learner" }).eq("id", learner.id);
    const r = await core.declareKnown(sb, learner, ids);
    // make some due today so reviews have work
    const { data: cards } = await sb.from("cards").select("id,state").eq("learner_id", learner.id).limit(30);
    const nowIso = new Date().toISOString();
    for (const c of cards ?? []) await sb.from("cards").update({ due: nowIso, state: { ...c.state, due: nowIso } }).eq("id", c.id);
    return r;
  });

export const devReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { learner, sb } = await ctxAll(context);
    for (const t of ["review_sessions", "evidence", "cards", "learner_words", "seen", "transcripts"]) {
      const { error } = await sb.from(t).delete().eq("learner_id", learner.id);
      if (error) throw new Error(`${t}: ${error.message}`);
    }
    await sb.from("learners").update({ is_synthetic: false, display_name: "Learner" }).eq("id", learner.id);
    return { ok: true };
  });
