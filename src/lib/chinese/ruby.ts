// Shared ruby (pinyin-over-Hanzi) alignment. Pure functions, no DOM, so the
// app (WordText), story/video caption renderers and sandboxed games (via the
// injected adapter) all lay out pinyin exactly the same way.
//
// One segment per Hanzi: pinyin sits centred over its own character.
// Erhua (这儿 = "zher4") is split as 这 "zhè" + 儿 "r" so the r stays over 儿.
// Non-Han characters (digits, Latin, punctuation) get no pinyin and consume
// no syllable. If the reading cannot be aligned, the whole word becomes one
// segment with its full pinyin (never misaligned) and `aligned` is false.

import { syllableToMarked } from "./pinyin";

export interface RubySeg { han: string; py: string }
export interface RubyWord { segs: RubySeg[]; aligned: boolean }

const HAN = /\p{Script=Han}/u;
const ERHUA = /^([a-zü:v]+?)(?:r([0-5])?|([0-5])r)$/i;

export function isHan(ch: string) { return HAN.test(ch); }

export function alignWord(hanzi: string, numbered: string | undefined | null): RubyWord {
  const chars = [...hanzi];
  const syl = (numbered ?? "").trim().split(/\s+/).filter(Boolean);
  if (!syl.length) return { segs: chars.map((han) => ({ han, py: "" })), aligned: !chars.some(isHan) };
  const segs: RubySeg[] = [];
  let j = 0;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (!isHan(c)) { segs.push({ han: c, py: "" }); continue; }
    const s = syl[j];
    if (s === undefined) return whole(hanzi, numbered!);
    const m = ERHUA.exec(s);
    const hanLeft = chars.slice(i).filter(isHan).length;
    const sylLeft = syl.length - j;
    // erhua contraction: this char + following 儿 share one written syllable
    if (chars[i + 1] === "儿" && m && m[1].toLowerCase() !== "e" && hanLeft === sylLeft + 1) {
      segs.push({ han: c, py: syllableToMarked(m[1] + (m[2] ?? m[3] ?? "")) });
      segs.push({ han: "儿", py: "r" });
      i++; j++;
      continue;
    }
    segs.push({ han: c, py: syllableToMarked(s) });
    j++;
  }
  if (j !== syl.length) return whole(hanzi, numbered!);
  return { segs, aligned: true };
}

function whole(hanzi: string, numbered: string): RubyWord {
  return { segs: [{ han: hanzi, py: numbered.split(/\s+/).filter(Boolean).map(syllableToMarked).join("") }], aligned: false };
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Self-contained HTML for games/video frames: words never break internally. */
export function rubyHtml(words: { w: string; p?: string; punct?: boolean }[], opts: { han?: number; py?: number } = {}): string {
  const han = opts.han ?? 32, py = opts.py ?? Math.round(han * 0.45);
  const col = `display:inline-flex;flex-direction:column;align-items:center;line-height:1.15`;
  const out: string[] = [];
  for (const t of words) {
    const segs = t.punct ? [{ han: t.w, py: "" }] : alignWord(t.w, t.p).segs;
    const cols = segs.map((s) => `<span style="${col}"><span style="font-size:${py}px;min-height:1.15em;white-space:nowrap">${esc(s.py) || "&nbsp;"}</span><span style="font-size:${han}px">${esc(s.han)}</span></span>`).join("");
    out.push(`<span style="display:inline-flex;white-space:nowrap;margin-inline-end:${t.punct ? 0.1 : 0.55}em;vertical-align:bottom">${cols}</span>`);
  }
  return `<span lang="zh-CN" style="display:inline;line-height:1">${out.join("")}</span>`;
}
