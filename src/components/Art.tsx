import type { CSSProperties } from "react";
import { ART_ASSETS, artUrl } from "@/lib/art";

/** Original canvases for registered scenes; optical bounds for standalone icons. */
export function Art({
  file,
  alt = "",
  className,
  style,
  trim = false,
  eager = false,
}: {
  file: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  trim?: boolean;
  eager?: boolean;
}) {
  const asset = ART_ASSETS.find((a) => a.file === file);
  if (!asset) return null;
  const [width, height] = asset.dimensions;
  const [left, top, right, bottom] = asset.visible_bounds_alpha_gt_8;
  if (trim)
    return (
      <svg
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={!alt}
        className={className}
        style={style}
        viewBox={`${left} ${top} ${right - left} ${bottom - top}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <image href={artUrl(file, true)} width={width} height={height} />
      </svg>
    );
  return (
    <img
      src={artUrl(file, true)}
      srcSet={`${artUrl(file, true)} ${asset.small_dimensions[0]}w, ${artUrl(file)} ${width}w`}
      sizes="(max-width: 640px) 100vw, 992px"
      width={width}
      height={height}
      alt={alt}
      className={className}
      style={style}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
