import { useState } from "react";
import { Art } from "@/components/Art";
import { Scene } from "@/components/Scene";
import {
  ART_ASSETS,
  PLANT_BOX,
  plantFile,
  type PlantMaturity,
  type PlantCondition,
} from "@/lib/art";

export function ArtGallery() {
  const [open, setOpen] = useState(false);
  const [maturity, setMaturity] = useState<PlantMaturity>("seedling");
  const [condition, setCondition] = useState<PlantCondition>("healthy");
  return (
    <section className="paper-card mt-6 p-5">
      <h2 className="text-lg font-semibold">Art library · {ART_ASSETS.length} illustrations</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Preview only. These controls do not change learner progress, ownership, affection or plant
        care.
      </p>
      <button
        type="button"
        className="mt-3 min-h-12 rounded-lg border px-4"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? "Close art preview" : "Open art preview"}
      </button>
      {open && (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap gap-4">
            <label className="text-sm">
              Plant maturity{" "}
              <select
                className="ml-2 min-h-12 rounded border bg-paper p-2"
                value={maturity}
                onChange={(e) => setMaturity(e.target.value as PlantMaturity)}
              >
                {(["seedling", "growing", "thriving"] as const).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Plant condition{" "}
              <select
                className="ml-2 min-h-12 rounded border bg-paper p-2"
                value={condition}
                onChange={(e) => setCondition(e.target.value as PlantCondition)}
              >
                {(["healthy", "drooping", "recovering"] as const).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
          <Scene
            art="plants/home-room-empty-windowsill.png"
            alt={`Preview: ${maturity}, ${condition} plants`}
            hotspots={[]}
          >
            <Art
              file={plantFile(maturity, condition)}
              className="pointer-events-none absolute"
              style={{
                left: `${PLANT_BOX.x * 100}%`,
                top: `${PLANT_BOX.y * 100}%`,
                width: `${PLANT_BOX.w * 100}%`,
                height: `${PLANT_BOX.h * 100}%`,
              }}
            />
          </Scene>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {ART_ASSETS.map((asset) => (
              <figure key={asset.file} className="rounded-lg border bg-background p-3">
                <Art
                  file={asset.file}
                  trim={asset.category === "markers" || asset.category === "objects"}
                  className="h-32 w-full object-contain"
                />
                <figcaption className="mt-2 break-words text-xs">
                  <span className="font-semibold">{asset.file}</span>
                  <br />
                  {asset.purpose}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
