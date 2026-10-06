import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { AppShell, CouldNotLoad } from "@/components/AppShell";
import { QuestionCard, type QCard } from "@/components/QuestionCard";
import { WordText } from "@/components/WordText";
import { getLesson, lessonAnswer, declareKnownFn } from "@/lib/app.functions";
import { toMarked } from "@/lib/chinese/pinyin";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/lesson/$lessonId")({
  head: () => ({ meta: [{ title: "Lesson — Laoshu Laoshi" }, { name: "description", content: "Learn new words with examples and a short quiz." }, { property: "og:title", content: "Lesson — Laoshu Laoshi" }, { property: "og:description", content: "Learn new words." }] }),
  component: Lesson,
});

function Lesson() {
  const { lessonId } = Route.useParams();
  const get = useServerFn(getLesson);
  const answer = useServerFn(lessonAnswer);
  const declare = useServerFn(declareKnownFn);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["lesson", lessonId], queryFn: () => get({ data: { lessonId } }), staleTime: Infinity, refetchOnWindowFocus: false });
  const [step, setStep] = useState(0); // index into words, then quiz
  const [examples, setExamples] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<number[] | null>(null);
  const [missed, setMissed] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [learned, setLearned] = useState<string[]>([]);
  const [reqId, setReqId] = useState(() => crypto.randomUUID());

  const questions = useMemo(() => (q.data ? q.data.questions.filter((x) => !known.has(x.wordId)) : []), [q.data, known]);

  if (q.isError) return <AppShell title="Lesson"><CouldNotLoad onRetry={() => q.refetch()} detail={(q.error as Error).message} /></AppShell>;
  if (!q.data) return <AppShell title="Lesson"><p className="text-muted-foreground">Loading…</p></AppShell>;
  const d = q.data;
  const wordById = new Map(d.words.map((w) => [w.word.id, w.word]));

  if (!d.words.length)
    return (
      <AppShell title={d.lesson.title}>
        <div className="paper-card mx-auto max-w-md p-6 text-center">
          <p className="font-semibold">You've learned every word in this lesson.</p>
          <Button asChild className="mt-4"><Link to="/home">Home</Link></Button>
        </div>
      </AppShell>
    );

  // word screens
  if (step < d.words.length) {
    const w = d.words[step];
    const next = () => { setExamples(false); setStep(step + 1); if (step + 1 === d.words.length) setQueue(null); };
    return (
      <AppShell title={d.lesson.title}>
        <p className="mb-3 text-sm text-muted-foreground">Lesson {d.lesson.ord + 1} · word {step + 1} of {d.words.length} this sitting</p>
        <div className="paper-card mx-auto max-w-xl p-6">
          {!examples ? (
            <>
              <WordText tokens={[{ w: w.word.hanzi, id: w.word.id }]} lexicon={{ [w.word.id]: w.word }} tappable={false} size="lg" />
              <p className="mt-1 text-sm font-semibold text-muted-foreground">{toMarked(w.word.pinyin)}</p>
              <p className="mt-3 text-xl">{w.word.meaning}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => setExamples(true)} disabled={!w.examples.length}>{w.examples.length ? "See examples" : "No examples yet"}</Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await declare({ data: { wordIds: [w.word.id] } });
                    setKnown(new Set([...known, w.word.id]));
                    next();
                  }}
                >
                  I already knew this
                </Button>
                <Button variant="ghost" onClick={next}>Next</Button>
              </div>
            </>
          ) : (
            <>
              <ul className="space-y-5">
                {w.examples.map((s: any) => (
                  <li key={s.id}>
                    <WordText tokens={s.tokens} lexicon={d.lexicon} targetId={w.word.id} size="md" pinyin={d.pinyinOn} />
                    <p className="mt-1 text-muted-foreground">{s.english}</p>
                  </li>
                ))}
              </ul>
              <Button className="mt-6" onClick={next}>Next</Button>
            </>
          )}
        </div>
      </AppShell>
    );
  }

  const order = queue ?? questions.map((_, i) => i);
  const cur = order[0];
  if (!questions.length || cur === undefined) {
    qc.invalidateQueries({ queryKey: ["home"] });
    return (
      <AppShell title={d.lesson.title}>
        <div className="paper-card mx-auto max-w-md p-6 text-center">
          <h2 className="text-2xl font-semibold">Lesson sitting done</h2>
          <p className="mt-2">Words learned: {learned.length ? learned.join("、") : "none this time"}</p>
          {known.size > 0 && <p className="text-sm text-muted-foreground">Marked as already known: {known.size}</p>}
          <p className="mt-2 text-sm text-muted-foreground">New content that opens from these words will appear here once places are built.</p>
          <div className="mt-4 flex justify-center gap-2">
            {d.lesson.remaining - learned.length - known.size > 0 && (
              <Button onClick={() => { qc.removeQueries({ queryKey: ["lesson", lessonId] }); setStep(0); setQueue(null); setLearned([]); setKnown(new Set()); setRound(1); q.refetch(); }}>Next sitting</Button>
            )}
            <Button asChild variant="outline"><Link to="/home">Home</Link></Button>
          </div>
        </div>
      </AppShell>
    );
  }
  const qq = questions[cur];
  const word = wordById.get(qq.wordId)!;
  const card: QCard = { word, skill: qq.skill as "recognise" | "produce", sentence: qq.sentence, lexicon: d.lexicon };
  return (
    <AppShell title={d.lesson.title}>
      <p className="mb-3 text-sm text-muted-foreground">{round > 1 ? `Review mistakes · round ${round}` : `Quiz · ${questions.length - order.length + 1} / ${questions.length}`}</p>
      <QuestionCard
        key={`${cur}-${round}-${order.length}`}
        card={card}
        mode="lesson"
        pinyinOn={d.pinyinOn}
        onSubmit={async (outcome, wasMissed) => {
          const r = await answer({ data: { wordId: qq.wordId, skill: card.skill, correct: outcome !== "fail", requestId: reqId } });
          setReqId(crypto.randomUUID());
          if (r.enteredRepertoire) setLearned((l) => [...l, word.hanzi]);
          const rest = order.slice(1);
          const m = wasMissed ? [...missed, cur] : missed;
          if (!rest.length && m.length) {
            setQueue(m);
            setMissed([]);
            setRound(round + 1);
          } else {
            setQueue(rest);
            setMissed(m);
          }
        }}
      />
    </AppShell>
  );
}
