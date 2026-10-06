import { Art } from "@/components/Art";
import type { ReactNode } from "react";

// The complete 3:2 canvas keeps all registered overlays aligned.
export interface Hotspot {
  key: string;
  label: string;
  x: number; // fractions of the picture
  y: number;
  w: number;
  h: number;
  built: boolean;
  badge?: string;
  shortLabel?: string;
  marker?: "locked" | "construction" | "pending" | "unseen";
  status?: string;
  onActivate?: () => void;
}

export function Scene({
  art,
  alt,
  hotspots,
  children,
}: {
  art?: string | null;
  alt: string;
  hotspots: Hotspot[];
  children?: ReactNode;
}) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border"
      style={{ aspectRatio: "3 / 2" }}
    >
      {art ? (
        <Art file={art} alt={alt} eager className="absolute inset-0 h-full w-full object-contain" />
      ) : (
        <div className="absolute inset-0 bg-placeholder" aria-label={alt}>
          <div className="absolute left-3 top-3 rounded bg-background/80 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            Temporary placeholder — final art not uploaded
          </div>
        </div>
      )}
      {children}
      {hotspots.map((h) => (
        <button
          key={h.key}
          type="button"
          aria-disabled={!h.built}
          aria-label={`${h.label}${!h.built ? " — not built yet" : h.status ? ` — ${h.status}` : ""}${h.badge ? ` — ${h.badge}` : ""}`}
          title={`${h.label}${!h.built ? " — not built yet" : h.status ? ` — ${h.status}` : ""}`}
          onClick={() => h.built && h.onActivate?.()}
          className={`scene-hotspot absolute flex flex-col items-center justify-end rounded-xl border-2 text-center text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            art
              ? "border-transparent bg-transparent hover:border-primary/60 hover:bg-paper/20"
              : "border-dashed border-primary/60 bg-paper/85"
          } ${h.built ? "text-primary" : "text-muted-foreground"}`}
          style={{
            left: `${h.x * 100}%`,
            top: `${h.y * 100}%`,
            width: `${h.w * 100}%`,
            height: `${h.h * 100}%`,
          }}
        >
          <span className={art ? "scene-label rounded bg-paper/95 px-1.5 py-0.5 shadow-sm" : ""}>
            {h.shortLabel ?? h.label}
          </span>
          {!h.built && <span className="sr-only">Not built yet</span>}
          {h.badge && (
            <span className="absolute -right-1 -top-1 rounded-full bg-terracotta px-1.5 text-[11px] text-terracotta-foreground">
              {h.badge}
            </span>
          )}
        </button>
      ))}
      {hotspots
        .filter((h) => h.marker)
        .map((h) => (
          <Art
            key={`marker-${h.key}`}
            file={`markers/marker-${h.marker}.png`}
            trim
            className="pointer-events-none absolute h-8 w-8"
            style={{
              left: `${(h.x + h.w / 2) * 100}%`,
              top: `${h.y * 100}%`,
              transform: "translateX(-50%)",
            }}
          />
        ))}
    </div>
  );
}

export function HotspotList({ hotspots }: { hotspots: Hotspot[] }) {
  return (
    <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {hotspots.map((h) => (
        <li key={h.key}>
          <button
            type="button"
            aria-disabled={!h.built}
            onClick={() => h.built && h.onActivate?.()}
            className={`min-h-12 w-full rounded-lg border px-3 py-2 text-left text-sm ${h.built ? "bg-paper hover:bg-secondary" : "not-built"}`}
          >
            <span className="font-semibold">{h.label}</span>
            {h.badge && <span className="ml-1 text-terracotta">({h.badge})</span>}
            {!h.built && <span className="block text-xs">Not built yet</span>}
            {h.built && h.status && (
              <span className="block text-xs text-muted-foreground">{h.status}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
