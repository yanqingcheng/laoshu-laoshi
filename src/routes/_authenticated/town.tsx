import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell, CouldNotLoad, useBootstrap } from "@/components/AppShell";
import { Scene, HotspotList, type Hotspot } from "@/components/Scene";
import { homeSummary } from "@/lib/app.functions";
import { stageBuilt } from "@/lib/stages";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/town")({
  head: () => ({ meta: [{ title: "Town — Laoshu Laoshi" }, { name: "description", content: "Your town of neighbours, shop, park and gym." }, { property: "og:title", content: "Town — Laoshu Laoshi" }, { property: "og:description", content: "Your town." }] }),
  component: Town,
});

// Bundled neighbours open when 80% of their course lesson's words are known.
const BUNDLED = [
  { slot: "mouse", label: "老师 · the mouse teacher", lesson: 0 },
  { slot: "dog", label: "毛毛 · the dog", lesson: 1 },
  { slot: "cat", label: "咪咪 · the cat", lesson: 2 },
];

function Town() {
  const boot = useBootstrap();
  const fn = useServerFn(homeSummary);
  const q = useQuery({ queryKey: ["home"], queryFn: () => fn(), enabled: !!boot.data });
  const nav = useNavigate();
  const [locked, setLocked] = useState<null | { label: string; lessonId: string; title: string; need: number }>(null);
  const L = q.data?.lessons ?? [];
  const pos: Record<string, [number, number]> = {
    home: [0.42, 0.42], mouse: [0.14, 0.18], dog: [0.42, 0.1], cat: [0.7, 0.18], custom1: [0.12, 0.62], custom2: [0.72, 0.62], shop: [0.42, 0.72], park: [0.82, 0.42],
  };
  const spot = (key: string, label: string, built: boolean, extra: Partial<Hotspot> = {}): Hotspot => ({
    key, label, x: pos[key][0], y: pos[key][1], w: 0.16, h: 0.2, built, ...extra,
  });
  const hotspots: Hotspot[] = [
    spot("home", "Home", true, { onActivate: () => nav({ to: "/home" }) }),
    ...BUNDLED.map((b) => {
      const l = L[b.lesson];
      const open = l ? l.learned / l.total >= 0.8 : false;
      return spot(b.slot, b.label, true, {
        badge: open ? undefined : "🔒",
        onActivate: () =>
          open
            ? nav({ to: "/place/$slot", params: { slot: b.slot } })
            : l && setLocked({ label: b.label, lessonId: l.id, title: l.title, need: Math.ceil(l.total * 0.8) - l.learned }),
      });
    }),
    spot("custom1", "Empty plot · your book's place", stageBuilt(8)),
    spot("custom2", "Empty plot · your book's place", stageBuilt(8)),
    spot("shop", "Shop", stageBuilt(17)),
    spot("park", "Park & gym", stageBuilt(18)),
  ];
  return (
    <AppShell title="Town">
      {q.isError && <CouldNotLoad onRetry={() => q.refetch()} />}
      <h1 className="mb-3 text-2xl font-semibold">Town</h1>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[640px]"><Scene alt="Town map, raised three-quarter view" hotspots={hotspots} /></div>
      </div>
      <HotspotList hotspots={hotspots} />
      <Dialog open={!!locked} onOpenChange={(o) => !o && setLocked(null)}>
        <DialogContent className="bg-paper">
          <DialogHeader><DialogTitle>{locked?.label} is not open yet</DialogTitle></DialogHeader>
          <p>Learn {locked?.need} more words from the lesson “{locked?.title}” to open it.</p>
          <Button onClick={() => locked && nav({ to: "/lesson/$lessonId", params: { lessonId: locked.lessonId } })}>Start that lesson</Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
