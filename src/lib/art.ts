// Runtime art metadata is deliberately separate from the immutable generation logs.
import manifest from "../../public/art/asset-manifest.json";

export const ART_ASSETS = manifest.assets;
export type ArtFile = (typeof ART_ASSETS)[number]["file"];
export function artUrl(file: string, small = false) {
  const asset = ART_ASSETS.find((a) => a.file === file);
  if (!asset) throw new Error(`Unknown art asset: ${file}`);
  return small ? asset.small_url : asset.webp_url;
}

export const TOWN_LAYOUT = {
  mouse: { file: "core/house-mouse.png", x: 0.115, y: 0.0306, w: 0.17, h: 0.255 },
  dog: { file: "core/house-dog.png", x: 0.415, y: 0.0206, w: 0.17, h: 0.255 },
  cat: { file: "core/house-cat.png", x: 0.725, y: 0.0306, w: 0.17, h: 0.255 },
  custom1: { file: "core/empty-plot.png", x: 0.135, y: 0.2715, w: 0.17, h: 0.255 },
  custom2: { file: "core/empty-plot.png", x: 0.695, y: 0.2715, w: 0.17, h: 0.255 },
  shop: { file: "core/empty-plot.png", x: 0.115, y: 0.5415, w: 0.17, h: 0.255 },
  home: { file: "core/house-home.png", x: 0.415, y: 0.5506, w: 0.17, h: 0.255 },
  park: { file: "core/empty-plot.png", x: 0.735, y: 0.5415, w: 0.17, h: 0.255 },
} as const;

export type PlantMaturity = "seedling" | "growing" | "thriving";
export type PlantCondition = "healthy" | "drooping" | "recovering";
// Callers supply persisted state. Artwork never invents growth or care thresholds.
export function plantFile(maturity: PlantMaturity, condition: PlantCondition) {
  const name =
    maturity === "thriving" && condition !== "healthy"
      ? condition
      : `${maturity}${condition === "healthy" ? "" : `-${condition}`}`;
  return `plants/plants-${name}.png`;
}
export const PLANT_BOX = { x: 526 / 1536, y: 160 / 1024, w: 430 / 1536, h: 287 / 1024 };
