import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell, CouldNotLoad } from "@/components/AppShell";
import { QuestionCard } from "@/components/QuestionCard";
import { getReview, gradeReview, undoReview } from "@/lib/app.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/review/$direction")({
  head: () => ({ meta: [{ title: "Review — Laoshu Laoshi" }, { name: "description", content: "Today's review cards." }, { property: "og:title", content: "Review — Laoshu Laoshi" }, { property: "og:description", content: "Today's review cards." }] }),
  component: Review,
});

type Sess = { id: string; round: number; queue: number[]; missed: number[]; grades: { outcome: string; round: number; missed: boolean }[] };

function Review() {
  const { direction } = Route.useParams();
  const dir = direction === "produce" ? "produce" : "recognise";
  const get = useServerFn(getReview);
  const grade = useServerFn(gradeReview);
  const undo = useServerFn(undoReview);
  const qc = useQueryClient();
  const [more, setMore] = useState(false);
  const q = useQuery({ queryKey: ["review", dir, more], queryFn: () => get({ data: { direction: dir, more } }), staleTime: Infinity, refetchOnWindowFocus: false });
  const [sess, setSess] = useState<Sess | null>(null);
  const [reqId, setReqId] = useState(() => crypto.randomUUID());
  useEffect(() => {
    if (q.data) setSess(q.data.session as Sess);
  }, [q.data]);

  if (q.isError) return <AppShell title="Review"><CouldNotLoad onRetry={() => q.refetch()} detail={(q.error as Error).message} /></AppShell>;
  if (!q.data || !sess) return <AppShell title="Review"><p className="text-muted-foreground">Loading…</p></AppShell>;

  const cards = q.data.cards;
  const current = sess.queue[0];
  const total = cards.length;
  const firstRound = sess.grades.filter((g) => g.round === 1);
  const rightFirst = firstRound.filter((g) => !g.missed).length;

  return (
    <AppShell title="Review">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/home" className="text-sm text-primary underline">← Leave review</Link>
        <div className="text-sm text-muted-foreground">
          {sess.round > 1 ? `Review mistakes · round ${sess.round}` : `${Math.min(firstRound.length + 1, total)} / ${total}`}
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={!sess.grades.length}
          onClick={async () => {
            const r = await undo({ data: { sessionId: sess.id } });
            if (r.ok) setSess({ ...sess, round: r.round!, queue: r.queue!, missed: r.missed!, grades: r.grades! });
          }}
        >
          Undo
        </Button>
      </div>
      {total === 0 ? (
        <div className="paper-card mx-auto max-w-md p-6 text-center">
          <p className="font-semibold">Nothing due right now.</p>
          <p className="mt-1 text-sm text-muted-foreground">Learn a lesson from the shelf to add words.</p>
          <Button asChild className="mt-4"><Link to="/home">Back home</Link></Button>
        </div>
      ) : current === undefined ? (
        <div className="paper-card mx-auto max-w-md p-6 text-center">
          <h2 className="text-2xl font-semibold">Done for now</h2>
          <p className="mt-2">{total} cards reviewed</p>
          <p className="text-muted-foreground">{Math.round((rightFirst / Math.max(1, firstRound.length)) * 100)}% right first time</p>
          <div className="mt-4 flex justify-center gap-2">
            {q.data.stillDue > 0 && (
              <Button onClick={() => { setMore(true); qc.removeQueries({ queryKey: ["review", dir, true] }); }}>Review more ({q.data.stillDue})</Button>
            )}
            <Button asChild variant="outline"><Link to="/home">Home</Link></Button>
          </div>
        </div>
      ) : (
        <QuestionCard
          key={`${current}-${sess.grades.length}`}
          card={cards[current] as never}
          mode="review"
          pinyinOn={q.data.pinyinOn}
          onSubmit={async (outcome, missed) => {
            const r = await grade({ data: { sessionId: sess.id, index: current, outcome, requestId: reqId, missed } });
            setReqId(crypto.randomUUID());
            setSess({ ...sess, round: r.round, queue: r.queue, missed: r.missed, grades: r.grades });
            qc.invalidateQueries({ queryKey: ["home"] });
          }}
        />
      )}
    </AppShell>
  );
}
