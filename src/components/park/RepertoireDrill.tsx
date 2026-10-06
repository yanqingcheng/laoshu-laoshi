import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Headphones, Volume2 } from "lucide-react";
import { WordText } from "@/components/WordText";
import { checkPinyin } from "@/lib/chinese/answers";
import { tonesOf } from "@/lib/chinese/pinyin";
import { getDrillAudio, getDrillMaterial } from "@/lib/park/drills.functions";
import { checkToneAnswer, pickDrillRounds, type DrillMode, type DrillRound } from "@/lib/park/drills";

const names: Record<DrillMode, string> = { "see-tones": "Tone Swings", "hear-tones": "Tone Bounce", "hear-pinyin": "Sound Steps", "sentence-pinyin": "Speaking Tubes" };

export function RepertoireDrill({ mode }: { mode: DrillMode; onBack?: () => void }) {
  const fetchMaterial = useServerFn(getDrillMaterial);
  const material = useQuery({ queryKey: ["park-drill-material"], queryFn: () => fetchMaterial(), staleTime: 0, gcTime: 0, refetchOnWindowFocus: false, refetchOnReconnect: false });
  const [rounds, setRounds] = useState<DrillRound[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const makeRounds = useCallback(() => {
    if (!material.data) return;
    const pool = mode === "sentence-pinyin" ? material.data.sentences : material.data.words.map((word) => ({ id: word.id, word, tokens: [{ w: word.hanzi, id: word.id, p: word.pinyin }] }));
    setRounds(pickDrillRounds(pool)); setIndex(0); setScore(0);
  }, [material.data, mode]);
  useEffect(() => { makeRounds(); }, [makeRounds]);
  return <section className="paper-card mx-auto max-w-2xl p-5 sm:p-8">
    <h2 className="text-2xl font-bold">{names[mode]}</h2>
    <p className="mt-2 text-sm text-muted-foreground">Ten little rounds with words you have learned. Practice here does not change your review schedule.</p>
    {material.isPending ? <p className="py-8" role="status">Finding your words…</p> : material.isError ? <div className="py-8" role="alert"><p>Your words could not be loaded.</p><button className="mt-3 underline" onClick={() => material.refetch()}>Retry</button></div> : !rounds.length ? <div className="py-8"><p>{mode === "sentence-pinyin" ? "No complete practice sentences fit your learned vocabulary yet. Try a word drill, or come back after a lesson." : "Your learned words will appear here after a lesson or a known-word import. The tone circuit is available without vocabulary."}</p></div> : index >= rounds.length ? <div className="py-8 text-center" aria-live="polite"><p className="text-3xl">Lap complete!</p><p className="mt-3">{score} of {rounds.length} correct.</p><button className="mt-6 rounded-xl bg-primary px-5 py-3 text-primary-foreground" onClick={makeRounds}>Play another set</button></div> : <DrillQuestion key={`${mode}:${index}:${rounds[index].id}`} mode={mode} round={rounds[index]} index={index} speechConfigured={material.data?.speechConfigured ?? false} onNext={(right) => { setScore((s) => s + Number(right)); setIndex((i) => i + 1); }} />}
  </section>;
}

function DrillQuestion({ mode, round, index, speechConfigured, onNext }: { mode: DrillMode; round: DrillRound; index: number; speechConfigured: boolean; onNext: (right: boolean) => void }) {
  const fetchAudio = useServerFn(getDrillAudio);
  const [answer, setAnswer] = useState("");
  const [verdict, setVerdict] = useState<"right" | "wrong" | "nearly" | null>(null);
  const [audioState, setAudioState] = useState<"idle" | "loading" | "playing" | "ready">("idle");
  const [audioError, setAudioError] = useState<string | null>(null);
  const [heard, setHeard] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alive = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const listening = mode !== "see-tones";
  const tonesOnly = mode === "see-tones" || mode === "hear-tones";
  useEffect(() => { alive.current = true; return () => { alive.current = false; audioRef.current?.pause(); }; }, []);
  async function play() {
    setAudioError(null); setAudioState("loading");
    try {
      let audio = audioRef.current;
      if (!audio) {
        const clip = await fetchAudio({ data: { wordId: round.word.id, ...(round.sentenceId ? { sentenceId: round.sentenceId } : {}) } });
        if (!alive.current) return;
        audio = new Audio(clip.dataUrl);
        audioRef.current = audio;
        audio.onended = () => { if (alive.current) { setHeard(true); setAudioState("ready"); inputRef.current?.focus(); } };
        audio.onerror = () => { if (alive.current) { setAudioError("This recording could not be played. Please retry."); setAudioState("idle"); audioRef.current = null; } };
      }
      audio.currentTime = 0;
      await audio.play();
      if (alive.current) setAudioState("playing");
    } catch (error) {
      if (alive.current) { setAudioState("idle"); setAudioError(error instanceof Error ? error.message : "Audio could not be loaded. Please retry."); }
    }
  }
  return <div className="mt-7">
    <p className="text-sm font-semibold text-muted-foreground">Round {index + 1} of 10</p>
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Rounds completed" aria-valuenow={index} aria-valuemin={0} aria-valuemax={10}><div className="h-full bg-primary transition-all" style={{ width: `${index * 10}%` }} /></div>
    <p className="mt-6 font-semibold">{mode === "see-tones" ? "Look at the word. Type its dictionary tone numbers." : mode === "hear-tones" ? "Listen to the word. Type its tone numbers." : mode === "sentence-pinyin" ? "Listen to the sentence. Type the highlighted word’s pinyin with tones." : "Listen to the word. Type its pinyin with tones."}</p>
    <div className="my-6 rounded-2xl bg-muted/50 p-5 text-center">
      {mode === "see-tones" || mode === "sentence-pinyin" || verdict ? <WordText tokens={round.tokens.map((t) => verdict ? { ...t, p: t.id === round.word.id ? round.word.pinyin : t.p } : { ...t, p: undefined })} targetId={mode === "sentence-pinyin" ? round.word.id : undefined} pinyin={!!verdict} tappable={false} /> : <Headphones className="mx-auto text-primary" size={44} aria-hidden="true" />}
    </div>
    {listening && <div className="mb-5">
      {speechConfigured ? <button type="button" className="flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 disabled:opacity-50" onClick={play} disabled={audioState === "loading" || audioState === "playing"}><Volume2 size={18} />{audioState === "loading" ? "Preparing the recording…" : audioState === "playing" ? "Listening…" : audioError ? "Retry audio" : heard ? "Listen again" : "Listen"}</button> : <p role="status">Practice audio is not configured yet. You can still play the reading drill.</p>}
      <p className="mt-2 text-xs text-muted-foreground">AI-generated voice. Recordings are checked for complete text; pronunciation has not been human reviewed.</p>
      {audioError && <p role="alert" className="mt-3 text-sm text-destructive">{audioError}</p>}
    </div>}
    <form onSubmit={(e) => { e.preventDefault(); if (verdict || !answer.trim() || (listening && !heard)) return; const result = tonesOnly ? (checkToneAnswer(answer, round.word, listening) ? "right" : "wrong") : checkPinyin(answer, round.word).kind; setVerdict(result === "right" ? "right" : result === "nearly" ? "nearly" : "wrong"); }}>
      <label className="block text-sm font-semibold" htmlFor="drill-answer">{tonesOnly ? "Tone numbers" : "Pinyin"}</label>
      <input ref={inputRef} id="drill-answer" autoComplete="off" autoCapitalize="none" spellCheck={false} inputMode={tonesOnly ? "numeric" : "text"} value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={!!verdict} className="mt-2 min-h-12 w-full rounded-xl border bg-background px-4 text-lg disabled:opacity-70" placeholder={tonesOnly ? "e.g. 3 4" : "e.g. ni3 hao3 or nǐ hǎo"} />
      {!verdict && <div className="mt-3 flex flex-wrap gap-2">{[1, 2, 3, 4, 5].map((tone) => <button type="button" key={tone} aria-label={tone === 5 ? "Neutral tone, 5" : `Tone ${tone}`} className="min-h-11 min-w-11 rounded-xl border px-3" onClick={() => { setAnswer((a) => a + tone); inputRef.current?.focus(); }}>{tone}</button>)}<button type="button" className="min-h-11 rounded-xl border px-3" onClick={() => setAnswer((a) => a.slice(0, -1))}>Delete</button></div>}
      <p className="mt-3 text-xs text-muted-foreground">{tonesOnly ? "Use 5 (or 0) for a neutral tone. Spaces are optional." : "Tone marks and tone numbers both work. Use ü, v or u: for ü."}{mode === "hear-tones" && " Dictionary tones and the app’s accepted spoken tone changes both count."}</p>
      {!verdict && <button className="mt-5 min-h-11 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50" disabled={!answer.trim() || (listening && !heard)}>Check answer</button>}
    </form>
    {verdict && <div className="mt-5 rounded-xl border p-4" role="status"><p className="font-semibold">{verdict === "right" ? "That’s right!" : verdict === "nearly" ? "The syllables match; check the tones." : "Have another look at this one."}</p><div className="mt-2"><WordText tokens={[{ w: round.word.hanzi, p: round.word.pinyin }]} tappable={false} /></div><p className="mt-2 text-sm">{round.word.meaning}{tonesOnly && ` · Dictionary tones: ${tonesOf(round.word.pinyin).join(" ")}`}</p><button type="button" className="mt-4 min-h-11 rounded-xl bg-primary px-5 py-2 text-primary-foreground" onClick={() => onNext(verdict === "right")}>{index === 9 ? "Finish set" : "Next round"}</button></div>}
  </div>;
}
