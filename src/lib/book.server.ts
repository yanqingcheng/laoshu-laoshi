// Bring a book (BACKLOG stage 7, SPEC section 7 steps 1-5). Server-only.
// Word memory changes go through core.server (queueWords); scheduling is not touched here.
import { jsonCall, jsonCallOnceRepair } from "@/lib/ai/run.server";
import { PROMPTS, fill } from "@/lib/ai/prompts";
import { planLessons, type Unknown } from "@/lib/bookplan";
export { planLessons };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

// ---------- dictionary (CC-CEDICT subset, stored privately in backend storage)
let dict: Map<string, { p: string; m: string[] }[]> | null = null;
export async function dictionary() {
  if (dict) return dict;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage.from("reference").download("dictionary.json");
  if (error || !data) throw new Error(`Dictionary could not be loaded: ${error?.message ?? "missing"}`);
  const j = JSON.parse(await data.text()) as { entries: [string, string, string[]][] };
  const m = new Map<string, { p: string; m: string[] }[]>();
  for (const [h, p, mm] of j.entries) m.set(h, [...(m.get(h) ?? []), { p: p.toLowerCase(), m: mm }]);
  dict = m;
  return m;
}

const HAN = /\p{Script=Han}/u;
const normP = (s: string) => s.toLowerCase().replace(/ü/g, "u:").replace(/v/g, "u:").replace(/\s+/g, " ").trim();

export interface Plan {
  language: string; text: string; firstSplit: string;
  found: { hanzi: string; pinyin: string; meaning: string; count: number; known: boolean }[];
  unknown: Unknown[];
  lessons: import("@/lib/bookplan").PlannedLesson[];
}

export async function readPages(learnerId: string, jobId: string, imageUrls: string[]) {
  return jsonCallOnceRepair<{ language: string; pages: { id: string; text: string }[] }>(
    { learnerId, jobId, stage: "source.read", prompt: PROMPTS["source.read"], images: imageUrls },
    (o) => (!o || !Array.isArray(o.pages) ? "missing pages" : o.pages.length !== imageUrls.length ? `expected ${imageUrls.length} page entries, got ${o.pages.length}` : null),
  );
}

export async function describeStory(learnerId: string, jobId: string, topic: string, context: string) {
  return jsonCallOnceRepair<{ title_en: string; text: string }>(
    { learnerId, jobId, stage: "source.describe", prompt: fill(PROMPTS["source.describe"], { TOPIC: topic, LEARNER_CONTEXT: context }) },
    (o) => {
      const n = [...(o?.text ?? "")].filter((c) => HAN.test(c)).length;
      if (n < 60 || n > 160) return `text has ${n} Chinese characters; need 60 to 160`;
      if (/[A-Za-z]/.test(o.text)) return "text contains Latin letters";
      return null;
    },
  );
}

function evidenceFor(text: string, w: string) {
  const sentences = text.split(/(?<=[。！？!?\n])/);
  const s = sentences.find((x) => x.includes(w));
  return (s ?? "").trim().slice(0, 60);
}

/** Steps 2-4: split, source.words, compare with the learner's snapshot, plan lessons (Exact). */
export async function buildPlan(opts: {
  learnerId: string; jobId: string; language: string; text: string;
  ref: Any; core: Any; repertoire: Set<string>; queued: Set<string>; courseLessons: { id: string; ord: number; title: string; word_ids: string[] }[];
}): Promise<Plan> {
  const { ref, repertoire } = opts;
  const D = await dictionary();
  const dictSet = new Set(D.keys());
  const zh = opts.language === "zh";
  const firstSplit = zh
    ? opts.core.splitText(opts.text.replace(/\[\?\]/g, " "), { wordsByHanzi: ref.wordsByHanzi, compounds: ref.compounds, dictionary: dictSet })
        .filter((t: Any) => !t.punct).map((t: Any) => t.w).join(" ")
    : "";
  const out = await jsonCallOnceRepair<{ words: Any[]; companions?: Any[] }>(
    {
      learnerId: opts.learnerId, jobId: opts.jobId, stage: "source.words",
      prompt: fill(PROMPTS["source.words"], { LANGUAGE: opts.language, PAGE_TEXT: opts.text, FIRST_SPLIT: firstSplit }),
    },
    (o) => (!o || !Array.isArray(o.words) || !o.words.length ? "no words returned" : null),
  );

  // The compound table wins: transparent joined words are split into parts.
  type W = { w: string; p: string; m: string; count: number; companionOf?: string };
  const words: W[] = [];
  const push = (x: W) => {
    if (!x.w || ![...x.w].some((c) => HAN.test(c))) return;
    const prev = words.find((y) => y.w === x.w && normP(y.p) === normP(x.p));
    if (prev) prev.count = Math.max(prev.count, x.count);
    else words.push(x);
  };
  for (const w of out.words) {
    const hz = String(w.w ?? "").trim();
    const p = String(w.p ?? "").trim();
    if (zh && ref.compounds.get(hz) === "transparent" && !ref.wordsByHanzi.has(hz)) {
      const parts = opts.core.splitText(hz, { wordsByHanzi: ref.wordsByHanzi, compounds: new Map(), dictionary: undefined });
      const syl = p.split(/\s+/);
      let k = 0;
      for (const part of parts) {
        const n = [...part.w].length;
        push({ w: part.w, p: syl.slice(k, k + n).join(" "), m: "", count: Number(w.count) || 1 });
        k += n;
      }
    } else push({ w: hz, p, m: String(w.meaning_en ?? ""), count: Number(w.count) || 1 });
  }
  for (const c of out.companions ?? []) push({ w: String(c.w ?? ""), p: String(c.p ?? ""), m: String(c.meaning_en ?? ""), count: 0, companionOf: String(c.with ?? "") });

  // Section 6.5 matching: course Word by characters alone; otherwise dictionary by characters + pinyin.
  const found: Plan["found"] = [];
  const unknown: Unknown[] = [];
  for (const w of words) {
    const course = (ref.wordsByHanzi.get(w.w) ?? []).find((r: Any) => r.origin === "course");
    const other = (ref.wordsByHanzi.get(w.w) ?? []).find((r: Any) => r.origin !== "course" && normP(r.pinyin) === normP(w.p));
    const row = course ?? other;
    const dictHit = (D.get(w.w) ?? []).find((e) => normP(e.p) === normP(w.p));
    const meaning = w.m || row?.meaning || dictHit?.m[0] || "";
    const known = !!row && repertoire.has(row.id);
    found.push({ hanzi: w.w, pinyin: row?.pinyin ?? w.p, meaning, count: w.count, known });
    if (known) continue;
    unknown.push({
      key: `${w.w}|${normP(row?.pinyin ?? w.p)}`, hanzi: w.w, pinyin: row?.pinyin ?? normP(w.p), meaning,
      count: w.count, wordId: row?.id ?? null, inDictionary: !!row || !!dictHit, companionOf: w.companionOf || undefined,
      evidence: evidenceFor(opts.text, w.w),
    });
  }
  return { language: opts.language, text: opts.text, firstSplit, found, unknown, lessons: planLessons(unknown, opts.courseLessons, repertoire) };
}

// ---------- lesson.sentences
const LEN = (n: number) => (n < 30 ? "4 to 10" : n < 100 ? "6 to 15" : "8 to 25");
const line = (w: Any) => `${w.hanzi} | ${w.pinyin} | ${w.meaning}`;

export async function sentencesForWord(o: {
  learnerId: string; jobId: string | null; target: Any; lessonWords: Any[]; also: Any[]; names: string[]; ref: Any; core: Any; allowedIds: Set<string>;
}) {
  const groups: string[] = [];
  const others = o.lessonWords.filter((w) => w.id !== o.target.id);
  if (others.length) groups.push(`NEW (lead with these):\n${others.map(line).join("\n")}`);
  if (o.also.length) groups.push(`ALSO ALLOWED:\n${o.also.map(line).join("\n")}`);
  const prompt = fill(PROMPTS["lesson.sentences"], {
    TARGET: line(o.target),
    WORDS_AND_RULES: fill(PROMPTS.WORDS_AND_RULES, { ALLOWED: groups.join("\n"), NAMES: o.names.join("\n") }),
    LENGTH: LEN(o.also.length),
  });
  const nameSet = new Set(o.names.map((n) => n.split(" | ")[0]));
  const ctx = { wordsByHanzi: o.ref.wordsByHanzi, names: nameSet, compounds: o.ref.compounds };
  const keep: Any[] = [];
  const problems: string[] = [];
  for (let attempt = 1; attempt <= 2 && keep.length < 3; attempt++) {
    const res = await jsonCall<{ sentences: Any[]; needs?: Any[] }>({
      learnerId: o.learnerId, jobId: o.jobId, stage: "lesson.sentences", attempt,
      prompt: attempt === 1 ? prompt : `${prompt}\n\nREPAIR: these problems were found in your last answer; avoid them: ${problems.slice(0, 12).join("; ")}`,
    });
    for (const s of res.sentences ?? []) {
      const toks = (s.tokens ?? []).map((t: Any) => (t.p ? { w: String(t.w), p: String(t.p) } : { w: String(t.w), punct: !HAN.test(String(t.w)) || undefined, name: nameSet.has(String(t.w)) || undefined }));
      const chk = o.core.checkText(toks, o.allowedIds, ctx);
      if (!chk.ok) { problems.push(...chk.problems.map((p: Any) => `${p.w}: ${p.problem}`)); continue; }
      if (!toks.some((t: Any) => t.w === o.target.hanzi)) { problems.push("target missing"); continue; }
      const gap = String(s.gap ?? "");
      const answers = (s.answers ?? []).map((a: Any) => String(a).toLowerCase());
      const gapOk = (gap === "" && answers.length === 0) || (gap.split("___").length === 2 && answers.length > 0);
      // map tokens to word ids (characters plus reading)
      const mapped = toks.map((t: Any) => {
        if (t.punct || t.name) return t;
        const rows = o.ref.wordsByHanzi.get(t.w) ?? [];
        const r = rows.find((r: Any) => o.allowedIds.has(r.id) && (!t.p || normP(r.pinyin) === normP(t.p))) ?? rows.find((r: Any) => o.allowedIds.has(r.id));
        return r ? { w: t.w, id: r.id } : t;
      });
      keep.push({ tokens: mapped, english: String(s.en ?? ""), gap: gapOk ? gap : "", answers: gapOk ? answers : [] });
    }
  }
  return { kept: keep, problems };
}
