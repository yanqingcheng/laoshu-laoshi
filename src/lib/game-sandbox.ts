import { GAME_TEXT_SCRIPT } from "./chinese/game-text";

export const GAME_CSP = "default-src 'none'; script-src 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'unsafe-inline'; img-src data:";
export type GameMessage = { type: "ready" } | { type: "say"; w: string } | { type: "done"; score: number };

/** Preliminary structure gate, not a substitute for generated-page acceptance. */
export function assembleGamePage(html: string): string {
  if (typeof html !== "string" || html.length > 2_000_000) throw new Error("Game document is missing or too large");
  // Require an explicit document/head so no generated executable precedes the CSP.
  const head = /^\s*(?:<!doctype\s+html\s*>\s*)?<html\b[^>]*>\s*<head\s*>/i.exec(html);
  if (!head || /\bon\w+\s*=/i.test(head[0])) throw new Error("Game needs an explicit HTML document and head");
  if (/\p{Script=Han}/u.test(html)) throw new Error("Game source must receive Chinese as checked runtime data");
  if (/<base\b|<meta\b[^>]*http-equiv\s*=\s*["']?refresh\b/i.test(html)) throw new Error("Game navigation is not permitted");
  const toolkit = GAME_TEXT_SCRIPT.replace(/<\/script/gi, "<\\/script");
  return `${head[0]}<meta http-equiv="Content-Security-Policy" content="${GAME_CSP}"><script>${toolkit}</script>${html.slice(head[0].length)}`;
}

/** Speech is limited to individual checked word tokens, never arbitrary message text. */
export function gameSpeechWords(data: unknown): Set<string> {
  const words = new Set<string>();
  const seen = new Set<object>();
  function visit(value: unknown): void {
    if (!value || typeof value !== "object") return;
    if (seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) { value.forEach(visit); return; }
    const object = value as Record<string, unknown>;
    if (typeof object.w === "string" && typeof object.p === "string" && object.p.length > 0) words.add(object.w);
    Object.values(object).forEach(visit);
  }
  visit(data);
  return words;
}

export function acceptedGameMessage(value: unknown, words: ReadonlySet<string>): GameMessage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const message = value as Record<string, unknown>;
  if (message.type === "ready") return { type: "ready" };
  if (message.type === "say" && typeof message.w === "string" && words.has(message.w)) return { type: "say", w: message.w };
  if (message.type === "done" && Number.isSafeInteger(message.score)) return { type: "done", score: message.score as number };
  return null;
}
