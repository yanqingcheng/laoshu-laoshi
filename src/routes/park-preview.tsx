import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { RecreationHub } from "@/components/park/RecreationHub";

// Local visual inspection only. Learner/audio endpoints still require authentication.
export const Route = createFileRoute("/park-preview")({
  beforeLoad: () => { if (!import.meta.env.DEV) throw notFound(); },
  component: Preview,
});

function Preview() {
  const [room, setRoom] = useState<"playground" | "gym">("playground");
  return <main className="mx-auto max-w-5xl px-4 py-6">
    <aside className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border p-3 text-sm">
      <span>Local scene preview · word drills require sign-in</span>
      <button className="min-h-12 rounded border px-3" onClick={() => setRoom("playground")}>Preview playground</button>
      <button className="min-h-12 rounded border px-3" onClick={() => setRoom("gym")}>Preview gym</button>
    </aside>
    <RecreationHub key={room} room={room} />
  </main>;
}
