// Make a place (BACKLOG stage 8; SPEC section 7 steps 6-7, section 8). Server-only.
import { jsonCall } from "@/lib/ai/run.server";
import { PROMPTS, fill } from "@/lib/ai/prompts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const HAN = /\p{Script=Han}/u;
const normP = (s: string) => s.toLowerCase().replace(/ü/g, "u:").replace(/\s+/g, " ").trim();
const line = (w: Any) => `${w.hanzi} | ${w.pinyin} | ${w.meaning}`;

export interface Allowed { newW: Any[]; bring: Any[]; also: Any[]; ids: Set<string> }

export function allowedText(a: Allowed) {
  const g: string[] = [];
  if (a.newW.length) g.push(`NEW (lead with these):\n${a.newW.map(line).join("\n")}`);
  if (a.bring.length) g.push(`BRING IN (reuse several of these):\n${a.bring.map(line).join("\n")}`);
  if (a.also.length) g.push(`ALSO ALLOWED:\n${a.also.map(line).join("\n")}`);
  return g.join("\n");
}

export function baseNames(learner: Any, hostName?: string) {
  const n = ["毛毛 | mao2 mao5 | the dog (full name 王毛毛)", "咪咪 | mi1 mi1 | the cat (full name 李咪咪)"];
  if (learner.chinese_name) n.unshift(`${learner.chinese_name} | ${learner.chinese_name_pinyin ?? ""} | the learner`);
  if (hostName) n.push(hostName);
  return n;
}

/** Normalise model tokens, run checkText, map to word ids. */
export function checkTokens(raw: Any[], allowedIds: Set<string>, ref: Any, core: Any, names: Set<string>) {
  const toks = (raw ?? []).map((t: Any) => {
    const w = String(t?.w ?? "");
    if (!t?.p) return { w, punct: !HAN.test(w) || undefined, name: names.has(w) || undefined };
    return { w, p: String(t.p), name: names.has(w) || undefined };
  });
  const chk = core.checkText(toks, allowedIds, { wordsByHanzi: ref.wordsByHanzi, names, compounds: ref.compounds });
  const mapped = toks.map((t: Any) => {
    if (t.punct || t.name) return t.name ? { w: t.w, name: true, p: t.p } : { w: t.w, punct: true };
    const rows = ref.wordsByHanzi.get(t.w) ?? [];
    const r = rows.find((r: Any) => allowedIds.has(r.id) && (!t.p || normP(r.pinyin) === normP(t.p))) ?? rows.find((r: Any) => allowedIds.has(r.id));
    return r ? { w: t.w, id: r.id } : { w: t.w, p: t.p };
  });
  return { ok: chk.ok && toks.length > 0, problems: chk.problems as Any[], tokens: mapped };
}

/** JSON call with the verbatim `repair` turn sent once on failure. */
export async function callChecked<T>(o: { learnerId: string; jobId: string | null; stage: string; prompt: string; check: (x: T) => string[] }) {
  let out = await jsonCall<T>({ learnerId: o.learnerId, jobId: o.jobId, stage: o.stage, prompt: o.prompt, attempt: 1 });
  let problems = o.check(out);
  if (!problems.length) return { out, problems: [] as string[], repaired: false };
  const repairPrompt = `${o.prompt}\n\nYOUR PREVIOUS ANSWER:\n${JSON.stringify(out)}\n\n${fill(PROMPTS.repair, { PROBLEMS: problems.join("\n") })}`;
  out = await jsonCall<T>({ learnerId: o.learnerId, jobId: o.jobId, stage: `${o.stage}.repair`, prompt: repairPrompt, attempt: 2 });
  problems = o.check(out);
  return { out, problems, repaired: true };
}

export async function buildLevelAllowed(o: { core: Any; sb: Any; learner: Any; ref: Any; source: Any; level: number; lessons: Any[] }): Promise<Allowed> {
  const { ref } = o;
  const plan = o.source.plan ?? {};
  const base = new Set<string>(plan.repertoireAtApproval ?? []);
  const prereqIds = (plan.lessons ?? []).filter((l: Any) => l.kind === "prerequisite").flatMap((l: Any) => ref.courseLessons.find((c: Any) => c.id === l.courseLessonId)?.word_ids ?? []);
  const custom = o.lessons.filter((l: Any) => l.source_id === o.source.id).sort((a: Any, b: Any) => a.ord - b.ord);
  const newIds: string[] = custom[o.level - 1]?.word_ids ?? [];
  const earlier = custom.slice(0, o.level - 1).flatMap((l: Any) => l.word_ids);
  let newW = newIds.map((id) => ref.words.get(id)).filter(Boolean);
  if (!custom.length) {
    // zero unknown words: NEW is the source's ten most frequent words
    newW = (plan.topWords ?? []).map((h: string) => (ref.wordsByHanzi.get(h) ?? [])[0]).filter(Boolean);
  }
  const weakest = await o.core.queryWords(o.sb, o.learner, { status: "repertoire", orderBy: "weakest", limit: 6 });
  const newest = await o.core.queryWords(o.sb, o.learner, { status: "repertoire", orderBy: "newest", limit: 12 });
  const newSet = new Set(newW.map((w: Any) => w.id));
  const bring: Any[] = [];
  for (const w of [...weakest, ...newest]) if (bring.length < 12 && !newSet.has(w.id) && !bring.some((b) => b.id === w.id)) bring.push(w);
  const starter = ref.courseLessons[0]?.word_ids ?? [];
  const ids = new Set<string>([...base, ...prereqIds, ...earlier, ...newSet, ...bring.map((b) => b.id), ...starter]);
  const also = [...ids].filter((id) => !newSet.has(id) && !bring.some((b) => b.id === id)).map((id) => ref.words.get(id)).filter(Boolean);
  return { newW, bring, also, ids };
}

const MECHANICS = ["tone-flight", "lane-runner", "serve-the-order", "fetch-it"];

export async function makeScenario(o: { learnerId: string; jobId: string; theme: Any; allowed: Allowed; names: string[]; context: string; level: number; soFar: string }) {
  const listed = new Set([...o.allowed.newW, ...o.allowed.bring, ...o.allowed.also].map((w: Any) => w.hanzi));
  const prompt = fill(PROMPTS["place.scenario"], {
    THEME: JSON.stringify(o.theme), ALLOWED: allowedText(o.allowed), NAMES: o.names.join("\n"),
    LEARNER_CONTEXT: o.context, LEVEL: String(o.level), PLACE_SO_FAR: o.soFar,
  });
  const r = await callChecked<Any>({
    learnerId: o.learnerId, jobId: o.jobId, stage: "place.scenario", prompt,
    check: (x) => {
      const p: string[] = [];
      if (!x?.ideas) return ["missing ideas"];
      for (const k of ["game", "talk", "drama", "story"]) {
        if (!x.ideas[k]) p.push(`missing idea ${k}`);
        for (const w of x.ideas[k]?.words ?? []) if (!listed.has(w)) p.push(`idea ${k}: ${w} is not in the allowed words`);
      }
      if (!MECHANICS.includes(x.ideas.game?.mechanic)) p.push(`game mechanic ${x.ideas.game?.mechanic} is not one of ${MECHANICS.join(", ")}`);
      return p;
    },
  });
  if (r.problems.length) throw new Error(`place.scenario withheld: ${r.problems.join("; ")}`);
  return r.out;
}

export async function makeTheme(o: { learnerId: string; jobId: string; allowed: Allowed; names: string[]; context: string; title: string }) {
  const newH = new Set(o.allowed.newW.map((w: Any) => w.hanzi));
  const bringH = new Set(o.allowed.bring.map((w: Any) => w.hanzi));
  const r = await callChecked<Any>({
    learnerId: o.learnerId, jobId: o.jobId, stage: "place.theme",
    prompt: fill(PROMPTS["place.theme"], { ALLOWED: allowedText(o.allowed), NAMES: o.names.join("\n"), LEARNER_CONTEXT: o.context, SOURCE_TITLE: o.title }),
    check: (x) => {
      const p: string[] = [];
      if (!Array.isArray(x?.themes) || x.themes.length !== 3) return ["need exactly three themes"];
      x.themes.forEach((t: Any, i: number) => {
        for (const w of t.new ?? []) if (!newH.has(w)) p.push(`theme ${i + 1}: ${w} is not a NEW word`);
        for (const w of t.bring_in ?? []) if (!bringH.has(w)) p.push(`theme ${i + 1}: ${w} is not a BRING IN word`);
      });
      return p;
    },
  });
  if (r.problems.length) throw new Error(`place.theme withheld: ${r.problems.join("; ")}`);
  const themes = [...r.out.themes].sort((a: Any, b: Any) => (b.new?.length ?? 0) - (a.new?.length ?? 0) || (b.bring_in?.length ?? 0) - (a.bring_in?.length ?? 0));
  return { chosen: themes[0], all: r.out.themes };
}

export async function makeNeighbour(o: { learnerId: string; jobId: string; scenario: Any; allowed: Allowed; names: string[]; ref: Any; core: Any }) {
  const scen = { ...o.scenario };
  delete scen.ideas;
  const nameSet = new Set(o.names.map((n) => n.split(" | ")[0]));
  const allowedH = new Set([...o.allowed.newW, ...o.allowed.bring, ...o.allowed.also].map((w: Any) => w.hanzi));
  const newH = new Set(o.allowed.newW.map((w: Any) => w.hanzi));
  let checked: Any = null;
  const r = await callChecked<Any>({
    learnerId: o.learnerId, jobId: o.jobId, stage: "place.neighbour",
    prompt: fill(PROMPTS["place.neighbour"], {
      SCENARIO: JSON.stringify(scen),
      WORDS_AND_RULES: fill(PROMPTS.WORDS_AND_RULES, { ALLOWED: allowedText(o.allowed), NAMES: o.names.join("\n") }),
    }),
    check: (x) => {
      const p: string[] = [];
      const c: Any = { lines: {}, objects: [] };
      const chk = (label: string, toks: Any[]) => {
        const r = checkTokens(toks, o.allowed.ids, o.ref, o.core, nameSet);
        if (!r.ok) p.push(...(r.problems.length ? r.problems.map((q: Any) => `${label}: ${q.w} — ${q.problem}`) : [`${label}: empty`]));
        return r.tokens;
      };
      if (!x?.host?.name) return ["missing host"];
      c.name = chk("host.name", x.host.name);
      for (const k of ["first_greeting", "return_greeting", "wave_over", "thanks"]) c.lines[k] = chk(`line ${k}`, x.lines?.[k] ?? []);
      c.title = chk("title", x.title ?? []);
      if ((x.objects ?? []).length > 4) p.push("more than four objects");
      for (const [i, ob] of (x.objects ?? []).slice(0, 4).entries()) {
        if (!allowedH.has(ob.word)) p.push(`object ${i + 1}: ${ob.word} is not an allowed word`);
        else if (!newH.has(ob.word) && newH.size) p.push(`object ${i + 1}: ${ob.word} should be a NEW word`);
        const label = chk(`object ${i + 1} label`, ob.label ?? []);
        if (!(ob.label ?? []).some((t: Any) => t.w === ob.word)) p.push(`object ${i + 1}: label must contain ${ob.word}`);
        c.objects.push({ word: ob.word, label, tap_line: chk(`object ${i + 1} tap_line`, ob.tap_line ?? []), picture_en: ob.picture_en });
      }
      for (const w of x.host.loves ?? []) if (!allowedH.has(w)) p.push(`loves: ${w} is not an allowed word`);
      const n = String(x.host.look_en ?? "").split(/\s+/).filter(Boolean).length;
      if (n < 30 || n > 80) p.push(`look_en has ${n} words; need 30 to 80`);
      checked = c;
      return p;
    },
  });
  if (r.problems.length) throw new Error(`place.neighbour withheld: ${r.problems.slice(0, 8).join("; ")}`);
  const x = r.out;
  return {
    host: { name: checked.name, nameText: (x.host.name ?? []).map((t: Any) => t.w).join(""), namePinyin: (x.host.name ?? []).map((t: Any) => t.p).filter(Boolean).join(" "), descriptor_en: x.host.descriptor_en, look_en: x.host.look_en, loves: x.host.loves ?? [] },
    lines: checked.lines,
    objects: checked.objects,
    house_en: x.house_en, room_en: x.room_en, title: checked.title, title_en: x.title_en, needs: x.needs ?? [],
  };
}
