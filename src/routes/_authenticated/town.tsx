import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell, CouldNotLoad, useBootstrap } from "@/components/AppShell";
import { Scene, HotspotList, type Hotspot } from "@/components/Scene";
import { homeSummary } from "@/lib/app.functions";
import { townState } from "@/lib/place.functions";
import { stageBuilt } from "@/lib/stages";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BUNDLED, isOpen } from "@/lib/places";
import { Art } from "@/components/Art";
import { TOWN_LAYOUT } from "@/lib/art";
import { TownExits } from "@/components/TownExits";

export const Route = createFileRoute("/_authenticated/town")({
  head: () => ({ meta: [{ title: "Town — Laoshu Laoshi" }, { name: "description", content: "Your town of neighbours, shop, park and gym." }, { property: "og:title", content: "Town — Laoshu Laoshi" }, { property: "og:description", content: "Your town." }] }),
  component: Town,
});


function Town() {
  const boot = useBootstrap();
  const fn = useServerFn(homeSummary);
  const q = useQuery({ queryKey: ["home"], queryFn: () => fn(), enabled: !!boot.data });
  const tfn = useServerFn(townState);
  const t = useQuery({ queryKey: ["town"], queryFn: () => tfn(), enabled: !!boot.data });
  const nav = useNavigate();
  const customSpot = (slot: string) => {
    const pl: any = (t.data ?? []).find((x: any) => x.slot === slot);
    if (!pl) return spot(slot, "Empty plot · bring a book to fill it", true, { shortLabel: "Add a neighbour", onActivate: () => nav({ to: "/book" }) });
    return spot(slot, `${pl.hostName ?? "New neighbour"} · ${pl.title}`, true, {
      marker: pl.marker === "padlock" ? "locked" : pl.marker === "cog" ? "pending" : undefined,
      shortLabel: pl.hostName ?? "New neighbour",
      status: pl.marker === "padlock" ? "Locked" : pl.marker === "cog" ? "Being made" : undefined,
      onActivate: () => nav({ to: "/place/$slot", params: { slot } }),
    });
  };
  const [locked, setLocked] = useState<null | { label: string; lessonId: string; title: string; need: number }>(null);
  const L = q.data?.lessons ?? [];
  const spot = (key: string, label: string, built: boolean, extra: Partial<Hotspot> = {}): Hotspot => ({
    ...TOWN_LAYOUT[key as keyof typeof TOWN_LAYOUT], key, label, built, ...extra,
  });
  const hotspots: Hotspot[] = [
    spot("home", "Home", true, { onActivate: () => nav({ to: "/home" }) }),
    ...BUNDLED.map((b) => {
      const l = L[b.lesson];
      const open = isOpen(l);
      return spot(b.slot, b.label, true, {
        marker: l && !open ? "locked" : undefined,
        status: !l ? "Loading lesson progress" : open ? undefined : "Locked · learn more words to visit",
        onActivate: () =>
          open
            ? nav({ to: "/place/$slot", params: { slot: b.slot } })
            : l && setLocked({ label: b.label, lessonId: l.id, title: l.title, need: Math.ceil(l.total * 0.8) - l.learned }),
      });
    }),
    customSpot("custom1"),
    customSpot("custom2"),
    spot("shop", "Shop", stageBuilt(17)),
    spot("park", "Park & gym", stageBuilt(18), { onActivate: () => nav({ to: "/park" }) }),
    { key: "gym-exit", label: "Gym · across the bridge", x: 0.1, y: 0.86, w: 0.1, h: 0.1, built: stageBuilt(18), onActivate: () => nav({ to: "/gym" }) },
  ];
  return (
    <AppShell title="Town">
      {q.isError && <CouldNotLoad onRetry={() => q.refetch()} />}
      {t.isError && <CouldNotLoad onRetry={() => t.refetch()} />}
      <h1 className="mb-3 text-2xl font-semibold">Town</h1>
      <Scene art="core/town-ground.png" alt="Town map with three neighbours, your home and four plots" hotspots={hotspots.filter((h) => h.key !== "gym-exit")}>
        {Object.entries(TOWN_LAYOUT).map(([key, slot]) => <Art key={key} file={key.startsWith("custom") && (t.data ?? []).some((p: any) => p.slot === key) ? "core/stock-house.png" : slot.file}
          className={`pointer-events-none absolute object-contain ${hotspots.find((h) => h.key === key)?.built ? "" : "grayscale opacity-60"}`}
          style={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%`, width: `${slot.w * 100}%`, height: `${slot.h * 100}%` }} />)}
        <TownExits />
      </Scene>
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
