import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell, CouldNotLoad } from "@/components/AppShell";
import { Scene, HotspotList, type Hotspot } from "@/components/Scene";
import { WordText } from "@/components/WordText";
import { Button } from "@/components/ui/button";
import { stageBuilt } from "@/lib/stages";
import { Art } from "@/components/Art";
import { getPlace, markVisited, makePlaceLevel } from "@/lib/place.functions";
import { TalkPanel } from "@/components/TalkPanel";
import { DramaPanel } from "@/components/DramaPanel";

export const Route = createFileRoute("/_authenticated/place/$slot")({
  head: () => ({ meta: [{ title: "Neighbour — Laoshu Laoshi" }, { name: "description", content: "Visit a neighbour's room." }, { property: "og:title", content: "Neighbour — Laoshu Laoshi" }, { property: "og:description", content: "Visit a neighbour." }] }),
  component: Place,
});

const NAMES: Record<string, string> = { mouse: "老师 · the mouse teacher", dog: "毛毛 · the dog", cat: "咪咪 · the cat" };
const SPOTS = ["shelf", "table", "floor", "wall"];
const POS: Record<string, [number, number, number, number]> = {
  host: [0.75, 0.43, 0.19, 0.4], tv: [0.05, 0.43, 0.2, 0.18], console: [0.26, 0.63, 0.08, 0.08], book: [0.39, 0.56, 0.09, 0.07],
  shelf: [0.421, 0.239, 0.166, 0.119], table: [0.602, 0.462, 0.101, 0.113], floor: [0.089, 0.763, 0.17, 0.132], wall: [0.69, 0.15, 0.21, 0.26],
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
  const [talking, setTalking] = useState(false);
  const [watching, setWatching] = useState(false);
  const d: any = q.data;
  useEffect(() => {
    if (d?.place && d.open && d.firstVisit) visit({ data: { placeId: d.place.id } });
  }, [d?.place?.id, d?.open]);

  const pendingOn = (s: string) => (d?.items ?? []).filter((i: any) => i.surface === s && i.status === "pending").length;
  const surface = (key: string, label: string, stage: number): Hotspot => ({
    key, label, shortLabel: ({ host: "Talk", tv: "Dramas", console: "Games", book: "Stories" } as Record<string, string>)[key], marker: pendingOn(key) ? "pending" : undefined, status: pendingOn(key) ? "Being made" : undefined, x: POS[key][0], y: POS[key][1], w: POS[key][2], h: POS[key][3], built: stageBuilt(stage),
  });
  const objects: any[] = d?.place?.objects ?? [];
  const hotspots: Hotspot[] = [
    { ...surface("host", d?.place?.host ? `Talk to ${d.place.host.nameText}` : "Talk to the host", 11), built: stageBuilt(11), onActivate: () => setTalking(true) },
    { ...surface("tv", "TV · dramas", 12), onActivate: () => setWatching(true) },
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
        <Scene art="core/stock-room.png" alt="Neighbour's room" hotspots={hotspots.map((h) => ({ ...h, built: false }))}>
          {["mouse", "dog", "cat"].includes(slot) && <Art file={`core/${slot}-neutral.png`} className="pointer-events-none absolute object-contain" style={{ left: "73%", top: "39%", width: "23%", height: "46%" }} />}
        </Scene>
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
      <p className="mb-2 text-xs text-muted-foreground">Stock room until this neighbour’s own art is ready.</p>
      <Scene art="core/stock-room.png" alt={`${p.host?.nameText ?? "Neighbour"}'s room`} hotspots={hotspots} />
      {talking && <TalkPanel placeId={p.id} hostName={p.host?.nameText ?? "the host"} onClose={() => { setTalking(false); q.refetch(); }} />}
      {watching && <DramaPanel placeId={p.id} onClose={() => setWatching(false)} />}
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
