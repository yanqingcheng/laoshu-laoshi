// Shared pinyin core. Stored readings use tone numbers, one space per syllable,
// neutral tone 5, ü written "u:". Display converts to tone marks.

const MARKS: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};
const COMBINING = ["\u0304", "\u0301", "\u030c", "\u0300"];

export function syllableToMarked(syl: string): string {
  const m = /^([a-zü:]+?)([0-5])?$/i.exec(syl.trim());
  if (!m) return syl;
  let body = m[1].replace(/u:/gi, "ü").replace(/v/g, "ü");
  const tone = m[2] ? Number(m[2]) : 5;
  if (tone === 5 || tone === 0) return body;
  const lower = body.toLowerCase();
  let idx = -1;
  if (lower.includes("a")) idx = lower.indexOf("a");
  else if (lower.includes("e")) idx = lower.indexOf("e");
  else if (lower.includes("ou")) idx = lower.indexOf("o");
  else {
    for (let i = lower.length - 1; i >= 0; i--) {
      if ("iouü".includes(lower[i])) {
        idx = i;
        break;
      }
    }
  }
  if (idx === -1) {
    // syllabic nasals: m, n, ng
    const n = lower.search(/[mn]/);
    if (n === -1) return body;
    return (body.slice(0, n + 1) + COMBINING[tone - 1] + body.slice(n + 1)).normalize("NFC");
  }
  const ch = lower[idx];
  let mark = MARKS[ch]?.[tone - 1] ?? ch;
  if (body[idx] !== ch) mark = mark.toUpperCase();
  return body.slice(0, idx) + mark + body.slice(idx + 1);
}

export function toMarked(numbered: string): string {
  return numbered
    .split(/\s+/)
    .filter(Boolean)
    .map(syllableToMarked)
    .join(" ");
}

export function toUnmarked(numbered: string): string {
  return numbered
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s.replace(/[0-5]$/, "").replace(/u:/gi, "ü"))
    .join(" ");
}

export function tonesOf(numbered: string): number[] {
  return numbered
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => {
      const d = /([0-5])$/.exec(s);
      return d ? (Number(d[1]) === 0 ? 5 : Number(d[1])) : 5;
    });
}

const MARK_TO_TONE: Record<string, [string, number]> = {};
for (const [base, arr] of Object.entries(MARKS)) {
  arr.forEach((c, i) => {
    MARK_TO_TONE[c] = [base, i + 1];
    MARK_TO_TONE[c.toUpperCase()] = [base, i + 1];
  });
}

/** Convert a tone-marked reading ("nǐ hǎo", "nǎr") to stored numbered form. */
export function markedToNumbered(marked: string): string {
  return marked
    .toLowerCase()
    .replace(/['’]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((syl) => {
      let tone = 5;
      let out = "";
      for (const ch of syl.normalize("NFD")) {
        const ci = COMBINING.indexOf(ch);
        if (ci >= 0) tone = ci + 1;
        else if (ch === "\u0308") out += ":";
        else out += ch;
      }
      out = out.normalize("NFC");
      for (const ch of syl) if (MARK_TO_TONE[ch]) tone = MARK_TO_TONE[ch][1];
      return out.replace(/ü/g, "u:") + tone;
    })
    .join(" ");
}

export interface InputChar {
  ch: string; // base letter, ü written as "ü"
  tone?: number; // tone from a mark on this letter
  after?: number; // tone digit typed after this letter
}

/** Tokenise a learner's typed pinyin into letters with tone evidence. */
export function parseTyped(input: string): InputChar[] {
  const s = input
    .normalize("NFC")
    .toLowerCase()
    .replace(/u:/g, "ü")
    .replace(/v/g, "ü")
    .replace(/['’\s-]/g, "");
  const out: InputChar[] = [];
  for (const raw of s) {
    if (/[0-5]/.test(raw)) {
      if (out.length) out[out.length - 1].after = Number(raw);
      continue;
    }
    const mt = MARK_TO_TONE[raw];
    if (mt) out.push({ ch: mt[0], tone: mt[1] });
    else if (/[a-zü]/.test(raw)) out.push({ ch: raw });
    else {
      // decomposed or unexpected chars
      const d = raw.normalize("NFD");
      const ci = COMBINING.findIndex((c) => d.includes(c));
      const base = d.replace(/[\u0300-\u036f]/g, "");
      if (/[a-z]/.test(base)) out.push({ ch: d.includes("\u0308") ? "ü" : base, tone: ci >= 0 ? ci + 1 : undefined });
    }
  }
  return out;
}

export function syllableLetters(syl: string): string {
  return syl.replace(/[0-5]$/, "").replace(/u:/g, "ü").toLowerCase();
}
