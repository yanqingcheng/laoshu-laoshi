import { describe, expect, it } from "vitest";
import { analyseContour, calibrateRange, detectPitch, targetContour, TONE_PAIRS, type PitchFrame, type Tone } from "./pitch";

function wave(hz: number, rate = 48000, harmonic = false) {
  return Float32Array.from({ length: 4096 }, (_, i) => 0.25 * Math.sin(2 * Math.PI * hz * i / rate) + (harmonic ? 0.4 * Math.sin(4 * Math.PI * hz * i / rate) : 0));
}
function contour(tone: Tone): PitchFrame[] {
  return Array.from({ length: 40 }, (_, i) => ({ time: i / 30, hz: 2 ** ((80 + targetContour(tone, i / 39) * 10) / 12) }));
}
describe("local pitch measurement", () => {
  it.each([80, 110, 220, 440, 650])("detects a %i Hz voice-range sine within 1 percent", hz => {
    expect(Math.abs(detectPitch(wave(hz), 48000)! - hz) / hz).toBeLessThan(0.01);
  });
  it("tracks a fundamental even when its second harmonic is louder", () => {
    expect(detectPitch(wave(180, 44100, true), 44100)).toBeCloseTo(180, 0);
  });
  it("rejects silence, constant DC, invalid input and deterministic noise", () => {
    expect(detectPitch(new Float32Array(4096), 48000)).toBeNull();
    expect(detectPitch(new Float32Array(4096).fill(0.6), 48000)).toBeNull();
    expect(detectPitch(wave(220), 0)).toBeNull();
    let state = 1234;
    const noise = Float32Array.from({ length: 4096 }, () => { state = (1664525 * state + 1013904223) >>> 0; return (state / 2 ** 32 - 0.5) * 0.4; });
    expect(detectPitch(noise, 48000)).toBeNull();
  });
});
describe("calibration and honest contour feedback", () => {
  it("requires enough voice and a measured range rather than inventing one", () => {
    expect(calibrateRange([])).toBeNull();
    expect(calibrateRange(Array.from({ length: 60 }, (_, i) => ({ time: i / 20, hz: 200 })))).toBeNull();
    expect(calibrateRange(contour(2))).not.toBeNull();
  });
  it.each([1, 2, 3, 4] as Tone[])("recognises an illustrative tone %i shape", tone => {
    expect(analyseContour(contour(tone), { low: 80, high: 90 }, tone)?.feedback).toContain("close");
  });
  it("does not call an opposite contour close", () => {
    expect(analyseContour(contour(4), { low: 80, high: 90 }, 2)?.feedback).not.toContain("is close");
  });
  it("withholds feedback for sparse, too-short and heavily unvoiced takes", () => {
    expect(analyseContour(contour(2).slice(0, 4), { low: 80, high: 90 }, 2)).toBeNull();
    expect(analyseContour(contour(2).map(f => ({ ...f, time: f.time / 10 })), { low: 80, high: 90 }, 2)).toBeNull();
    expect(analyseContour(contour(2).map((f, i) => ({ ...f, hz: i % 3 ? null : f.hz })), { low: 80, high: 90 }, 2)).toBeNull();
  });
  it("orders the literal 16-station circuit correctly", () => {
    expect(TONE_PAIRS.map(pair => pair.join("")).join(" ")).toBe("11 12 13 14 21 22 23 24 31 32 33 34 41 42 43 44");
  });
});
