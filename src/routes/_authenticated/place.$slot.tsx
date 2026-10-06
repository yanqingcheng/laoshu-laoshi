import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell, CouldNotLoad } from "@/components/AppShell";
import { Scene, HotspotList, type Hotspot } from "@/components/Scene";
import { WordText } from "@/components/WordText";
import { Button } from "@/components/ui/button";
import { stageBuilt } from "@/lib/stages";
import { getPlace, markVisited, makePlaceLevel } from "@/lib/place.functions";

export const Route = createFileRoute("/_authenticated/place/$slot")({
  head: () => ({ meta: [{ title: "Neighbour — Laoshu Laoshi" }, { name: "description", content: "Visit a neighbour's room." }, { property: "og:title", content: "Neighbour — Laoshu Laoshi" }, { property: "og:description", content: "Visit a neighbour." }] }),
  component: Place,
});

const NAMES: Record<string, string> = { mouse: "老师 · the mouse teacher", dog: "毛毛 · the dog", cat: "咪咪 · the cat" };
const SPOTS = ["shelf", "table", "floor", "wall"];
const POS: Record<string, [number, number, number, number]> = {
  host: [0.4, 0.25, 0.2, 0.5], tv: [0.05, 0.2, 0.2, 0.25], console: [0.7, 0.65, 0.18, 0.18], book: [0.3, 0.78, 0.16, 0.14],
  shelf: [0.75, 0.15, 0.15, 0.15], table: [0.52, 0.8, 0.12, 0.12], floor: [0.08, 0.75, 0.14, 0.15], wall: [0.28, 0.05, 0.14, 0.14],
};

function Place() {
  const { slot } = Route.useParams();
  const isCustom = slot.startsWith("custom");
  const fn = useServerFn(getPlace);
  const visit = useServerFn(markVisited);
  const make = useServerFn(makePlaceLevel);
  const q = useQuery({ queryKey: ["place", slot], queryFn: () => fn({ data: { slot } }), enabled: isCustom });
  const [said, setSaid] = useState<{ label?: any[]; line: any[] } | null>(null);
  const [making, setMaking] = useState<string | null>(null);
  const d: any = q.data;
  useEffect(() => {
    if (d?.place && d.open && d.firstVisit) visit({ data: { placeId: d.place.id } });
  }, [d?.place?.id, d?.open]);

  const pendingOn = (s: string) => (d?.items ?? []).filter((i: any) => i.surface === s && i.status === "pending").length;
  const surface = (key: string, label: string, stage: number): Hotspot => ({
    key, label: pendingOn(key) ? `${label} ⚙` : label, x: POS[key][0], y: POS[key][1], w: POS[key][2], h: POS[key][3], built: stageBuilt(stage),
  });
  const objects: any[] = d?.place?.objects ?? [];
  const hotspots: Hotspot[] = [
    { ...surface("host", d?.place?.host ? `Talk to ${d.place.host.nameText}` : "Talk to the host", 11), built: stageBuilt(11) },
    surface("tv", "TV · dramas", 12),
    surface("console", "Console · games", 10),
    surface("book", "Book · stories", 15),
    ...SPOTS.map((s, i): Hotspot => {
      const o = objects[i];
      return { key: s, label: o ? `${o.word} · tap to hear` : `${s} (empty)`, x: POS[s][0], y: POS[s][1], w: POS[s][2], h: POS[s][3], built: !!o, onActivate: o ? () => setSaid({ label: o.label, line: o.tap_line }) : undefined };
    }),
  ];

  if (!isCustom)
    return (
      <AppShell title="Neighbour">
        <h1 className="mb-3 text-2xl font-semibold">{NAMES[slot] ?? "Neighbour"}</h1>
        <p className="mb-3 text-sm text-muted-foreground">Bundled neighbours get their lines and objects from "Make bundled places" (not built yet).</p>
        <Scene alt="Neighbour's room" hotspots={hotspots.map((h) => ({ ...h, built: h.built && false }))} />
        <HotspotList hotspots={hotspots.map((h) => ({ ...h, built: false }))} />
      </AppShell>
    );

  if (q.isError) return <AppShell title="Neighbour"><CouldNotLoad onRetry={() => q.refetch()} detail={(q.error as Error).message} /></AppShell>;
  if (!q.data) return <AppShell title="Neighbour"><p className="text-muted-foreground">{q.isLoading ? "Loading…" : "Nothing lives here yet."}</p></AppShell>;
  const p = d.place;

  if (!d.open)
    return (
      <AppShell title="Neighbour">
        <div className="paper-card mx-auto max-w-lg space-y-3 p-6">
          <h1 className="text-xl font-semibold">🔒 {d.source?.title}'s place is not open yet</h1>
          {!d.hostExists && (
            <div>
              <p>{p.status === "making" ? "⚙ The neighbour is being made…" : p.status === "failed" ? "Making the neighbour failed." : "The neighbour hasn't been made yet."}</p>
              {p.status !== "making" && (
                <Button className="mt-2" disabled={!!making} onClick={async () => { setMaking("Making the neighbour…"); const r: any = await make({ data: { placeId: p.id } }); setMaking(r.ok ? null : `Failed: ${r.error}`); q.refetch(); }}>
                  {p.status === "failed" ? "Retry making the neighbour" : "Make the neighbour"}
                </Button>
              )}
              {making && <p className="mt-2 text-sm">{making}</p>}
            </div>
          )}
          {d.need.length > 0 && (
            <>
              <p>Finish these lessons to open it:</p>
              <ul className="space-y-2">
                {d.need.map((l: any) => (
                  <li key={l.id} className="flex items-center justify-between gap-2"><span>{l.title} — {l.left} words left</span><Button asChild size="sm"><Link to="/lesson/$lessonId" params={{ lessonId: l.id }}>Start</Link></Button></li>
                ))}
              </ul>
            </>
          )}
        </div>
      </AppShell>
    );

  const greet = d.firstVisit ? p.lines?.first_greeting : p.lines?.return_greeting;
  return (
    <AppShell title="Neighbour">
      <div className="mb-3">
        {p.scenario?.title && <WordText tokens={p.scenario.title} lexicon={d.lexicon} size="md" />}
        <p className="text-sm text-muted-foreground">{p.scenario?.title_en} · {p.host?.descriptor_en}</p>
      </div>
      <div className="paper-card mb-3 p-4">
        <WordText tokens={p.host?.name ?? []} lexicon={d.lexicon} size="sm" />
        <div className="mt-1"><WordText tokens={greet ?? []} lexicon={d.lexicon} size="md" /></div>
      </div>
      {d.levelDue && <p className="mb-2 text-sm">Level {d.levelDue} is ready to be made. <Button size="sm" variant="outline" disabled={!!making} onClick={async () => { setMaking("Making the next level…"); const r: any = await make({ data: { placeId: p.id } }); setMaking(r.ok ? null : `Failed: ${r.error}`); q.refetch(); }}>Make it</Button> {making}</p>}
      <p className="mb-2 text-xs text-muted-foreground">Temporary stock room until this place's own art is made (stage 9). ⚙ = still being made.</p>
      <Scene alt={`${p.host?.nameText ?? "Neighbour"}'s room`} hotspots={hotspots} />
      {said && (
        <div className="paper-card mt-3 p-4" role="status">
          {said.label && <WordText tokens={said.label} lexicon={d.lexicon} size="sm" />}
          <div className="mt-1"><WordText tokens={said.line} lexicon={d.lexicon} size="md" /></div>
        </div>
      )}
      <HotspotList hotspots={hotspots} />
    </AppShell>
  );
}
