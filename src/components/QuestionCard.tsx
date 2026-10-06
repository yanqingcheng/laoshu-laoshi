import { useEffect, useRef, useState } from "react";
import { WordText, type LexEntry, type WTToken } from "@/components/WordText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkGap, checkMeaning, checkPinyin } from "@/lib/chinese/answers";
import { toMarked } from "@/lib/chinese/pinyin";

export type Outcome = "fail" | "hard" | "good" | "easy";
export interface QWord {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  accepted: string[];
  altReadings: string[];
  selfScored: boolean;
  synonymReadings?: string[];
}
export interface QSentence {
  tokens: WTToken[];
  english: string;
  gap: string | null;
  answers: string[];
}
export interface QCard {
  word: QWord;
  skill: "recognise" | "produce";
  sentence: QSentence | null;
  lexicon: Record<string, LexEntry>;
}

type Phase = "ask" | "right" | "wrong" | "override" | "self";

export function QuestionCard({
  card,
  mode,
  pinyinOn,
  onSubmit,
}: {
  card: QCard;
  mode: "review" | "lesson";
  pinyinOn: boolean;
  /** Saves; resolve to advance. Reject keeps the card for Retry. */
  onSubmit: (outcome: Outcome, missed: boolean) => Promise<void>;
}) {
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<Phase>(card.word.selfScored && card.skill === "recognise" ? "self" : "ask");
  const [nearly, setNearly] = useState<string[] | null>(null);
  const [usedNearly, setUsedNearly] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<{ o: Outcome; m: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const goodRef = useRef<HTMLButtonElement>(null);
  const hardRef = useRef<HTMLButtonElement>(null);
  const { word, skill, sentence } = card;
  const gapMode = skill === "recognise" && !!sentence?.gap && sentence.answers.length > 0;

  useEffect(() => {
    if (phase === "ask") inputRef.current?.focus();
    if (phase === "right" || phase === "override") (usedNearly ? hardRef : goodRef).current?.focus();
  }, [phase, usedNearly]);

  async function save(o: Outcome, missed: boolean) {
    setSaving(true);
    setSaveErr(null);
    try {
      await onSubmit(o, missed);
    } catch {
      setSaveErr({ o, m: missed });
    } finally {
      setSaving(false);
    }
  }

  function check() {
    if (!answer.trim()) return;
    setNote(null);
    if (skill === "produce") {
      const v = checkPinyin(answer, { hanzi: word.hanzi, pinyin: word.pinyin, altReadings: word.altReadings, synonymReadings: word.synonymReadings });
      if (v.kind === "right") setPhase("right");
      else if (v.kind === "synonym") setNote("That word is right too, but we're looking for a different one.");
      else if (v.kind === "nearly" && !usedNearly) {
        setNearly(v.syllables);
        setUsedNearly(true);
      } else setPhase("wrong");
      return;
    }
    const ok = gapMode ? checkGap(answer, sentence!.answers) : checkMeaning(answer, word.meaning, word.accepted);
    setPhase(ok ? "right" : "wrong");
  }

  const answered = phase !== "ask";
  const correctAnswer = skill === "produce" ? `${toMarked(word.pinyin)} (${word.hanzi})` : gapMode ? sentence!.answers[0] : word.meaning;

  return (
    <div className="paper-card mx-auto w-full max-w-xl p-5 sm:p-7">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {skill === "recognise" ? "Chinese → English" : "English → Chinese"}
      </div>

      <div className="mt-4 min-h-24">
        {sentence ? (
          <WordText
            tokens={sentence.tokens}
            lexicon={card.lexicon}
            targetId={word.id}
            hideTarget={skill === "produce" && !answered}
            pinyin={pinyinOn}
          />
        ) : skill === "recognise" ? (
          <WordText tokens={[{ w: word.hanzi, id: word.id }]} lexicon={{ [word.id]: word }} targetId={word.id} pinyin={pinyinOn} />
        ) : (
          <div className="text-2xl font-semibold">{word.meaning}</div>
        )}
      </div>

      {skill === "produce" && sentence && <p className="mt-3 text-lg">{sentence.english}</p>}
      {skill === "recognise" && gapMode && <p className="mt-3 text-lg">{sentence!.gap}</p>}
      {skill === "recognise" && !gapMode && sentence && answered && <p className="mt-3 text-lg text-muted-foreground">{sentence.english}</p>}
      {skill === "produce" && answered && (
        <div className="mt-2"><WordText tokens={[{ w: word.hanzi, id: word.id }]} lexicon={{ [word.id]: word }} size="md" tappable={false} /></div>
      )}

      {phase === "self" && (
        <div className="mt-5">
          <p className="font-semibold">How well did you understand what it does here?</p>
          <p className="text-sm text-muted-foreground">{word.hanzi}: {word.meaning}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button variant="outline" disabled={saving} onClick={() => save("fail", true)}>Didn't know</Button>
            {(["hard", "good", "easy"] as Outcome[]).map((o) => (
              <Button key={o} variant={o === "good" ? "default" : "secondary"} disabled={saving} onClick={() => save(mode === "lesson" ? "good" : o, false)}>
                {o[0].toUpperCase() + o.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {phase === "ask" && (
        <form className="mt-5" onSubmit={(e) => { e.preventDefault(); check(); }}>
          <label className="text-sm font-semibold text-muted-foreground" htmlFor="ans">
            {skill === "produce" ? "Type the pinyin of the hidden word" : gapMode ? "Type the missing English" : "Type what it means"}
          </label>
          <Input
            id="ans"
            ref={inputRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="mt-1 h-12 text-lg"
          />
          {skill === "produce" && (
            <div className="mt-2 flex gap-2" aria-label="Tone keys">
              {[1, 2, 3, 4].map((t) => (
                <Button key={t} type="button" variant="secondary" size="sm" onClick={() => { setAnswer((a) => a + t); inputRef.current?.focus(); }}>
                  {t}
                </Button>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={() => { setAnswer((a) => a + "ü"); inputRef.current?.focus(); }}>ü</Button>
            </div>
          )}
          {nearly && <p className="mt-2 font-semibold text-terracotta">Nearly: check your tones — {nearly.join(", ")}</p>}
          {note && <p className="mt-2 text-sm text-primary">{note}</p>}
          <Button type="submit" className="mt-4 w-full">Check</Button>
        </form>
      )}

      {(phase === "right" || phase === "override") && (
        <div className="mt-5">
          {phase === "right" && <p className="font-semibold text-jade">Right!</p>}
          {mode === "review" ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Button ref={hardRef} variant="secondary" disabled={saving} onClick={() => save("hard", false)}>Hard</Button>
              <Button ref={goodRef} disabled={saving} onClick={() => save("good", false)}>Good</Button>
              <Button variant="secondary" disabled={saving} onClick={() => save("easy", false)}>Easy</Button>
            </div>
          ) : (
            <Button ref={goodRef} className="mt-2 w-full" disabled={saving} onClick={() => save("good", false)}>Continue</Button>
          )}
        </div>
      )}

      {phase === "wrong" && (
        <div className="mt-5">
          <p className="text-muted-foreground">The answer: <span className="font-semibold text-foreground">{correctAnswer}</span></p>
          <p className="text-sm text-muted-foreground">You wrote: {answer}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button autoFocus disabled={saving} onClick={() => save("fail", true)}>Mark wrong and continue</Button>
            <Button variant="outline" disabled={saving} onClick={() => setPhase("override")}>I was actually right</Button>
          </div>
        </div>
      )}

      {saveErr && (
        <div className="mt-3 flex items-center gap-3 text-sm text-destructive" role="alert">
          Could not save.
          <Button size="sm" variant="outline" onClick={() => save(saveErr.o, saveErr.m)}>Retry</Button>
        </div>
      )}
    </div>
  );
}
