// One answer checker, used everywhere an answer is typed (BUILD-RULES 6.3).
import { parseTyped, syllableLetters, tonesOf, type InputChar } from "./pinyin";

export type PinyinVerdict =
  | { kind: "right" }
  | { kind: "nearly"; syllables: string[] }
  | { kind: "wrong"; reason?: string }
  | { kind: "synonym" };

type Variant = { letters: string[]; tones: number[][] }; // tones: accepted tone per syllable

function erhuaVariants(syls: string[]): string[][] {
  // syls numbered, e.g. ["zher4"]. Produce alternate syllabifications.
  let out: string[][] = [[]];
  for (const s of syls) {
    const m = /^(.+?)r([0-5])$/.exec(s);
    const opts: string[][] = [[s]];
    if (m && !/^e?r[0-5]$/.test(s)) {
      opts.push([`${m[1]}${m[2]}`, "r5"]);
      opts.push([`${m[1]}${m[2]}`, "er5"]);
    }
    const next: string[][] = [];
    for (const o of out) for (const p of opts) next.push([...o, ...p]);
    out = next;
  }
  return out;
}

function sandhiTones(hanzi: string, syls: string[]): number[][] {
  const tones = tonesOf(syls.join(" "));
  const chars = [...hanzi];
  const aligned = chars.length === syls.length;
  return tones.map((t, i) => {
    const acc = new Set<number>([t]);
    const next = tones[i + 1];
    if (aligned && next !== undefined) {
      if (chars[i] === "不" && t === 4 && next === 4) acc.add(2);
      if (chars[i] === "一" && t === 1) {
        if (next === 4) acc.add(2);
        if (next === 1 || next === 2 || next === 3) acc.add(4);
      }
    }
    if (t === 3 && next === 3) acc.add(2);
    return [...acc];
  });
}

function variantsFor(hanzi: string, reading: string): Variant[] {
  const syls = reading.split(/\s+/).filter(Boolean);
  const base: Variant = { letters: syls.map(syllableLetters), tones: sandhiTones(hanzi, syls) };
  const vs: Variant[] = [base];
  for (const alt of erhuaVariants(syls).slice(1)) {
    vs.push({ letters: alt.map(syllableLetters), tones: alt.map((s) => tonesOf(s)) });
  }
  return vs;
}

function matchVariant(input: InputChar[], v: Variant): { lettersOk: boolean; wrong: number[]; anyTone: boolean } {
  const letters = input.map((c) => c.ch).join("");
  if (letters !== v.letters.join("")) return { lettersOk: false, wrong: [], anyTone: false };
  let pos = 0;
  const wrong: number[] = [];
  let anyTone = false;
  v.letters.forEach((syl, i) => {
    const span = input.slice(pos, pos + syl.length);
    pos += syl.length;
    let tone: number | undefined;
    for (const c of span) {
      if (c.tone) tone = c.tone;
      if (c.after !== undefined) tone = c.after;
    }
    if (tone !== undefined) anyTone = true;
    const t = tone === undefined || tone === 0 ? 5 : tone;
    if (!v.tones[i].includes(t)) wrong.push(i);
  });
  return { lettersOk: true, wrong, anyTone };
}

export interface PinyinTarget {
  hanzi: string;
  pinyin: string;
  altReadings?: string[];
  synonymReadings?: string[];
}

export function checkPinyin(answer: string, target: PinyinTarget): PinyinVerdict {
  const input = parseTyped(answer);
  if (!input.length) return { kind: "wrong" };
  const readings = [target.pinyin, ...(target.altReadings ?? [])];
  let nearly: { syllables: string[] } | null = null;
  for (const r of readings) {
    for (const v of variantsFor(target.hanzi, r)) {
      const m = matchVariant(input, v);
      if (!m.lettersOk) continue;
      if (m.wrong.length === 0) return { kind: "right" };
      const allNeutral = v.tones.every((t) => t.includes(5));
      if (!m.anyTone && !allNeutral) continue; // tones are required
      if (!nearly) nearly = { syllables: m.wrong.map((i) => v.letters[i]) };
    }
  }
  if (nearly) return { kind: "nearly", syllables: nearly.syllables };
  for (const s of target.synonymReadings ?? []) {
    for (const v of variantsFor("", s)) {
      const m = matchVariant(input, v);
      if (m.lettersOk && m.wrong.length === 0) return { kind: "synonym" };
    }
  }
  return { kind: "wrong" };
}

// ---------------- English ----------------

const SPELLING: Array<[RegExp, string]> = [
  [/\bcolour/g, "color"],
  [/\bfavourite/g, "favorite"],
  [/\bfavour/g, "favor"],
  [/\bneighbour/g, "neighbor"],
  [/\bhonour/g, "honor"],
  [/\bflavour/g, "flavor"],
  [/\bbehaviour/g, "behavior"],
  [/\bcentre/g, "center"],
  [/\btheatre/g, "theater"],
  [/\bmetre/g, "meter"],
  [/\blitre/g, "liter"],
  [/\bgrey/g, "gray"],
  [/\bmum\b/g, "mom"],
  [/\bprogramme/g, "program"],
  [/\btravell/g, "travel"],
  [/\bcancell/g, "cancel"],
  [/\bjewellery/g, "jewelry"],
  [/\bpyjamas/g, "pajamas"],
  [/\btyre/g, "tire"],
  [/(\w{3,})is(e|ed|es|ing)\b/g, "$1iz$2"],
  [/(\w{3,})isation\b/g, "$1ization"],
];

export function normEnglish(s: string): string {
  let t = s.toLowerCase().trim().replace(/[.,!?;:"“”'’()\[\]]/g, "").replace(/\s+/g, " ");
  for (const [re, rep] of SPELLING) t = t.replace(re, rep);
  return t.trim();
}

export function meaningAnswers(meaning: string, accepted: string[] = []): string[] {
  const parts = meaning
    .split(/[,;/]/)
    .map((p) => p.replace(/\(.*?\)/g, "").trim())
    .filter(Boolean);
  const out = new Set<string>();
  for (const p of [...parts, ...accepted]) {
    const n = normEnglish(p);
    if (!n) continue;
    out.add(n);
    if (n.startsWith("to ")) out.add(n.slice(3));
  }
  return [...out];
}

export function checkMeaning(answer: string, meaning: string, accepted: string[] = []): boolean {
  const a = normEnglish(answer);
  if (!a) return false;
  return meaningAnswers(meaning, accepted).includes(a);
}

export function checkGap(answer: string, answers: string[]): boolean {
  const a = normEnglish(answer);
  return !!a && answers.some((x) => normEnglish(x) === a);
}
