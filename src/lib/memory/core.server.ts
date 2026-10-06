// LAYER 1 — WORD MEMORY. The only module that reads or writes cards, schedules
// and the repertoire. Everything else uses submitEvidence / checkText /
// splitText / queryWords and the few non-practice writes below.
import { fsrs, createEmptyCard, Rating, State, type Card, type Grade } from "ts-fsrs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { localDay, startOfLocalDay, addDays, endOfToday, safeTz } from "@/lib/time";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any>;
export type Outcome = "fail" | "hard" | "good" | "easy";
export type Skill = "recognise" | "produce";

const scheduler = fsrs();
const RATING: Record<Outcome, Grade> = { fail: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy };

export interface Learner {
  id: string;
  display_name: string;
  chinese_name: string | null;
  chinese_name_pinyin: string | null;
  timezone: string;
  daily_recognise: number;
  daily_produce: number;
  lesson_pace: number;
  pinyin_on: boolean;
  coins: number;
  is_synthetic: boolean;
  about: string | null;
  avatar: string | null;
}

// ---------- card (de)serialisation ----------
export function toCard(j: Record<string, unknown>): Card {
  return {
    ...(j as unknown as Card),
    due: new Date(j.due as string),
    last_review: j.last_review ? new Date(j.last_review as string) : undefined,
  } as Card;
}
export function fromCard(c: Card): Record<string, unknown> {
  return {
    ...c,
    due: c.due.toISOString(),
    last_review: c.last_review ? new Date(c.last_review).toISOString() : null,
  };
}

export async function getLearner(sb: SB, uid: string): Promise<Learner> {
  const { data, error } = await sb.from("learners").select("*").eq("id", uid).maybeSingle();
  if (error) throw new Error("Could not load learner: " + error.message);
  if (data) return data as Learner;
  const { data: ins, error: e2 } = await sb.from("learners").insert({ id: uid }).select("*").single();
  if (e2) throw new Error("Could not create learner: " + e2.message);
  return ins as Learner;
}

/** Due rule used on every screen. */
export function isDue(due: Date, learner: Pick<Learner, "timezone">, now = new Date()): boolean {
  return due.getTime() <= endOfToday(now, safeTz(learner.timezone)).getTime();
}

function passDue(libDue: Date, tz: string, now: Date): Date {
  const today = localDay(now, tz);
  const d = localDay(libDue, tz);
  const day = d <= today ? addDays(today, 1) : d;
  return startOfLocalDay(day, tz);
}

// ---------- submitEvidence ----------
export interface EvidenceInput {
  wordId: string;
  skill: Skill;
  outcome: Outcome;
  requestId: string;
  activity: string; // "review" | "lesson" | ...
}

export async function submitEvidence(sb: SB, learner: Learner, ev: EvidenceInput) {
  const { data: prior } = await sb
    .from("evidence")
    .select("result")
    .eq("learner_id", learner.id)
    .eq("request_id", ev.requestId)
    .maybeSingle();
  if (prior) return prior.result as { due: string; enteredRepertoire: boolean; duplicate?: boolean };

  const tz = safeTz(learner.timezone);
  const now = new Date();
  const { data: cardRow, error: cErr } = await sb
    .from("cards")
    .select("*")
    .eq("learner_id", learner.id)
    .eq("word_id", ev.wordId)
    .eq("skill", ev.skill)
    .maybeSingle();
  if (cErr) throw new Error(cErr.message);
  const { data: lw } = await sb
    .from("learner_words")
    .select("*")
    .eq("learner_id", learner.id)
    .eq("word_id", ev.wordId)
    .maybeSingle();

  const card = cardRow ? toCard(cardRow.state) : createEmptyCard(now);
  const next = scheduler.next(card, now, RATING[ev.outcome]).card;
  const due = ev.outcome === "fail" ? next.due : passDue(next.due, tz, now);
  next.due = due;

  // write evidence first (unique request id guards double counting)
  const { error: evErr } = await sb.from("evidence").insert({
    learner_id: learner.id,
    request_id: ev.requestId,
    word_id: ev.wordId,
    skill: ev.skill,
    outcome: ev.outcome,
    activity: ev.activity,
    prev_card: cardRow ? cardRow.state : null,
    prev_learner_word: lw ?? null,
    result: { due: due.toISOString(), enteredRepertoire: false },
  });
  if (evErr) {
    if (evErr.code === "23505") {
      const { data: again } = await sb
        .from("evidence")
        .select("result")
        .eq("learner_id", learner.id)
        .eq("request_id", ev.requestId)
        .single();
      return { ...(again?.result as { due: string; enteredRepertoire: boolean }), duplicate: true };
    }
    throw new Error(evErr.message);
  }

  const { error: upErr } = await sb
    .from("cards")
    .upsert(
      { learner_id: learner.id, word_id: ev.wordId, skill: ev.skill, state: fromCard(next), due: due.toISOString() },
      { onConflict: "learner_id,word_id,skill" },
    );
  if (upErr) throw new Error(upErr.message);

  let enteredRepertoire = false;
  if (ev.activity === "lesson" && (!lw || lw.status !== "repertoire")) {
    if (!lw) {
      await sb.from("learner_words").insert({ learner_id: learner.id, word_id: ev.wordId, status: "queued" });
    }
    if (ev.outcome !== "fail") {
      const { data: passes } = await sb
        .from("evidence")
        .select("skill")
        .eq("learner_id", learner.id)
        .eq("word_id", ev.wordId)
        .eq("activity", "lesson")
        .eq("undone", false)
        .neq("outcome", "fail");
      const skills = new Set((passes ?? []).map((p) => p.skill));
      if (skills.has("recognise") && skills.has("produce")) {
        await sb
          .from("learner_words")
          .update({ status: "repertoire", entered_via: "lesson", entered_at: now.toISOString(), queue_position: null })
          .eq("learner_id", learner.id)
          .eq("word_id", ev.wordId);
        enteredRepertoire = true;
      }
    }
  }
  const result = { due: due.toISOString(), enteredRepertoire };
  await sb.from("evidence").update({ result }).eq("learner_id", learner.id).eq("request_id", ev.requestId);
  return result;
}

// ---------- non-practice writes ----------
export function declaredCard(skill: Skill, now = new Date()): { state: Record<string, unknown>; due: string } {
  const days = skill === "recognise" ? 30 : 7;
  const due = new Date(now.getTime() + days * 86400000);
  const c: Card = {
    ...createEmptyCard(now),
    due,
    stability: days,
    difficulty: 5,
    state: State.Review,
    scheduled_days: days,
    reps: 1,
    last_review: now,
  };
  return { state: fromCard(c), due: due.toISOString() };
}

export async function declareKnown(sb: SB, learner: Learner, wordIds: string[]) {
  let entered = 0;
  for (const wordId of wordIds) {
    const { data: lw } = await sb
      .from("learner_words")
      .select("status")
      .eq("learner_id", learner.id)
      .eq("word_id", wordId)
      .maybeSingle();
    if (lw?.status === "repertoire") continue;
    const now = new Date();
    for (const skill of ["recognise", "produce"] as Skill[]) {
      const d = declaredCard(skill, now);
      const { error } = await sb
        .from("cards")
        .upsert({ learner_id: learner.id, word_id: wordId, skill, state: d.state, due: d.due }, { onConflict: "learner_id,word_id,skill" });
      if (error) throw new Error(error.message);
    }
    const { error } = await sb.from("learner_words").upsert(
      { learner_id: learner.id, word_id: wordId, status: "repertoire", entered_via: "declared", queue_position: null, entered_at: now.toISOString() },
      { onConflict: "learner_id,word_id" },
    );
    if (error) throw new Error(error.message);
    entered++;
  }
  return { entered };
}

export async function queueWords(sb: SB, learner: Learner, wordIds: string[], sourceId?: string) {
  const { data: maxRow } = await sb
    .from("learner_words")
    .select("queue_position")
    .eq("learner_id", learner.id)
    .order("queue_position", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  let pos = (maxRow?.queue_position as number | null) ?? 0;
  let queued = 0;
  for (const wordId of wordIds) {
    pos++;
    const { error } = await sb
      .from("learner_words")
      .insert({ learner_id: learner.id, word_id: wordId, status: "queued", queue_position: pos, source_id: sourceId ?? null });
    if (!error) queued++;
    else if (error.code !== "23505") throw new Error(error.message);
  }
  return { queued };
}

export async function unqueueWord(sb: SB, learner: Learner, wordId: string) {
  await sb.from("learner_words").delete().eq("learner_id", learner.id).eq("word_id", wordId).eq("status", "queued");
}

export async function undoLast(sb: SB, learner: Learner) {
  const { data: ev } = await sb
    .from("evidence")
    .select("*")
    .eq("learner_id", learner.id)
    .eq("undone", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!ev) return { undone: false as const };
  if (ev.prev_card) {
    await sb
      .from("cards")
      .update({ state: ev.prev_card, due: (ev.prev_card as { due: string }).due })
      .eq("learner_id", learner.id)
      .eq("word_id", ev.word_id)
      .eq("skill", ev.skill);
  } else {
    await sb.from("cards").delete().eq("learner_id", learner.id).eq("word_id", ev.word_id).eq("skill", ev.skill);
  }
  const plw = ev.prev_learner_word as Record<string, unknown> | null;
  if (plw) {
    await sb
      .from("learner_words")
      .update({ status: plw.status, entered_via: plw.entered_via, queue_position: plw.queue_position, entered_at: plw.entered_at })
      .eq("learner_id", learner.id)
      .eq("word_id", ev.word_id);
  } else if (ev.activity === "lesson") {
    await sb.from("learner_words").delete().eq("learner_id", learner.id).eq("word_id", ev.word_id);
  }
  await sb.from("evidence").update({ undone: true }).eq("id", ev.id);
  return { undone: true as const, requestId: ev.request_id as string, wordId: ev.word_id as string };
}

// ---------- queryWords ----------
export interface WordFilter {
  status?: "repertoire" | "queued";
  strength?: "solid" | "wobbly";
  skill?: Skill;
  dueWithinDays?: number;
  learnedWithinDays?: number;
  sourceId?: string;
  lessonId?: string;
  orderBy?: "weakest" | "dueSoonest" | "newest" | "queueOrder";
  limit?: number;
}
export interface WordRow {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  accepted: string[];
  alt_readings: string[];
  synonyms: string[];
  self_scored: boolean;
  origin: string;
}
export interface QueriedWord extends WordRow {
  status: "repertoire" | "queued";
  enteredAt: string;
  queuePosition: number | null;
  solid: boolean;
  retrievability: number | null;
  due: Record<string, string>;
}

async function fetchAll<T>(q: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await q(from, from + 999);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export async function queryWords(sb: SB, learner: Learner, filter: WordFilter = {}): Promise<QueriedWord[]> {
  const lws = await fetchAll<Record<string, unknown>>((a, b) =>
    sb.from("learner_words").select("*, words(*)").eq("learner_id", learner.id).range(a, b),
  );
  const cards = await fetchAll<Record<string, unknown>>((a, b) =>
    sb.from("cards").select("word_id, skill, state, due").eq("learner_id", learner.id).range(a, b),
  );
  const byWord = new Map<string, Record<string, Record<string, unknown>>>();
  for (const c of cards) {
    const m = byWord.get(c.word_id as string) ?? {};
    m[c.skill as string] = c;
    byWord.set(c.word_id as string, m);
  }
  let lessonWordIds: Set<string> | null = null;
  if (filter.lessonId) {
    const { data } = await sb.from("lessons").select("word_ids").eq("id", filter.lessonId).single();
    lessonWordIds = new Set((data?.word_ids as string[]) ?? []);
  }
  const now = new Date();
  let out: QueriedWord[] = lws.map((lw) => {
    const w = lw.words as WordRow;
    const cs = byWord.get(w.id) ?? {};
    let r: number | null = null;
    let solid = false;
    const rc = cs["recognise"];
    if (rc) {
      const card = toCard(rc.state as Record<string, unknown>);
      try {
        r = scheduler.get_retrievability(card, now, false) as number;
      } catch {
        r = null;
      }
      solid = lw.status === "repertoire" && card.state === State.Review && (r ?? 0) >= 0.95;
    }
    const due: Record<string, string> = {};
    for (const [k, v] of Object.entries(cs)) due[k] = v.due as string;
    return {
      ...w,
      status: lw.status as "repertoire" | "queued",
      enteredAt: lw.entered_at as string,
      queuePosition: lw.queue_position as number | null,
      sourceId: lw.source_id,
      solid,
      retrievability: r,
      due,
    } as QueriedWord;
  });
  if (filter.status) out = out.filter((w) => w.status === filter.status);
  if (filter.strength) out = out.filter((w) => w.status === "repertoire" && (filter.strength === "solid" ? w.solid : !w.solid));
  if (filter.skill) out = out.filter((w) => !!w.due[filter.skill!]);
  if (filter.dueWithinDays !== undefined) {
    const lim = now.getTime() + filter.dueWithinDays * 86400000;
    out = out.filter((w) => Object.values(w.due).some((d) => new Date(d).getTime() <= lim));
  }
  if (filter.learnedWithinDays !== undefined) {
    const lim = now.getTime() - filter.learnedWithinDays * 86400000;
    out = out.filter((w) => w.status === "repertoire" && new Date(w.enteredAt).getTime() >= lim);
  }
  if (filter.sourceId) out = out.filter((w) => (w as unknown as { sourceId?: string }).sourceId === filter.sourceId);
  if (lessonWordIds) out = out.filter((w) => lessonWordIds!.has(w.id));
  switch (filter.orderBy) {
    case "weakest":
      out.sort((a, b) => (a.retrievability ?? 0) - (b.retrievability ?? 0));
      break;
    case "dueSoonest":
      out.sort((a, b) => Math.min(...Object.values(a.due).map(Date.parse), Infinity) - Math.min(...Object.values(b.due).map(Date.parse), Infinity));
      break;
    case "newest":
      out.sort((a, b) => Date.parse(b.enteredAt) - Date.parse(a.enteredAt));
      break;
    case "queueOrder":
      out.sort((a, b) => (a.queuePosition ?? 1e9) - (b.queuePosition ?? 1e9));
      break;
  }
  if (filter.limit) out = out.slice(0, filter.limit);
  return out;
}

// ---------- the word check ----------
export interface Token {
  w: string;
  p?: string;
  name?: boolean;
  punct?: boolean;
}
export interface CheckProblem {
  index: number;
  w: string;
  problem: string;
}
const PUNCT = /^[\s，。！？、；：“”‘’（）《》…—·,.!?;:"'()\-–]+$/u;

/**
 * checkText(tokens, allowedWordIds) — the only judge of whether Chinese may be shown.
 * `ctx` supplies Word rows, names and the compound table.
 */
export function checkText(
  tokens: Token[],
  allowedWordIds: Set<string>,
  ctx: { wordsByHanzi: Map<string, WordRow[]>; names: Set<string>; compounds: Map<string, "transparent" | "opaque">; courseMode?: boolean },
): { ok: boolean; problems: CheckProblem[] } {
  const problems: CheckProblem[] = [];
  const allowedHanzi = new Set<string>();
  tokens.forEach((t, i) => {
    if (t.punct || PUNCT.test(t.w)) {
      if (/[0-9A-Za-z]/.test(t.w)) problems.push({ index: i, w: t.w, problem: "digits or Latin letters" });
      return;
    }
    if (/[0-9A-Za-z０-９]/.test(t.w)) problems.push({ index: i, w: t.w, problem: "digits or Latin letters" });
    if (t.name || ctx.names.has(t.w)) return;
    const rows = ctx.wordsByHanzi.get(t.w) ?? [];
    const ok = rows.find((r) => allowedWordIds.has(r.id));
    if (!ok) {
      problems.push({ index: i, w: t.w, problem: "not an allowed word" });
      return;
    }
    allowedHanzi.add(t.w);
    if (t.p) {
      const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
      const readings = [ok.pinyin, ...ok.alt_readings].map(norm);
      if (!readings.includes(norm(t.p))) problems.push({ index: i, w: t.w, problem: `pinyin ${t.p} disagrees with stored reading` });
    }
  });
  if (!ctx.courseMode) {
    // joined words: runs of 2-4 neighbouring tokens
    for (let i = 0; i < tokens.length; i++) {
      let joined = tokens[i].w;
      for (let j = i + 1; j < Math.min(tokens.length, i + 4); j++) {
        if (tokens[j].punct || tokens[j].name) break;
        joined += tokens[j].w;
        const isWord = ctx.wordsByHanzi.get(joined)?.some((r) => !allowedWordIds.has(r.id));
        const verdict = ctx.compounds.get(joined);
        if (isWord && !(ctx.wordsByHanzi.get(joined) ?? []).some((r) => allowedWordIds.has(r.id))) {
          problems.push({ index: i, w: joined, problem: "neighbouring words spell another word to be learned" });
        } else if (verdict === "opaque") {
          problems.push({ index: i, w: joined, problem: "neighbouring words spell an opaque compound" });
        }
      }
    }
  }
  return { ok: problems.length === 0, problems };
}

/**
 * splitText(text, learnerId) — longest match against Word rows (dictionary
 * lookup joins in stage 7), transparent compounds replaced by their parts.
 */
export function splitText(
  text: string,
  ctx: { wordsByHanzi: Map<string, WordRow[]>; compounds: Map<string, "transparent" | "opaque">; dictionary?: Set<string> },
): Token[] {
  const out: Token[] = [];
  let i = 0;
  const chars = [...text];
  while (i < chars.length) {
    const ch = chars[i];
    if (!/\p{Script=Han}/u.test(ch)) {
      let j = i;
      while (j < chars.length && !/\p{Script=Han}/u.test(chars[j])) j++;
      out.push({ w: chars.slice(i, j).join(""), punct: true });
      i = j;
      continue;
    }
    let best = 1;
    for (let len = Math.min(6, chars.length - i); len > 1; len--) {
      const cand = chars.slice(i, i + len).join("");
      if (ctx.wordsByHanzi.has(cand) || ctx.dictionary?.has(cand)) {
        best = len;
        break;
      }
    }
    const w = chars.slice(i, i + best).join("");
    if (best > 1 && !ctx.wordsByHanzi.has(w) && ctx.compounds.get(w) === "transparent") {
      out.push(...splitText(w.slice(0, -1), { ...ctx, dictionary: undefined }), { w: w.slice(-1) });
    } else out.push({ w });
    i += best;
  }
  return out;
}
