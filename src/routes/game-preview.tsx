import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LessonGamePlayer } from "@/components/LessonGamePlayer";

export const Route = createFileRoute("/game-preview")({ component: GamePreview });

function GamePreview() {
  const [game, setGame] = useState<{html: string; data: any} | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    const read = async (path: string) => {
      const response = await fetch(path, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error("The game could not be loaded.");
      return response;
    };
    Promise.all([read("/games/lanternwing/game.v1.html").then(r => r.text()), read("/games/lanternwing/data.v1.json").then(r => r.json())])
      .then(([html, data]) => setGame({html, data}))
      .catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [attempt]);
  return <main className="mx-auto max-w-5xl p-3 sm:p-5">
    <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div><h1 className="text-xl font-semibold">Lanternwing</h1><p className="text-sm text-muted-foreground">Created by Astra · Numbers practice · Preview</p></div>
      <Link to="/home" className="underline">Back to your room</Link>
    </header>
    {error ? <div role="alert">{error} <button className="underline" onClick={() => setAttempt(a => a + 1)}>Retry</button></div> : !game ? <p>Loading Lanternwing…</p> : <>
      <LessonGamePlayer html={game.html} data={game.data} title="Lanternwing" height="max(480px, calc(100dvh - 170px))" />
      <p className="mt-3 text-sm text-muted-foreground">{game.data.how_to_en}</p>
    </>}
  </main>;
}
