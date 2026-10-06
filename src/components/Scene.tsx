// A 3:2 illustrated scene with real buttons over its objects. Until final art
// is uploaded, a clearly temporary neutral placeholder is drawn.
export interface Hotspot {
  key: string;
  label: string;
  x: number; // fractions of the picture
  y: number;
  w: number;
  h: number;
  built: boolean;
  badge?: string;
  onActivate?: () => void;
}

export function Scene({ art, alt, hotspots }: { art?: string | null; alt: string; hotspots: Hotspot[] }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border" style={{ aspectRatio: "3 / 2" }}>
      {art ? (
        <img src={art} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-placeholder" aria-label={alt}>
          <div className="absolute left-3 top-3 rounded bg-background/80 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            Temporary placeholder — final art not uploaded
          </div>
        </div>
      )}
      {hotspots.map((h) => (
        <button
          key={h.key}
          type="button"
          aria-disabled={!h.built}
          aria-label={h.built ? h.label : `${h.label} — not built yet`}
          onClick={() => h.built && h.onActivate?.()}
          className={`absolute flex flex-col items-center justify-center rounded-xl border-2 border-dashed text-center text-xs font-bold sm:text-sm ${
            h.built ? "border-primary/60 bg-paper/85 text-primary hover:bg-paper" : "not-built border-muted-foreground/40 bg-paper/60 text-muted-foreground"
          } ${art ? "border-transparent bg-transparent hover:border-primary/60 hover:bg-paper/30" : ""}`}
          style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: `${h.w * 100}%`, height: `${h.h * 100}%` }}
        >
          <span className={art ? "rounded bg-paper/90 px-1.5 py-0.5" : ""}>{h.label}</span>
          {!h.built && <span className="text-[10px] font-semibold">Not built yet</span>}
          {h.badge && <span className="absolute -right-1 -top-1 rounded-full bg-terracotta px-1.5 text-[11px] text-terracotta-foreground">{h.badge}</span>}
        </button>
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
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${h.built ? "bg-paper hover:bg-secondary" : "not-built"}`}
          >
            <span className="font-semibold">{h.label}</span>
            {h.badge && <span className="ml-1 text-terracotta">({h.badge})</span>}
            {!h.built && <span className="block text-xs">Not built yet</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
