import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell, CouldNotLoad } from "@/components/AppShell";
import { devStatus, devSynthetic, devReset } from "@/lib/app.functions";
import { checkAiConnection } from "@/lib/ai/openai.functions";
import { STAGES } from "@/lib/stages";
import { WordText } from "@/components/WordText";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dev")({
  head: () => ({ meta: [{ title: "Developer — Laoshu Laoshi" }, { name: "description", content: "Build status, data checks and development tools." }, { property: "og:title", content: "Developer — Laoshu Laoshi" }, { property: "og:description", content: "Build status." }] }),
  component: Dev,
});

const GALLERY = [
  { tokens: [{ w: "我", p: "wo3" }, { w: "的", p: "de5" }, { w: "朋友", p: "peng2 you5" }, { w: "叫", p: "jiao4" }, { w: "什么", p: "shen2 me5" }, { w: "名字", p: "ming2 zi5" }, { w: "？", punct: true }], note: "neutral tones, punctuation" },
  { tokens: [{ w: "女儿", p: "nu:3 er2" }, { w: "在", p: "zai4" }, { w: "哪儿", p: "nar3" }, { w: "？", punct: true }], note: "ü, erhua" },
  { tokens: [{ w: "毛毛虫", p: "mao2 mao2 chong2" }, { w: "很", p: "hen3" }, { w: "饿", p: "e4" }, { w: "，", punct: true }, { w: "它", p: "ta1" }, { w: "吃", p: "chi1" }, { w: "了", p: "le5" }, { w: "一个", p: "yi1 ge4" }, { w: "苹果", p: "ping2 guo3" }, { w: "、", punct: true }, { w: "两个", p: "liang3 ge4" }, { w: "梨", p: "li2" }, { w: "和", p: "he2" }, { w: "很多", p: "hen3 duo1" }, { w: "很多", p: "hen3 duo1" }, { w: "草莓", p: "cao3 mei2" }, { w: "。", punct: true }], note: "long line, repeated and multi-syllable words" },
];

function Dev() {
  const st = useServerFn(devStatus);
  const syn = useServerFn(devSynthetic);
  const reset = useServerFn(devReset);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["dev"], queryFn: () => st() });
  const [msg, setMsg] = useState<string | null>(null);
  const counts = q.data?.counts as Record<string, number> | null;
  return (
    <AppShell title="Developer">
      <h1 className="text-2xl font-semibold">Developer</h1>
      {q.isError && <CouldNotLoad onRetry={() => q.refetch()} detail={(q.error as Error).message} />}
      <section className="paper-card mt-4 p-5">
        <h2 className="text-lg font-semibold">Course data</h2>
        {q.data?.error && <p className="text-destructive">{q.data.error}</p>}
        {counts && (
          <table className="mt-2 text-sm">
            <tbody>
              {Object.entries(q.data!.expected).map(([k, v]) => (
                <tr key={k}><td className="pr-4">{k}</td><td className="pr-4">{counts[k]} / {v}</td><td>{counts[k] === v ? "✓" : "✗ mismatch"}</td></tr>
              ))}
            </tbody>
          </table>
        )}
        {q.data && <p className="mt-2 text-sm text-muted-foreground">This learner: {q.data.repertoire} known, {q.data.queued} queued, {q.data.evidence} evidence rows{q.data.learner.is_synthetic ? " · SYNTHETIC" : ""}.</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={async () => { const r = await syn({ data: { lessons: 4 } }); setMsg(`Synthetic: declared ${r.entered} words known (lessons 1–4) and made 30 cards due now.`); qc.invalidateQueries(); }}>
            Make me a synthetic dev learner (lessons 1–4)
          </Button>
          <Button variant="destructive" onClick={async () => { if (!confirm("Delete all of this account's progress?")) return; await reset(); setMsg("Progress reset."); qc.invalidateQueries(); }}>
            Reset my progress
          </Button>
        </div>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </section>

      <section className="paper-card mt-6 p-5">
        <h2 className="text-lg font-semibold">Build status (true list)</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {STAGES.map((s) => (
            <li key={s.n} className="flex gap-2">
              <span className={`w-20 shrink-0 font-semibold ${s.status === "built" ? "text-jade" : s.status === "partial" ? "text-terracotta" : "text-muted-foreground"}`}>{s.status}</span>
              <span>{s.n}. {s.name}{s.note && <span className="text-muted-foreground"> — {s.note}</span>}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="paper-card mt-6 p-5">
        <h2 className="text-lg font-semibold">Ruby gallery</h2>
        <div className="mt-3 space-y-6">
          {GALLERY.map((g, i) => (
            <div key={i}>
              <WordText tokens={g.tokens} tappable={false} />
              <p className="text-xs text-muted-foreground">{g.note}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
