import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { checkDramaVideo, startDramaVideo, type DramaStartInput } from "@/lib/video/drama.functions";
import { WordText, type WTToken } from "@/components/WordText";
import { Button } from "@/components/ui/button";

type Caption = { atS: number; untilS: number; zh: string; en?: string; tokens?: WTToken[] };
type Row = { id: string; status: string; progress: number | null; error: string | null; captions: unknown; aspect: string; url?: string | null; pollError?: string | null };

/** Starts (or resumes) a microdrama video job and plays it with ruby captions overlaid. */
export function DramaVideo({ request, autoStart = false }: { request: DramaStartInput; autoStart?: boolean }) {
  const start = useServerFn(startDramaVideo);
  const check = useServerFn(checkDramaVideo);
  const [row, setRow] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [t, setT] = useState(0);
  const vid = useRef<HTMLVideoElement>(null);

  async function go(retry = false) {
    setBusy(true); setErr(null);
    try {
      const r = (await start({ data: { ...request, retry } })) as Row;
      setRow(await check({ data: { id: r.id } }) as Row);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  useEffect(() => { if (autoStart) void go(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  useEffect(() => {
    if (!row || !['running','queued'].includes(row.status)) return;
    const h = setTimeout(async () => {
      try { setRow(await check({ data: { id: row.id } }) as Row); } catch (e) { setErr((e as Error).message); setRow(previous => previous ? {...previous} : null); }
    }, 8000);
    return () => clearTimeout(h);
  }, [row, check]);

  const caps = ((row?.captions as Caption[]) ?? []);
  const cur = caps.find((c) => t >= c.atS && t < c.untilS);

  return (
    <div className="space-y-2">
      {!row && <Button onClick={() => go()} disabled={busy}>{busy ? "Starting…" : "Make the video"}</Button>}
      {row && row.status !== "ready" && row.status !== "failed" && (
        <p className="text-sm text-muted-foreground" role="status">{row.error ?? 'Making the video…'} {row.progress != null ? `${row.progress}%` : ""}</p>
      )}
      {row?.status === "failed" && (
        <div className="space-y-2 rounded-md border border-destructive/40 p-3 text-sm">
          <p>The video couldn't be made: {row.error}</p>
          <Button variant="outline" size="sm" onClick={() => go(true)} disabled={busy}>Try again</Button>
        </div>
      )}
      {row?.status === "ready" && row.url && (
        <div className={`relative mx-auto overflow-hidden rounded-xl bg-muted ${row.aspect === "9:16" ? "aspect-[9/16] max-w-xs" : "aspect-video max-w-2xl"}`}>
          <video ref={vid} src={row.url} controls playsInline className="h-full w-full object-cover" onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} />
          {cur && (
            <div className="pointer-events-none absolute inset-x-2 bottom-12 rounded-lg bg-background/85 px-3 py-2 text-center">
              {cur.tokens?.length ? <WordText tokens={cur.tokens} size="md" tappable={false} /> : <span className="text-lg">{cur.zh}</span>}
              {cur.en && <div className="text-xs text-muted-foreground">{cur.en}</div>}
            </div>
          )}
        </div>
      )}
      {(err || row?.pollError) && <p className="text-sm text-destructive">{err ?? row?.pollError}</p>}
    </div>
  );
}
