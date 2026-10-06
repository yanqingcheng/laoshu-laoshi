import { checkPinyin } from "@/lib/chinese/answers";
import { tonesOf } from "@/lib/chinese/pinyin";
import type { WTToken } from "@/components/WordText";

export type DrillMode = "see-tones" | "hear-tones" | "hear-pinyin" | "sentence-pinyin";
export interface DrillWord { id: string; hanzi: string; pinyin: string; meaning: string; altReadings: string[] }
export interface DrillRound { id: string; word: DrillWord; tokens: WTToken[]; sentenceId?: string }

/** Reject stray text rather than silently extracting numbers from a typo. */
export function normalizeToneAnswer(answer: string): string | null {
  if (!/^[0-5\s,·-]+$/.test(answer.trim())) return null;
  return answer.replace(/[\s,·-]/g, "").replace(/0/g, "5");
}

export function checkToneAnswer(answer: string, word: DrillWord, heard: boolean): boolean {
  const input = normalizeToneAnswer(answer);
  if (!input) return false;
  return [word.pinyin, ...word.altReadings].some((reading) => {
    if (!heard) return input === tonesOf(reading).join("");
    const syllables = reading.split(/\s+/).filter(Boolean);
    if (input.length !== syllables.length) return false;
    // Reuse the app's prescribed third-tone / yi / bu sandhi acceptance.
    const typed = syllables.map((s, i) => s.replace(/[0-5]?$/, input[i])).join(" ");
    return checkPinyin(typed, { hanzi: word.hanzi, pinyin: reading }).kind === "right";
  });
}

export function sentenceEligible(tokens: WTToken[], repertoire: ReadonlySet<string>): boolean {
  // Personalised names need their own verified audio; don't substitute them here.
  return tokens.length > 0 && tokens.every((t) => t.w !== "{USER_NAME}" && (t.punct || t.name || (!!t.id && repertoire.has(t.id))));
}

export function pickDrillRounds(pool: DrillRound[], count = 10): DrillRound[] {
  if (!pool.length) return [];
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return Array.from({ length: count }, (_, i) => shuffled[i % shuffled.length]);
}

export function normalizeSpeechText(text: string): string {
  return text.normalize("NFKC").replace(/[\p{P}\p{Z}\s]/gu, "");
}
