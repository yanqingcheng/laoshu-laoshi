import { describe, expect, it } from "vitest";
import { checkToneAnswer, normalizeSpeechText, normalizeToneAnswer, pickDrillRounds, sentenceEligible, type DrillWord } from "./drills";

const greeting: DrillWord = { id: "hello", hanzi: "你好", pinyin: "ni3 hao3", meaning: "hello", altReadings: [] };

describe("tone drill answers", () => {
  it("accepts spacing and neutral zero, but rejects prose and out-of-range tones", () => {
    expect(normalizeToneAnswer(" 1, 0 ")).toBe("15");
    expect(normalizeToneAnswer("tone 3")).toBeNull();
    expect(normalizeToneAnswer("36")).toBeNull();
    expect(normalizeToneAnswer("")).toBeNull();
  });
  it("distinguishes dictionary-tone reading from spoken third-tone sandhi", () => {
    expect(checkToneAnswer("33", greeting, false)).toBe(true);
    expect(checkToneAnswer("23", greeting, false)).toBe(false);
    expect(checkToneAnswer("23", greeting, true)).toBe(true);
    expect(checkToneAnswer("333", greeting, true)).toBe(false);
    expect(checkToneAnswer("22", greeting, true)).toBe(false);
  });
  it("accepts prescribed yi and bu changes without accepting unrelated changes", () => {
    const bu = { ...greeting, hanzi: "不是", pinyin: "bu4 shi4" };
    const yi = { ...greeting, hanzi: "一个", pinyin: "yi1 ge4" };
    expect(checkToneAnswer("24", bu, true)).toBe(true);
    expect(checkToneAnswer("24", yi, true)).toBe(true);
    expect(checkToneAnswer("34", bu, true)).toBe(false);
  });
});

describe("repertoire drill selection", () => {
  it("withholds sentences containing unknown words, untagged content or unresolved names", () => {
    const known = new Set(["hello"]);
    expect(sentenceEligible([{ w: "你好", id: "hello" }, { w: "！", punct: true }], known)).toBe(true);
    expect(sentenceEligible([{ w: "你好", id: "hello" }, { w: "朋友", id: "friend" }], known)).toBe(false);
    expect(sentenceEligible([{ w: "朋友" }], known)).toBe(false);
    expect(sentenceEligible([{ w: "{USER_NAME}", name: true }], known)).toBe(false);
    expect(sentenceEligible([], known)).toBe(false);
  });
  it("uses only real eligible material even when the repertoire is small", () => {
    const round = { id: "hello", word: greeting, tokens: [{ w: "你好", id: "hello" }] };
    expect(pickDrillRounds([])).toEqual([]);
    expect(pickDrillRounds([round])).toEqual(Array(10).fill(round));
  });
  it("normalizes punctuation for audio completeness without collapsing homophones", () => {
    expect(normalizeSpeechText("你好，朋友！")).toBe("你好朋友");
    expect(normalizeSpeechText("他")).not.toBe(normalizeSpeechText("她"));
  });
});
