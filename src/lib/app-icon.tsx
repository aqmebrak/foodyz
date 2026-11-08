import { ImageResponse } from "next/og";

/** Same artwork as src/app/icon.svg (basil tile, white F, yolk dot). */
export function renderAppIcon(
  size: number,
  { rounded = false, scale = 1 }: { rounded?: boolean; scale?: number } = {},
) {
  const c = 64;
  return new ImageResponse(
    (
      <svg width={size} height={size} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx={rounded ? 28 : 0} fill="#2F6B47" />
        <g transform={`translate(${c} ${c}) scale(${scale}) translate(-${c} -${c})`}>
          <path d="M40 34h50v16H58v14h26v15H58v29H40z" fill="#fff" />
          <circle cx="92" cy="92" r="9" fill="#F2B630" />
        </g>
      </svg>
    ),
    { width: size, height: size },
  );
}
