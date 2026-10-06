// Loads the bundled course idempotently and serves cached reference data.
import course from "@/data/course.json";
import compounds from "@/data/compounds.json";
import type { Token, WordRow } from "@/lib/memory/core.server";

type CourseJson = {
  words: { h: string; p: string; m: string; alt: string[]; ss: boolean; l: number }[];
  lessons: { key: string; ord: number; title: string; words: string[] }[];
  sentences: { k: string; t: { w: string; name?: boolean; punct?: boolean }[]; e: string; u: boolean; tg: [string, string | null, string[]][] }[];
};
const C = course as unknown as CourseJson;
export const EXPECTED = { lessons: C.lessons.length, words: C.words.length, sentences: C.sentences.length, compounds: compounds.transparent.length + compounds.opaque.length };

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabaseAdmin as any;
}

export async function courseCounts() {
  const sb = await admin();
  const [w, s, l, c] = await Promise.all([
    sb.from("words").select("id", { count: "exact", head: true }).eq("origin", "course"),
    sb.from("sentences").select("id", { count: "exact", head: true }).eq("origin", "course"),
    sb.from("lessons").select("id, sources!inner(kind)", { count: "exact", head: true }).eq("sources.kind", "course"),
    sb.from("compounds").select("hanzi", { count: "exact", head: true }),
  ]);
  for (const r of [w, s, l, c]) if (r.error) throw new Error(r.error.message);
  return { words: w.count ?? 0, sentences: s.count ?? 0, lessons: l.count ?? 0, compounds: c.count ?? 0 };
}

/** Idempotent first-run load. Returns real counts; throws on any write error. */
export async function ensureCourseLoaded() {
  const before = await courseCounts();
  if (before.words === EXPECTED.words && before.sentences === EXPECTED.sentences && before.lessons === EXPECTED.lessons && before.compounds === EXPECTED.compounds)
    return { loaded: false, counts: before };
  const sb = await admin();
  // words
  const { data: existing, error: e0 } = await sb.from("words").select("id,hanzi").eq("origin", "course");
  if (e0) throw new Error(e0.message);
  const have = new Set((existing ?? []).map((w: { hanzi: string }) => w.hanzi));
  const missing = C.words.filter((w) => !have.has(w.h)).map((w) => ({
    hanzi: w.h, pinyin: w.p, meaning: w.m, alt_readings: w.alt, self_scored: w.ss, origin: "course", course_lesson: w.l,
  }));
  if (missing.length) {
    const { error } = await sb.from("words").insert(missing);
    if (error) throw new Error("words: " + error.message);
  }
  const { data: all, error: e1 } = await sb.from("words").select("id,hanzi").eq("origin", "course");
  if (e1) throw new Error(e1.message);
  const idOf = new Map<string, string>((all ?? []).map((w: { id: string; hanzi: string }) => [w.hanzi, w.id]));
  // source + lessons
  let { data: src } = await sb.from("sources").select("id").eq("kind", "course").maybeSingle();
  if (!src) {
    const r = await sb.from("sources").insert({ title: "Laoshu HSK 1–2 course", kind: "course", word_ids: [...idOf.values()] }).select("id").single();
    if (r.error) throw new Error("source: " + r.error.message);
    src = r.data;
  }
  const lessonRows = C.lessons.map((l) => ({ source_id: src.id, ord: l.ord, title: l.title, course_key: l.key, word_ids: l.words.map((h) => idOf.get(h)) }));
  const lr = await sb.from("lessons").upsert(lessonRows, { onConflict: "source_id,ord" });
  if (lr.error) throw new Error("lessons: " + lr.error.message);
  // sentences
  for (let i = 0; i < C.sentences.length; i += 200) {
    const chunk = C.sentences.slice(i, i + 200);
    const rows = chunk.map((s) => ({
      course_key: s.k, english: s.e, origin: "course", needs_user_name: s.u,
      tokens: s.t.map((t) => (t.punct || t.name ? t : { w: t.w, id: idOf.get(t.w) })),
    }));
    const r = await sb.from("sentences").upsert(rows, { onConflict: "course_key" }).select("id,course_key");
    if (r.error) throw new Error("sentences: " + r.error.message);
    const sid = new Map<string, string>(r.data.map((x: { id: string; course_key: string }) => [x.course_key, x.id]));
    const targets = chunk.flatMap((s) => s.tg.map(([h, gap, answers]) => ({ sentence_id: sid.get(s.k), word_id: idOf.get(h), gap, answers })));
    const t = await sb.from("sentence_targets").upsert(targets, { onConflict: "sentence_id,word_id" });
    if (t.error) throw new Error("targets: " + t.error.message);
  }
  // compounds
  const comp = [
    ...compounds.transparent.map((h: string) => ({ hanzi: h, verdict: "transparent" })),
    ...compounds.opaque.map((h: string) => ({ hanzi: h, verdict: "opaque" })),
  ];
  for (let i = 0; i < comp.length; i += 500) {
    const r = await sb.from("compounds").upsert(comp.slice(i, i + 500), { onConflict: "hanzi" });
    if (r.error) throw new Error("compounds: " + r.error.message);
  }
  cache = null;
  return { loaded: true, counts: await courseCounts() };
}

// ---------- cached reference data ----------
export interface SentenceRow { id: string; tokens: (Token & { id?: string })[]; english: string; needs_user_name: boolean; course_key: string | null }
export interface TargetRow { sentence_id: string; word_id: string; gap: string | null; answers: string[] }
export interface LessonRow { id: string; ord: number; title: string; word_ids: string[]; course_key: string | null; source_id: string }
interface Ref {
  words: Map<string, WordRow>;
  wordsByHanzi: Map<string, WordRow[]>;
  sentences: Map<string, SentenceRow>;
  targetsByWord: Map<string, TargetRow[]>;
  courseLessons: LessonRow[];
  compounds: Map<string, "transparent" | "opaque">;
  at: number;
}
let cache: Ref | null = null;

async function all<T>(sb: { from: (t: string) => any }, table: string, cols: string, filter?: (q: any) => any): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    let q = sb.from(table).select(cols).range(from, from + 999);
    if (filter) q = filter(q);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

export async function ref(): Promise<Ref> {
  if (cache && Date.now() - cache.at < 5 * 60_000) return cache;
  const sb = await admin();
  const [words, sentences, targets, lessons, comps] = await Promise.all([
    all<WordRow>(sb, "words", "*"),
    all<SentenceRow>(sb, "sentences", "id,tokens,english,needs_user_name,course_key", (q) => q.is("learner_id", null)),
    all<TargetRow>(sb, "sentence_targets", "sentence_id,word_id,gap,answers"),
    all<LessonRow & { sources: { kind: string } }>(sb, "lessons", "id,ord,title,word_ids,course_key,source_id,sources!inner(kind)", (q) => q.eq("sources.kind", "course")),
    all<{ hanzi: string; verdict: "transparent" | "opaque" }>(sb, "compounds", "hanzi,verdict"),
  ]);
  const r: Ref = {
    words: new Map(words.map((w) => [w.id, w])),
    wordsByHanzi: new Map(),
    sentences: new Map(sentences.map((s) => [s.id, s])),
    targetsByWord: new Map(),
    courseLessons: lessons.sort((a, b) => a.ord - b.ord),
    compounds: new Map(comps.map((c) => [c.hanzi, c.verdict])),
    at: Date.now(),
  };
  for (const w of words) r.wordsByHanzi.set(w.hanzi, [...(r.wordsByHanzi.get(w.hanzi) ?? []), w]);
  for (const t of targets) r.targetsByWord.set(t.word_id, [...(r.targetsByWord.get(t.word_id) ?? []), t]);
  if (sentences.length) cache = r;
  return r;
}
export function invalidateRef() {
  cache = null;
}
