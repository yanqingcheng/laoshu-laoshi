import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { makePlaceLevel } from "@/lib/place.functions";
import { bookCreate, bookRead, bookPlan, bookReplan, bookApprove, bookCancel, lessonSentences } from "@/lib/book.functions";
import { toMarked } from "@/lib/chinese/pinyin";
import type { Unknown, PlannedLesson } from "@/lib/bookplan";

export const Route = createFileRoute("/_authenticated/book")({
  head: () => ({
    meta: [
      { title: "Bring a book — Laoshu Laoshi" },
      { name: "description", content: "Photograph a picture book and turn its words into lessons." },
      { property: "og:title", content: "Bring a book — Laoshu Laoshi" },
      { property: "og:description", content: "Turn a picture book into lessons." },
    ],
  }),
  component: Book,
});

type Step = "start" | "reading" | "text" | "planning" | "approve" | "approving" | "sentences" | "done";
type Page = { id: string; text: string };
type Plan = { language: string; found: { hanzi: string; pinyin: string; meaning: string; count: number; known: boolean }[]; unknown: Unknown[]; lessons: PlannedLesson[] };

/** Shrink a phone photo to at most 2048px on its long edge (keeps orientation) before upload. */
async function shrink(f: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(f, { imageOrientation: "from-image" } as ImageBitmapOptions);
    const k = Math.min(1, 2048 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob((b) => res(b ?? f), "image/jpeg", 0.88));
  } catch {
    return f;
  }
}

function Book() {
  const create = useServerFn(bookCreate);
  const read = useServerFn(bookRead);
  const plan = useServerFn(bookPlan);
  const replan = useServerFn(bookReplan);
  const approve = useServerFn(bookApprove);
  const cancel = useServerFn(bookCancel);
  const genSent = useServerFn(lessonSentences);
  const makePlace = useServerFn(makePlaceLevel);

  const [step, setStep] = useState<Step>("start");
  const [mode, setMode] = useState<"photos" | "describe">("photos");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [p, setP] = useState<Plan | null>(null);
  const [drop, setDrop] = useState<Set<string>>(new Set());
  const [lessons, setLessons] = useState<PlannedLesson[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{ lessons: { id: string; title: string; kind: string }[]; slot: string | null } | null>(null);
  const [sentReport, setSentReport] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);
  useEffect(() => {
    if (!["reading", "planning", "approving", "sentences"].includes(step)) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [step]);

  const fail = (e: unknown, back: Step) => { setErr((e as Error).message); setStep(back); };

  const go = async () => {
    setErr(null);
    setStep("reading");
    try {
      const { jobId } = await create({ data: { title: title.trim(), kind: mode, topic: mode === "describe" ? topic : undefined } });
      setJobId(jobId);
      const { data: u } = await supabase.auth.getUser();
      const paths: string[] = [];
      if (mode === "photos") {
        for (let i = 0; i < files.length; i++) {
          setProgress(`Uploading photo ${i + 1} of ${files.length}…`);
          const f = files[i];
          const path = `${u.user!.id}/${jobId}/${String(i + 1).padStart(2, "0")}.jpg`;
          const up = await supabase.storage.from("book-pages").upload(path, await shrink(f), { contentType: "image/jpeg", upsert: true });
          if (up.error) throw new Error(`Upload failed: ${up.error.message}`);
          paths.push(path);
        }
        setProgress("Reading the pages…");
      } else setProgress("Writing a short original text on your topic…");
      const r: any = await read({ data: { jobId, paths } });
      if (r.unusable) throw new Error("This book could not be used — it doesn't look like Chinese or English text.");
      setPages(r.pages);
      setStep("text");
    } catch (e) {
      fail(e, "start");
    }
  };

  const findWords = async () => {
    setErr(null);
    setStep("planning");
    setProgress("Finding the words and comparing them with what you know…");
    try {
      const r = (await plan({ data: { jobId: jobId!, pages } })) as Plan;
      setP(r);
      setLessons(r.lessons);
      setDrop(new Set());
      setStep("approve");
    } catch (e) {
      fail(e, "text");
    }
  };

  const toggle = async (key: string) => {
    const d = new Set(drop);
    d.has(key) ? d.delete(key) : d.add(key);
    setDrop(d);
    try { setLessons(await replan({ data: { jobId: jobId!, drop: [...d] } })); } catch (e) { setErr((e as Error).message); }
  };

  const doApprove = async () => {
    setErr(null);
    setStep("approving");
    setProgress("Creating your lessons…");
    try {
      const r: any = await approve({ data: { jobId: jobId!, drop: [...drop] } });
      setResult(r);
      const custom = r.lessons.filter((l: any) => l.kind === "custom");
      setStep("sentences");
      const rep: string[] = [];
      for (let i = 0; i < custom.length; i++) {
        setProgress(`Writing example sentences for ${custom[i].title} (${i + 1} of ${custom.length})…`);
        try {
          const s: any = await genSent({ data: { lessonId: custom[i].id } });
          const withheld = s.report.filter((x: any) => !x.kept).map((x: any) => x.hanzi);
          rep.push(`${custom[i].title}: sentences for ${s.report.length - withheld.length} of ${s.report.length} words${withheld.length ? ` — none passed the word check for ${withheld.join("、")}` : ""}`);
        } catch (e) {
          rep.push(`${custom[i].title}: sentence writing failed — ${(e as Error).message}`);
        }
        setSentReport([...rep]);
      }
      if (r.placeId) {
        setProgress("Making your new neighbour (theme, situation, host and lines)…");
        const m: any = await makePlace({ data: { placeId: r.placeId } });
        rep.push(m.ok ? `New neighbour made in ${Math.round(m.elapsedMs / 1000)}s — their house opens when the lessons above are done.` : `Making the neighbour failed: ${m.error} (retry from their house in town).`);
        setSentReport([...rep]);
      }
      setStep("done");
    } catch (e) {
      fail(e, "approve");
    }
  };

  const move = (i: number, d: number) => {
    const a = [...files];
    const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    setFiles(a);
  };

  const byKey = new Map((p?.unknown ?? []).map((u) => [u.key, u]));
  const unclear = pages.reduce((n, pg) => n + (pg.text.match(/\[\?\]/g)?.length ?? 0), 0);

  return (
    <AppShell title="Bring a book">
      <h1 className="mb-1 text-2xl font-semibold">Bring a book</h1>
      <Steps step={step} />
      {err && <div role="alert" className="paper-card mb-4 border-destructive p-4 text-destructive">{err}</div>}

      {step === "start" && (
        <div className="paper-card space-y-4 p-5">
          <div className="flex gap-2">
            <Button variant={mode === "photos" ? "default" : "outline"} onClick={() => setMode("photos")}>Photograph a book</Button>
            <Button variant={mode === "describe" ? "default" : "outline"} onClick={() => setMode("describe")}>Describe a story instead</Button>
          </div>
          <div>
            <Label htmlFor="bt">Title</Label>
            <Input id="bt" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 好饿的毛毛虫" />
          </div>
          {mode === "photos" ? (
            <div>
              <Label htmlFor="bp">Pages, in reading order</Label>
              <Input id="bp" type="file" accept="image/*" capture="environment" multiple onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])].slice(0, 12))} />
              <p className="mt-1 text-xs text-muted-foreground">Up to 12 photos. They are deleted once you approve or cancel.</p>
              <ol className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {previews.map((src, i) => (
                  <li key={src} className="paper-card overflow-hidden p-2 text-sm">
                    <img src={src} alt={`Page ${i + 1}`} className="aspect-[3/4] w-full rounded object-cover" />
                    <div className="mt-1 flex items-center justify-between">
                      <span>Page {i + 1}</span>
                      <span className="flex gap-1">
                        <button aria-label={`Move page ${i + 1} earlier`} onClick={() => move(i, -1)} className="px-1">↑</button>
                        <button aria-label={`Move page ${i + 1} later`} onClick={() => move(i, 1)} className="px-1">↓</button>
                        <button aria-label={`Remove page ${i + 1}`} onClick={() => setFiles(files.filter((_, k) => k !== i))} className="px-1 text-destructive">✕</button>
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div>
              <Label htmlFor="tp">What should the story be about?</Label>
              <Textarea id="tp" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. a little bear who can't find his red hat" />
            </div>
          )}
          <Button disabled={!title.trim() || (mode === "photos" ? !files.length : !topic.trim())} onClick={go}>Go</Button>
        </div>
      )}

      {["reading", "planning", "approving", "sentences"].includes(step) && (
        <div className="paper-card p-6" aria-live="polite">
          <p className="font-semibold">{progress}</p>
          <p className="mt-1 text-sm text-muted-foreground">{elapsed}s — this uses the AI and can take a minute.</p>
          {sentReport.length > 0 && <ul className="mt-3 list-disc pl-5 text-sm">{sentReport.map((r) => <li key={r}>{r}</li>)}</ul>}
        </div>
      )}

      {step === "text" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Check the text that was read. {unclear ? <strong className="text-terracotta">{unclear} unclear part{unclear > 1 ? "s" : ""} marked [?] — fix what you can.</strong> : "Nothing was marked unclear."}
          </p>
          {pages.map((pg, i) => (
            <div key={pg.id} className="paper-card grid gap-3 p-4 sm:grid-cols-[160px_1fr]">
              {previews[i] ? <img src={previews[i]} alt={`Page ${i + 1}`} className="w-full rounded object-cover" /> : <div className="text-sm text-muted-foreground">Page {i + 1}</div>}
              <div>
                <p className="mb-2 text-lg leading-relaxed" lang="zh-CN">
                  {pg.text.split(/(\[\?\])/).map((part, k) => part === "[?]" ? <mark key={k} className="rounded bg-terracotta/30 px-1">[?]</mark> : <span key={k}>{part}</span>)}
                </p>
                <Label htmlFor={`pg${i}`} className="sr-only">Edit page {i + 1}</Label>
                <Textarea id={`pg${i}`} lang="zh-CN" rows={4} value={pg.text} onChange={(e) => setPages(pages.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)))} />
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Button onClick={findWords} disabled={!pages.some((p) => p.text.trim())}>Find the words</Button>
            <Button variant="outline" onClick={async () => { if (jobId) await cancel({ data: { jobId } }); setStep("start"); setPages([]); }}>Cancel</Button>
          </div>
        </div>
      )}

      {step === "approve" && p && (
        <div className="space-y-4">
          <div className="paper-card p-4">
            <p><strong>{p.found.length}</strong> words found · <strong>{p.found.filter((f) => f.known).length}</strong> you already know · <strong>{p.unknown.length}</strong> new to you</p>
          </div>
          {p.unknown.length === 0 ? (
            <div className="paper-card p-5"><p className="font-semibold">No new words — you know everything in this book.</p></div>
          ) : (
            <>
              <div className="paper-card p-4">
                <h2 className="mb-2 font-semibold">New words (untick any you don't want)</h2>
                <ul className="divide-y divide-border">
                  {p.unknown.map((u) => (
                    <li key={u.key} className="flex items-start gap-3 py-2">
                      <input type="checkbox" className="mt-1.5 h-4 w-4" checked={!drop.has(u.key)} onChange={() => toggle(u.key)} aria-label={`Keep ${u.hanzi}`} />
                      <div className={drop.has(u.key) ? "opacity-50 line-through" : ""}>
                        <span className="text-xl" lang="zh-CN">{u.hanzi}</span> <span className="text-sm text-muted-foreground">{toMarked(u.pinyin)}</span> — {u.meaning}
                        <span className="ml-2 text-xs text-muted-foreground">×{u.count}</span>
                        {!u.inDictionary && <span className="ml-2 rounded bg-terracotta/20 px-1 text-xs">not in the dictionary</span>}
                        {u.companionOf && <span className="ml-2 text-xs text-muted-foreground">goes with {u.companionOf}</span>}
                        {u.evidence && <div className="text-sm text-muted-foreground" lang="zh-CN">“{u.evidence}”</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="paper-card p-4">
                <h2 className="mb-2 font-semibold">Lesson plan</h2>
                <ol className="space-y-2">
                  {lessons.map((l, i) => (
                    <li key={i}>
                      <span className="font-semibold">{i + 1}. {l.kind === "prerequisite" ? `Course lesson first: ${l.title}` : l.title}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{l.keys.length} words</span>
                      <div className="text-lg" lang="zh-CN">{l.keys.map((k) => byKey.get(k)?.hanzi).join("、")}</div>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
          <div className="flex gap-2">
            <Button onClick={doApprove} disabled={p.unknown.length > 0 && lessons.length === 0}>Approve</Button>
            <Button variant="outline" onClick={() => setStep("text")}>Back to the text</Button>
          </div>
        </div>
      )}

      {step === "done" && result && (
        <div className="paper-card space-y-3 p-5">
          <h2 className="text-xl font-semibold">Your book is ready to learn</h2>
          {sentReport.length > 0 && <ul className="list-disc pl-5 text-sm">{sentReport.map((r) => <li key={r}>{r}</li>)}</ul>}
          <ol className="space-y-2">
            {result.lessons.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2">
                <span>{l.kind === "prerequisite" ? "Course lesson: " : ""}{l.title}</span>
                <Button asChild size="sm"><Link to="/lesson/$lessonId" params={{ lessonId: l.id }}>Start</Link></Button>
              </li>
            ))}
          </ol>
          {result.slot ? <p className="text-sm text-muted-foreground">A plot in town is reserved for this book's neighbour (made in a later stage).</p> : <p className="text-sm text-muted-foreground">Both book plots in town are taken.</p>}
          <Button asChild variant="outline"><Link to="/home">Home</Link></Button>
        </div>
      )}
    </AppShell>
  );
}

function Steps({ step }: { step: Step }) {
  const order: [Step[], string][] = [[["start", "reading"], "1 Read"], [["text"], "2 Check text"], [["planning"], "3 Words"], [["approve", "approving"], "4 Approve"], [["sentences", "done"], "5 Lessons"]];
  const idx = order.findIndex(([s]) => s.includes(step));
  return (
    <ol className="mb-4 flex flex-wrap gap-2 text-xs">
      {order.map(([, label], i) => (
        <li key={label} className={`rounded-full px-2 py-0.5 ${i === idx ? "bg-primary text-primary-foreground" : i < idx ? "bg-jade/30" : "bg-muted text-muted-foreground"}`}>{label}</li>
      ))}
    </ol>
  );
}
