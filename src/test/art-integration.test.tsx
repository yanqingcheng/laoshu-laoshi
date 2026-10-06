import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Scene, HotspotList } from "@/components/Scene";
import { ART_ASSETS, plantFile, TOWN_LAYOUT } from "@/lib/art";

afterEach(cleanup);
describe("Art integration", () => {
  it("ships every original and responsive image referenced by the library", () => {
    for (const asset of ART_ASSETS) {
      for (const url of [asset.png_url, asset.webp_url, asset.small_url]) {
        expect(existsSync(resolve("public", url.slice(1))), url).toBe(true);
      }
    }
  });
  it("has all nine plant states without changing maturity during care", () => {
    const files = new Set<string>();
    for (const maturity of ["seedling", "growing", "thriving"] as const) {
      for (const condition of ["healthy", "drooping", "recovering"] as const) {
        const file = plantFile(maturity, condition);
        expect(ART_ASSETS.some((a) => a.file === file)).toBe(true);
        files.add(file);
      }
    }
    expect(files.size).toBe(9);
  });
  it("preserves square overlay canvases on the 3:2 map and keeps all eight plots in frame", () => {
    expect(Object.keys(TOWN_LAYOUT)).toHaveLength(8);
    for (const box of Object.values(TOWN_LAYOUT)) {
      expect(box.w * 1.5).toBeCloseTo(box.h);
      expect(box.x + box.w).toBeLessThanOrEqual(1);
      expect(box.y + box.h).toBeLessThanOrEqual(1);
    }
  });
  it("keeps scene and list actions equivalent and prevents unbuilt controls from firing", () => {
    const act = vi.fn();
    const blocked = vi.fn();
    const hotspots = [
      { key: "home", label: "Home", x: 0.4, y: 0.5, w: 0.2, h: 0.2, built: true, onActivate: act },
      {
        key: "shop",
        label: "Shop",
        x: 0.1,
        y: 0.5,
        w: 0.2,
        h: 0.2,
        built: false,
        onActivate: blocked,
      },
    ];
    render(
      <>
        <Scene art="core/town-ground.png" alt="Town" hotspots={hotspots} />
        <HotspotList hotspots={hotspots} />
      </>,
    );
    for (const button of screen.getAllByRole("button", { name: "Home" })) fireEvent.click(button);
    expect(act).toHaveBeenCalledTimes(2);
    for (const button of screen.getAllByRole("button", { name: /Shop/ })) fireEvent.click(button);
    expect(blocked).not.toHaveBeenCalled();
  });
});
