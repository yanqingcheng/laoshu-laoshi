/** Local pitch-only practice. No recognition or learner-memory evidence.
 * YIN CMND + threshold + parabolic interpolation, after de Cheveigné & Kawahara:
 * https://audition.ens.fr/adc/pdf/2002_JASA_YIN.pdf
 */
export type Tone = 1 | 2 | 3 | 4;
export interface PitchFrame { time: number; hz: number | null }
export interface PitchRange { low: number; high: number }
export const TONE_PAIRS = Array.from({ length: 16 }, (_, i) => [Math.floor(i / 4) + 1, i % 4 + 1] as [Tone, Tone]);
export const TONE_NAMES: Record<Tone, string> = { 1: "high and level", 2: "rising", 3: "low, dipping then rising", 4: "falling" };

export function detectPitch(samples: Float32Array, sampleRate: number): number | null {
  if (!Number.isFinite(sampleRate) || sampleRate < 4000 || samples.length < 128) return null;
  // Average adjacent samples to reduce CPU work at browser sample rates.
  const stride = Math.max(1, Math.floor(sampleRate / 12000));
  const n = Math.floor(samples.length / stride);
  const data = new Float32Array(n);
  let energy = 0;
  let mean = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < stride; j++) data[i] += samples[i * stride + j] / stride;
    mean += data[i];
  }
  mean /= n;
  for (let i = 0; i < n; i++) { data[i] -= mean; energy += data[i] ** 2; }
  if (!Number.isFinite(energy) || Math.sqrt(energy / n) < 0.008) return null;
  const rate = sampleRate / stride;
  const minLag = Math.max(2, Math.floor(rate / 700));
  const maxLag = Math.min(Math.floor(rate / 65), Math.floor(n / 2));
  const width = n - maxLag;
  const cmnd = new Float32Array(maxLag + 1);
  cmnd[0] = 1;
  let cumulative = 0;
  for (let lag = 1; lag <= maxLag; lag++) {
    let difference = 0;
    for (let i = 0; i < width; i++) difference += (data[i] - data[i + lag]) ** 2;
    cumulative += difference;
    cmnd[lag] = cumulative ? difference * lag / cumulative : 1;
  }
  for (let lag = minLag; lag < maxLag; lag++) {
    if (cmnd[lag] >= 0.15) continue;
    while (lag + 1 < maxLag && cmnd[lag + 1] < cmnd[lag]) lag++;
    const left = cmnd[lag - 1], middle = cmnd[lag], right = cmnd[lag + 1];
    const denominator = 2 * (2 * middle - right - left);
    const period = lag + (denominator ? (right - left) / denominator : 0);
    const hz = rate / period;
    return hz >= 65 && hz <= 700 ? hz : null;
  }
  return null; // Uncertain/noisy frames must not become a confident pitch.
}

export const semitones = (hz: number) => 12 * Math.log2(hz);
const quantile = (values: number[], fraction: number) => values[Math.floor((values.length - 1) * fraction)];

export function calibrateRange(frames: PitchFrame[]): PitchRange | null {
  const values = frames.flatMap(f => f.hz && Number.isFinite(f.hz) && f.hz >= 65 && f.hz <= 700 ? [semitones(f.hz)] : []).sort((a, b) => a - b);
  if (values.length < 25) return null;
  const low = quantile(values, 0.1), high = quantile(values, 0.9);
  // A steady note is not a measured speaking range; never invent a range.
  return high - low >= 4 && high - low <= 24 ? { low, high } : null;
}

export function targetContour(tone: Tone, x: number): number {
  if (tone === 1) return 0.85;
  if (tone === 2) return 0.3 + 0.6 * x;
  if (tone === 3) return x < 0.5 ? 0.35 - 0.6 * x : 0.05 + 1.1 * (x - 0.5);
  return 0.9 - 0.8 * x;
}

export function analyseContour(frames: PitchFrame[], range: PitchRange, tone: Tone) {
  const voiced = frames.filter((f): f is PitchFrame & { hz: number } => f.hz !== null && Number.isFinite(f.hz) && f.hz > 0);
  if (voiced.length < 10 || range.high <= range.low) return null;
  const start = voiced[0].time, duration = voiced[voiced.length - 1].time - start;
  if (duration < 0.35) return null;
  const inside = frames.filter(f => f.time >= start && f.time <= start + duration);
  if (voiced.length / inside.length < 0.6) return null;
  const points = voiced.map(f => ({ x: (f.time - start) / duration, y: (semitones(f.hz) - range.low) / (range.high - range.low) }));
  const bins: number[] = [];
  for (let i = 0; i < 12; i++) {
    const ys = points.filter(p => Math.min(11, Math.floor(p.x * 12)) === i).map(p => p.y).sort((a, b) => a - b);
    if (ys.length) bins.push(Math.abs(quantile(ys, 0.5) - targetContour(tone, (i + 0.5) / 12)));
  }
  if (bins.length < 9) return null;
  const error = bins.reduce((a, b) => a + b, 0) / bins.length;
  return { points, feedback: error < 0.2 ? "Your pitch line is close to this practice guide." : error < 0.35 ? "Some of your pitch line follows the guide. Try the shape again." : "Your pitch line follows a different shape. Listen to the guide and try again." };
}
