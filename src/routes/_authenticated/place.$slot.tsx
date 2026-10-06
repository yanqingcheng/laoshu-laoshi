import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Scene, HotspotList, type Hotspot } from "@/components/Scene";
import { stageBuilt } from "@/lib/stages";
import { Art } from "@/components/Art";

export const Route = createFileRoute("/_authenticated/place/$slot")({
  head: () => ({ meta: [{ title: "Neighbour — Laoshu Laoshi" }, { name: "description", content: "Visit a neighbour's room." }, { property: "og:title", content: "Neighbour — Laoshu Laoshi" }, { property: "og:description", content: "Visit a neighbour." }] }),
  component: Place,
});

const NAMES: Record<string, string> = { mouse: "老师 · the mouse teacher", dog: "毛毛 · the dog", cat: "咪咪 · the cat" };

function Place() {
  const { slot } = Route.useParams();
  const hotspots: Hotspot[] = [
    { key: "host", label: "Talk to the host", shortLabel: "Talk", x: 0.75, y: 0.43, w: 0.19, h: 0.40, built: stageBuilt(11) },
    { key: "tv", label: "TV · dramas", shortLabel: "Dramas", x: 0.05, y: 0.43, w: 0.2, h: 0.18, built: stageBuilt(12) },
    { key: "console", label: "Console · games", shortLabel: "Games", x: 0.26, y: 0.63, w: 0.08, h: 0.08, built: stageBuilt(10) },
    { key: "book", label: "Book · stories", shortLabel: "Stories", x: 0.39, y: 0.56, w: 0.09, h: 0.07, built: stageBuilt(15) },
    { key: "shelf", label: "Shelf object", x: 0.421, y: 0.239, w: 0.166, h: 0.119, built: stageBuilt(8) },
    { key: "table", label: "Table object", x: 0.602, y: 0.462, w: 0.101, h: 0.113, built: stageBuilt(8) },
    { key: "floor", label: "Floor object", x: 0.089, y: 0.763, w: 0.17, h: 0.132, built: stageBuilt(8) },
    { key: "wall", label: "Wall object", x: 0.69, y: 0.15, w: 0.21, h: 0.26, built: stageBuilt(8) },
  ];
  return (
    <AppShell title="Neighbour">
      <h1 className="mb-3 text-2xl font-semibold">{NAMES[slot] ?? "Neighbour"}</h1>
      <Scene art="core/stock-room.png" alt="Neighbour's room with a television, storybook, console and display spaces" hotspots={hotspots}>
        {["mouse", "dog", "cat"].includes(slot) && <Art file={`core/${slot}-neutral.png`}
          className="pointer-events-none absolute object-contain" style={{ left: "73%", top: "39%", width: "23%", height: "46%" }} />}
      </Scene>
      <HotspotList hotspots={hotspots} />
    </AppShell>
  );
}
