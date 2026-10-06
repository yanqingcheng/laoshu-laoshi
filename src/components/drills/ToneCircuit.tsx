import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePitchRecorder, type PitchTake } from "@/hooks/usePitchRecorder";
import { analyseContour, calibrateRange, targetContour, TONE_NAMES, TONE_PAIRS, type PitchRange, type Tone } from "@/lib/drills/pitch";

const EQUIPMENT = ["Mini hurdles", "Hoops", "Balance beam", "Stepping pads"];
// App-owned markers follow the painted floor circuit; doors are scenery here.
const CIRCUIT_STATIONS = [
  [28, 80], [41, 82], [54, 82], [67, 80],
  [80, 77], [89, 72], [91, 62], [84, 54],
  [71, 50], [58, 49], [45, 49], [32, 50],
  [19, 54], [10, 62], [12, 72], [20, 77],
];

/** Self-contained local speaking practice; mode=pairs is the gym's Tone Stretch mat. */
export function ToneCircuit({ mode = "circuit" }: { mode?: "circuit" | "pairs" }) {
  const [station, setStation] = useState(0);
  const [syllable, setSyllable] = useState<0 | 1>(0);
  const [range, setRange] = useState<PitchRange | null>(null);
  const [take, setTake] = useState<PitchTake | null>(null);
  const [message, setMessage] = useState("");
  const [visited, setVisited] = useState<number[]>([]);
  const [row, setRow] = useState("all");
  const [guidePlaying, setGuidePlaying] = useState(false);
  const guide = useRef<AudioContext | null>(null);
  const recording = usePitchRecorder();
  const pair = TONE_PAIRS[station];
  const tone = pair[syllable];
  const busy = recording.status !== "idle";
  const analysis = range && take ? analyseContour(take.frames, range, tone) : null;
  const stations = TONE_PAIRS.map((_, i) => i).filter(i => row === "all" || Math.floor(i / 4) + 1 === Number(row));
  useEffect(() => () => { const context = guide.current; guide.current = null; void context?.close().catch(() => {}); }, []);

  const select = (index: number) => {
    recording.cancel(); setStation(index); setSyllable(0); setTake(null); setMessage("");
  };
  const next = () => {
    setTake(null); setMessage("");
    if (syllable === 0) { setSyllable(1); return; }
    setVisited(previous => [...new Set([...previous, station])]);
    const nextIndex = (stations.indexOf(station) + 1) % stations.length;
    select(stations[nextIndex]);
  };
  const calibrate = () => {
    setTake(null); setMessage("Hum a gentle slide from comfortably low to comfortably high, then back. Do not strain.");
    void recording.start(6, result => {
      const measured = calibrateRange(result.frames);
      setRange(measured);
      setMessage(measured ? "Your comfortable range is ready. Record each syllable separately to compare its shape." : "We could not measure a clear low-to-high range. Try a quiet room and a gentle wider slide, or practise without recording.");
    });
  };
  const playGuide = async () => {
    try {
      if (typeof AudioContext === "undefined") throw new Error("Audio is unavailable in this browser.");
      const context = new AudioContext(); guide.current = context;
      setGuidePlaying(true);
      await context.resume();
      if (guide.current !== context) { await context.close(); return; }
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.type = "sine"; oscillator.connect(gain); gain.connect(context.destination);
      const base = range ?? { low: 12 * Math.log2(150), high: 12 * Math.log2(280) };
      const start = context.currentTime + 0.05;
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(0.12, start + 0.04);
      gain.gain.setValueAtTime(0.12, start + 0.95); gain.gain.linearRampToValueAtTime(0, start + 1.05);
      for (let i = 0; i <= 30; i++) {
        const hz = 2 ** ((base.low + targetContour(tone, i / 30) * (base.high - base.low)) / 12);
        oscillator.frequency.linearRampToValueAtTime(hz, start + i / 30);
      }
      oscillator.onended = () => { void context.close(); if (guide.current === context) { guide.current = null; setGuidePlaying(false); } };
      oscillator.start(start); oscillator.stop(start + 1.08);
    } catch { const context = guide.current; guide.current = null; void context?.close().catch(() => {}); setMessage("The pitch guide could not play. You can still follow the drawn shape."); setGuidePlaying(false); }
  };

  return <section className="space-y-5" aria-label={mode === "circuit" ? "Tone circuit" : "Tone Stretch"}>
    <div>
      <h2 className="text-2xl font-semibold">{mode === "circuit" ? "The little tone circuit" : "Tone Stretch"}</h2>
      <p className="mt-2 text-sm text-muted-foreground">Say “ma” with each tone shape. This is sound practice: the two syllables are separate, not a Chinese word.</p>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm">Practise <select className="ml-2 rounded border bg-background p-2" value={row} disabled={busy || guidePlaying} onChange={event => { const value = event.target.value; setRow(value); select(value === "all" ? 0 : (Number(value) - 1) * 4); }}><option value="all">All 16 pairs</option>{[1, 2, 3, 4].map(n => <option key={n} value={n}>Starting tone {n}</option>)}</select></label>
      <span className="text-sm">{stations.filter(i => visited.includes(i)).length} / {stations.length} stations visited</span>
    </div>
    {mode === "circuit" && <div style={{ containerType: "inline-size" }}>
      <style>{`.tone-circuit-map-stations { display: none; } .tone-circuit-map-current { display: block; } @container (min-width: 760px) { .tone-circuit-map-stations { display: block; } .tone-circuit-map-current { display: none; } }`}</style>
      <figure className="overflow-hidden rounded-2xl border bg-muted/30">
        <div className="relative aspect-[3/2]">
          <img src="/art/park-gym/gym-v1.webp" alt="A painted gym with mini hurdles, hoops, a balance beam and stepping pads around an oval floor circuit" className="absolute inset-0 h-full w-full object-cover" />
          <div className="tone-circuit-map-stations" role="group" aria-label="Choose an obstacle on the gym circuit">
            {TONE_PAIRS.map((tones, i) => <button key={i} type="button" onClick={() => select(i)} disabled={busy || guidePlaying || !stations.includes(i)} aria-current={station === i ? "step" : undefined} aria-label={`Station ${i + 1}: tones ${tones.join(" then ")}, ${EQUIPMENT[Math.floor(i / 4)]}${visited.includes(i) ? ", visited" : ""}`} className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-lg font-bold shadow-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-40 ${station === i ? "border-white bg-primary text-primary-foreground ring-4 ring-primary/50" : "border-stone-600/60 bg-[#fff8e8]/95 text-stone-800"}`} style={{ left: `${CIRCUIT_STATIONS[i][0]}%`, top: `${CIRCUIT_STATIONS[i][1]}%` }}>{tones.join("")}{visited.includes(i) && <span className="absolute -bottom-1 -right-1 rounded-full bg-[#fff8e8] px-1 text-xs text-stone-800" aria-hidden="true">✓</span>}</button>)}
          </div>
          <div className="tone-circuit-map-current absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-white bg-primary px-5 py-3 text-center text-primary-foreground shadow-lg" aria-hidden="true"><span className="block text-xs font-semibold">Your next obstacle</span><span className="block text-3xl font-bold tracking-widest">{pair.join("")}</span></div>
        </div>
        <figcaption className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"><span><strong>Station {station + 1}: {EQUIPMENT[Math.floor(station / 4)]}</strong> · tones {pair.join(" then ")}</span><span className="text-muted-foreground">Choose any station below.</span></figcaption>
      </figure>
    </div>}
    <ol className="grid grid-cols-4 gap-2 rounded-3xl border-4 border-primary/20 bg-muted/30 p-3" aria-label={mode === "circuit" ? "Circuit stations" : "Tone Stretch pairs"}>
      {stations.map(i => <li key={i}><button type="button" disabled={busy || guidePlaying} onClick={() => select(i)} aria-current={station === i ? "step" : undefined} className={`min-h-16 w-full rounded-xl border p-2 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60 ${station === i ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`} aria-label={`Station ${i + 1}, tones ${TONE_PAIRS[i].join(" then ")}, ${EQUIPMENT[Math.floor(i / 4)]}${visited.includes(i) ? ", visited" : ""}`}><span className="block text-xl font-bold tracking-widest">{TONE_PAIRS[i].join("")}</span><span className="block text-[10px] leading-tight">{mode === "circuit" ? EQUIPMENT[Math.floor(i / 4)] : "Tone pair"}{visited.includes(i) ? " ✓" : ""}</span></button></li>)}
    </ol>
    {stations.every(i => visited.includes(i)) && <p role="status" className="rounded-xl bg-primary/10 p-3">Lap explored! Keep practising any station, or start another lap. <button className="underline" onClick={() => { setVisited([]); select(stations[0]); }} disabled={busy || guidePlaying}>Start another lap</button></p>}
    <div className="rounded-2xl border bg-background/90 p-4">
      <p className="text-sm text-muted-foreground">Pair {pair.join(" · ")} · syllable {syllable + 1} of 2</p>
      <h3 className="mt-1 text-xl font-semibold">Tone {tone}: {TONE_NAMES[tone]}</h3>
      <Contour tone={tone} points={analysis?.points} />
      <p className="text-xs text-muted-foreground">Dashed: illustrative guide · solid: your measured pitch. Low to high uses your calibrated range.</p>
      <p className="mt-3 text-sm">{tone === 3 ? "Use a full dipping tone in this isolated exercise. In connected speech, third tones often stay low; a 33 word normally begins with a rising tone." : "Take a breath, then sustain one comfortable “ma” for about a second."}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => void playGuide()} disabled={busy || guidePlaying}>{guidePlaying ? "Playing…" : "Hear pitch shape"}</Button>
        {range && !busy && <Button onClick={() => { setTake(null); setMessage(""); void recording.start(3, setTake); }} disabled={guidePlaying}>Record syllable {syllable + 1}</Button>}
        {recording.status === "recording" && <Button onClick={recording.stop}>Finish recording</Button>}
        {busy && <Button variant="outline" onClick={recording.cancel}>Cancel recording</Button>}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">The audio guide is a musical pitch shape, not a spoken Mandarin example.</p>
      {recording.status === "requesting" && <p role="status" className="mt-3 text-sm">Waiting for microphone permission…</p>}
      {recording.status === "recording" && <div className="mt-3 text-sm"><p role="status">Recording… {Math.floor(recording.elapsed)} seconds</p><p>{recording.frames.at(-1)?.hz ? "Voice pitch detected" : "Waiting for a clear voiced sound"}</p></div>}
      {take && <div className="mt-4 space-y-2"><p role="status">{analysis?.feedback ?? "Not enough clear voice to compare. Try again in a quiet room, holding the syllable a little longer."}</p>{take.audioUrl ? <audio controls src={take.audioUrl} className="w-full" aria-label="Your recorded syllable" /> : <p className="text-xs">Recording playback is unavailable in this browser.</p>}</div>}
      <div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={next} disabled={busy || guidePlaying}>{syllable === 0 ? "Next syllable" : mode === "circuit" ? "Next obstacle" : "Next pair"}</Button><Button variant="ghost" onClick={() => select(stations[Math.floor(Math.random() * stations.length)])} disabled={busy || guidePlaying}>Random pair</Button></div>
    </div>
    <div className="rounded-xl bg-muted/50 p-4 text-sm">
      <h3 className="font-semibold">Find your comfortable pitch range</h3>
      <p className="mt-1">Hum a gentle low-to-high-to-low slide for six seconds. Stay comfortable; you do not need a singer’s range.</p>
      <Button className="mt-3" variant="outline" onClick={calibrate} disabled={busy || guidePlaying}>{range ? "Recalibrate my voice" : "Calibrate my voice"}</Button>
      {message && <p className="mt-3" role="status">{message}</p>}
      {recording.error && <p className="mt-3 text-destructive" role="alert">{recording.error}</p>}
      <p className="mt-3 text-xs text-muted-foreground">Recording is optional and stays on this device until you leave. Pitch shapes are approximate guidance: they cannot judge pronunciation, syllables or Mandarin fluency. This practice does not change word reviews.</p>
    </div>
  </section>;
}

function Contour({ tone, points }: { tone: Tone; points?: { x: number; y: number }[] }) {
  const coordinates = (ps: { x: number; y: number }[]) => ps.map(p => `${20 + p.x * 320},${115 - Math.max(-0.1, Math.min(1.1, p.y)) * 90}`).join(" ");
  const target = Array.from({ length: 31 }, (_, i) => ({ x: i / 30, y: targetContour(tone, i / 30) }));
  return <svg viewBox="0 0 360 145" className="my-3 w-full max-w-lg rounded-xl bg-muted/40" role="img" aria-label={`Tone ${tone} ${TONE_NAMES[tone]} contour${points ? ", with your recorded pitch overlaid" : ""}`}><path d="M20 15V125H345" fill="none" stroke="currentColor" opacity=".2" /><polyline points={coordinates(target)} fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="6 5" opacity=".45" />{points && <polyline points={coordinates(points)} fill="none" stroke="var(--primary, #3f806e)" strokeWidth="3" strokeLinejoin="round" />}</svg>;
}
