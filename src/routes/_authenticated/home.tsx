import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell, CouldNotLoad, useBootstrap } from "@/components/AppShell";
import { Scene, HotspotList, type Hotspot } from "@/components/Scene";
import { homeSummary } from "@/lib/app.functions";
import { myBooks } from "@/lib/book.functions";
import { stageBuilt } from "@/lib/stages";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({ meta: [{ title: "Home — Laoshu Laoshi" }, { name: "description", content: "Your room: reviews, lessons, books and the door to town." }, { property: "og:title", content: "Home — Laoshu Laoshi" }, { property: "og:description", content: "Your room in Laoshu Laoshi." }] }),
  component: Home,
});

function Home() {
  const boot = useBootstrap();
  const fn = useServerFn(homeSummary);
  const q = useQuery({ queryKey: ["home"], queryFn: () => fn(), enabled: !!boot.data && !boot.data.courseError });
  const booksFn = useServerFn(myBooks);
  const books = useQuery({ queryKey: ["books"], queryFn: () => booksFn(), enabled: !!boot.data });
  const nav = useNavigate();
  const [panel, setPanel] = useState<null | "desk" | "shelf">(null);
  const due = q.data?.due;
  const hotspots: Hotspot[] = [
    { key: "desk", label: "Desk · reviews", shortLabel: "Reviews", x: 0.28, y: 0.52, w: 0.15, h: 0.10, built: true, badge: due ? String(due.recognise + due.produce || "") || undefined : undefined, onActivate: () => setPanel("desk") },
    { key: "shelf", label: "Shelf · lessons", shortLabel: "Lessons", x: 0.11, y: 0.42, w: 0.28, h: 0.09, built: true, onActivate: () => setPanel("shelf") },
    { key: "camera", label: "Camera · add a book", shortLabel: "Camera", x: 0.21, y: 0.50, w: 0.06, h: 0.09, built: stageBuilt(7), onActivate: () => nav({ to: "/book" }) },
    { key: "console", label: "Console · prepared panda game", shortLabel: "Panda game", x: 0.68, y: 0.54, w: 0.10, h: 0.08, built: true, onActivate: () => nav({ to: "/demo-pack" }) },
    { key: "radio", label: "Radio · listening", shortLabel: "Listening", x: 0.15, y: 0.32, w: 0.11, h: 0.09, built: stageBuilt(16) },
    { key: "phone", label: "Phone · dramas", shortLabel: "Dramas", x: 0.61, y: 0.54, w: 0.065, h: 0.08, built: stageBuilt(12) },
    { key: "plants", label: "Plants · review words", shortLabel: "Review words", x: 0.345, y: 0.20, w: 0.28, h: 0.19, built: true, badge: due ? `${due.recognise} due` : undefined, onActivate: () => nav({ to: "/review/$direction", params: { direction: "recognise" } }) },
    { key: "door", label: "Door · to town", shortLabel: "Town", x: 0.80, y: 0.12, w: 0.17, h: 0.53, built: true, onActivate: () => nav({ to: "/town" }) },
  ];
  return (
    <AppShell title="Home">
      {q.isError && <CouldNotLoad onRetry={() => q.refetch()} detail={(q.error as Error).message} />}
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold">{boot.data?.learner.display_name ? `${boot.data.learner.display_name}'s room` : "Your room"}</h1>
        {q.data && (
          <p className="text-sm text-muted-foreground">
            {q.data.repertoireCount} words known · {q.data.queuedCount} queued
          </p>
        )}
      </div>
      <Scene art="core/home-room.png" alt="Your room, with review plants on the windowsill, a review desk, books, radio, camera, phone, games and a door to town" hotspots={hotspots} />
      <HotspotList hotspots={hotspots} />

      <Sheet open={panel !== null} onOpenChange={(o) => !o && setPanel(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto bg-paper">
          {panel === "desk" && (
            <>
              <SheetHeader><SheetTitle>Today's reviews</SheetTitle></SheetHeader>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {(["recognise", "produce"] as const).map((d) => (
                  <Link key={d} to="/review/$direction" params={{ direction: d }} className="paper-card block p-4 hover:bg-secondary">
                    <div className="font-semibold">{d === "recognise" ? "Chinese → English" : "English → Chinese"}</div>
                    <div className="text-sm text-muted-foreground">{due ? `${due[d]} due` : "…"}</div>
                  </Link>
                ))}
              </div>
            </>
          )}
          {panel === "shelf" && (
            <>
              <SheetHeader><SheetTitle>Lessons</SheetTitle></SheetHeader>
              <div className="p-4">
                <div className="mb-3 rounded-lg border border-dashed p-3 text-sm not-built">Stories · Not built yet</div>
                {(books.data?.books ?? []).map((b: any) => (
                  <div key={b.id} className="mb-4">
                    <h3 className="mb-2 font-semibold">📖 {b.title}</h3>
                    {b.lessons.length === 0 && <p className="text-sm text-muted-foreground">No new words — nothing to learn from this one.</p>}
                    <ol className="space-y-2">
                      {b.lessons.map((l: any) => (
                        <li key={l.id} className="flex items-center gap-3 rounded-lg border bg-background/60 p-3">
                          <div className="flex-1"><div className="font-semibold">{l.title}</div><div className="text-xs text-muted-foreground">{l.learned} / {l.total} words</div></div>
                          {l.learned < l.total ? <Button asChild size="sm"><Link to="/lesson/$lessonId" params={{ lessonId: l.id }}>{l.learned ? "Continue" : "Start"}</Link></Button> : <span className="text-sm text-jade">Done</span>}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
                <h3 className="mb-2 font-semibold">Course</h3>
                <ol className="space-y-2">
                  {q.data?.lessons.map((l) => (
                    <li key={l.id} className="flex items-center gap-3 rounded-lg border bg-background/60 p-3">
                      <span className="w-6 text-right text-sm text-muted-foreground">{l.ord + 1}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{l.title}</div>
                        <div className="text-xs text-muted-foreground">{l.learned} / {l.total} words</div>
                      </div>
                      {l.learned < l.total ? (
                        <Button asChild size="sm"><Link to="/lesson/$lessonId" params={{ lessonId: l.id }}>{l.learned ? "Continue" : "Start"}</Link></Button>
                      ) : (
                        <span className="text-sm text-jade">Done</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
