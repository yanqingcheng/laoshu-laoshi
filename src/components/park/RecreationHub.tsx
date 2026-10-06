import { lazy, Suspense, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, DoorOpen, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ToneCircuit = lazy(() => import("@/components/drills/ToneCircuit").then((m) => ({ default: m.ToneCircuit })));
const RepertoireDrill = lazy(() => import("@/components/park/RepertoireDrill").then((m) => ({ default: m.RepertoireDrill })));
type Activity = "circuit" | "pairs" | "see-tones" | "hear-tones" | "hear-pinyin" | "sentence-pinyin";
type Destination = Activity | "town" | "playground" | "gym";
interface Spot { id: Destination; name: string; description: string; x: number; y: number; width: number; height: number }

const PLAYGROUND: Spot[] = [
  { id: "town", name: "Back to town", description: "Through the garden gate", x: 16, y: 12, width: 16, height: 19 },
  { id: "gym", name: "Into the gym", description: "Stretch your voice on the tone circuit", x: 71, y: 18, width: 20, height: 22 },
  { id: "see-tones", name: "Tone Swings", description: "See a word. Find its tones.", x: 5, y: 31, width: 25, height: 25 },
  { id: "sentence-pinyin", name: "Speaking Tubes", description: "Hear a sentence. Spell the missing word.", x: 40, y: 38, width: 23, height: 20 },
  { id: "hear-pinyin", name: "Sound Steps", description: "Hear a word. Put its pinyin together.", x: 5, y: 65, width: 34, height: 18 },
  { id: "hear-tones", name: "Tone Bounce", description: "Listen closely. Catch the tone pattern.", x: 66, y: 65, width: 29, height: 17 },
];
const GYM: Spot[] = [
  { id: "playground", name: "Out to the playground", description: "Fresh air and listening games", x: 4, y: 13, width: 17, height: 31 },
  { id: "town", name: "Back to town", description: "Straight out to the village lane", x: 85, y: 17, width: 13, height: 29 },
  { id: "pairs", name: "Tone Stretch", description: "Calibrate your voice and practise a pair.", x: 24, y: 35, width: 19, height: 9 },
  { id: "circuit", name: "Tone Circuit", description: "Sixteen tone pairs. One lap at your own pace.", x: 23, y: 51, width: 53, height: 29 },
];

export function RecreationHub({ room }: { room: "playground" | "gym" }) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const spots = room === "gym" ? GYM : PLAYGROUND;
  const title = room === "gym" ? "The gym" : "The playground";
  const active = spots.find((spot) => spot.id === activity);
  const destination = (id: Destination) => id === "town" ? "/town" : id === "gym" ? "/gym" : "/park";
  const isExit = (id: Destination) => id === "town" || id === "gym" || id === "playground";
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Park & gym</p>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{active?.name ?? title}</h1>
        </div>
        <nav aria-label="Park and gym exits" className="flex flex-wrap gap-2">
          <Link to="/town" className="inline-flex min-h-12 items-center gap-2 rounded-full border bg-paper px-4 text-sm font-semibold"><ArrowLeft size={16} /> Back to town</Link>
          <Link to={room === "gym" ? "/park" : "/gym"} className="inline-flex min-h-12 items-center gap-2 rounded-full border bg-paper px-4 text-sm font-semibold">{room === "gym" ? "Playground" : "Gym"}<ArrowRight size={16} /></Link>
        </nav>
      </div>
      {activity ? (
        <section aria-label={active?.name}>
          <Button variant="outline" className="mb-5 min-h-12" onClick={() => setActivity(null)}><ArrowLeft size={16} /> Back to {room === "gym" ? "the gym" : "the playground"}</Button>
          <Suspense fallback={<p role="status" className="paper-card p-8">Getting your game ready…</p>}>
            {activity === "circuit" || activity === "pairs" ? <ToneCircuit key={activity} mode={activity} /> : <RepertoireDrill key={activity} mode={activity} onBack={() => setActivity(null)} />}
          </Suspense>
        </section>
      ) : (
        <>
          <p className="mb-4 text-muted-foreground">{room === "gym" ? "Find your comfortable voice, then take a lap around the tone circuit." : "Pick something to play. A little listening, a little pinyin, as many tries as you like."}</p>
          <div className="relative isolate overflow-hidden rounded-3xl border shadow-sm" style={{ aspectRatio: "3 / 2" }}>
            <img src={`/art/park-gym/${room === "gym" ? "gym" : "playground"}-v1.webp`} alt={room === "gym" ? "A wooden gym with a low obstacle circuit, a window overlooking the playground, and separate doors to the playground and town." : "An open village playground with swings, speaking tubes, stepping stones and a trampoline. A moon gate leads to town and an open door leads to the gym."} width="1536" height="1024" className="h-full w-full object-cover" />
            {spots.map((spot) => {
              const className = "group absolute flex min-h-12 min-w-12 items-end justify-center rounded-xl border-2 border-transparent p-1 text-center focus-visible:border-primary focus-visible:outline-none hover:border-primary/60 hover:bg-paper/15";
              const style = { left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.width}%`, height: `${spot.height}%` };
              const label = <span className="rounded-full bg-paper/95 px-2 py-1 text-[10px] font-bold text-primary shadow-sm sm:px-3 sm:text-sm">{spot.name}</span>;
              return isExit(spot.id) ? <Link key={spot.id} to={destination(spot.id)} aria-label={spot.name} className={className} style={style}>{label}</Link> : <button key={spot.id} type="button" aria-label={spot.name} className={className} style={style} onClick={() => setActivity(spot.id as Activity)}>{label}</button>;
            })}
          </div>
          <ul aria-label="Choose an activity or exit" className="mt-5 grid gap-3 sm:grid-cols-2">
            {spots.map((spot) => {
              const content = <><span className="flex items-center gap-2 font-semibold">{isExit(spot.id) ? <DoorOpen size={17} /> : <Volume2 size={17} />}{spot.name}</span><span className="mt-1 block text-sm text-muted-foreground">{spot.description}</span></>;
              const className = "block min-h-20 w-full rounded-2xl border bg-paper p-4 text-left transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary";
              return <li key={spot.id}>{isExit(spot.id) ? <Link to={destination(spot.id)} className={className}>{content}</Link> : <button type="button" className={className} onClick={() => setActivity(spot.id as Activity)}>{content}</button>}</li>;
            })}
          </ul>
          <p className="mt-5 text-sm text-muted-foreground">Play for practice. These games do not change your word reviews.</p>
        </>
      )}
    </div>
  );
}
