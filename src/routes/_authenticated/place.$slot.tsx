import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Scene, HotspotList, type Hotspot } from "@/components/Scene";
import { stageBuilt } from "@/lib/stages";

export const Route = createFileRoute("/_authenticated/place/$slot")({
  head: () => ({ meta: [{ title: "Neighbour — Laoshu Laoshi" }, { name: "description", content: "Visit a neighbour's room." }, { property: "og:title", content: "Neighbour — Laoshu Laoshi" }, { property: "og:description", content: "Visit a neighbour." }] }),
  component: Place,
});

const NAMES: Record<string, string> = { mouse: "老师 · the mouse teacher", dog: "毛毛 · the dog", cat: "咪咪 · the cat" };

function Place() {
  const { slot } = Route.useParams();
  const hotspots: Hotspot[] = [
    { key: "host", label: "Talk to the host", x: 0.4, y: 0.25, w: 0.2, h: 0.5, built: stageBuilt(11) },
    { key: "tv", label: "TV · dramas", x: 0.05, y: 0.2, w: 0.2, h: 0.25, built: stageBuilt(12) },
    { key: "console", label: "Console · games", x: 0.7, y: 0.65, w: 0.18, h: 0.18, built: stageBuilt(10) },
    { key: "book", label: "Book · stories", x: 0.3, y: 0.78, w: 0.16, h: 0.14, built: stageBuilt(15) },
    { key: "shelf", label: "Shelf object", x: 0.75, y: 0.15, w: 0.15, h: 0.15, built: stageBuilt(8) },
    { key: "table", label: "Table object", x: 0.52, y: 0.8, w: 0.12, h: 0.12, built: stageBuilt(8) },
    { key: "floor", label: "Floor object", x: 0.08, y: 0.75, w: 0.14, h: 0.15, built: stageBuilt(8) },
    { key: "wall", label: "Wall object", x: 0.28, y: 0.05, w: 0.14, h: 0.14, built: stageBuilt(8) },
  ];
  return (
    <AppShell title="Neighbour">
      <h1 className="mb-3 text-2xl font-semibold">{NAMES[slot] ?? "Neighbour"}</h1>
      <Scene alt="Neighbour's room" hotspots={hotspots} />
      <HotspotList hotspots={hotspots} />
    </AppShell>
  );
}
