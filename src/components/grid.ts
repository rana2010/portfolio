/* The background dot grid as a coordinate system. The grid scrolls with the page and one dot column
   sits on the left edge of <main> (see DotField canvasGrid). Use these to place things exactly on dots. */
export const DOT_PITCH = 28.2; // keep in sync with --dot-pitch and the DotField settings in Dots.tsx

const mod = (v: number, m: number) => ((v % m) + m) % m;

/** viewport x of the grid column nearest to x */
export function snapX(x: number) {
  const anchor = document.querySelector("main")?.getBoundingClientRect().left ?? 0;
  return anchor + Math.round((x - anchor) / DOT_PITCH) * DOT_PITCH;
}

/** viewport y of the grid row nearest to y */
export function snapY(y: number) {
  const origin = window.innerHeight / 2 - mod(window.scrollY, DOT_PITCH);
  return origin + Math.round((y - origin) / DOT_PITCH) * DOT_PITCH;
}
