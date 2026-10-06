import { Link } from "@tanstack/react-router";
import { stageBuilt } from "@/lib/stages";

/** Signpost at the southwest bridge; stays usable on phones as well as desktop. */
export function TownExits() {
  return (
    <nav
      aria-label="Town exits"
      className="absolute bottom-[3%] left-[2%] z-10 flex flex-wrap gap-1 rounded-xl border border-primary/20 bg-paper/95 p-1 shadow-sm"
    >
      {(
        [
          { to: "/park", label: "← Park" },
          { to: "/gym", label: "← Gym" },
        ] as const
      ).map((exit) =>
        stageBuilt(18) ? (
          <Link
            key={exit.to}
            to={exit.to}
            className="inline-flex min-h-12 min-w-16 items-center justify-center rounded-lg px-3 text-sm font-bold text-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary"
          >
            {exit.label}
          </Link>
        ) : (
          <span key={exit.to} className="p-3 text-xs text-muted-foreground">
            {exit.label} · Not built yet
          </span>
        ),
      )}
    </nav>
  );
}
