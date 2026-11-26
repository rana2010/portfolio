import { useEffect, useRef, useState } from "react";
import { DOT_PITCH } from "./grid";

/* Home page reading thread (route from Rana's sketch). A quiet dotted line, drawn by your scroll, that runs
   underneath the content as one clean meander: level runs across the page joined by round turns at the edges.
   It comes in from the very top, turns under the nav, rounds the headline on the left, drops straight through
   the project rings, rounds About and Career, runs along How I work through each step, comes back over
   "Let's connect", circles "Email, LinkedIn / Say hi!" twice and lands on the footer, where it runs straight: the floor the chat ball
   plays on. It eats the background dots it passes over. Once the ball has played (playBall.ts), scrolling
   back up brings Pac-Man to the tip, eating the line as it goes. On desktop, content stays faint until the line gets
   to it. Phones (≤ 640px): only the straight floor, nothing hidden. Reduced motion: drawn in full. */

type Pt = { x: number; y: number };
type Route = { d: string; floorY: number; straight: number; ox: number; oy: number; rings: Pt[]; stations: Pt[] };
const PHONE = 640;
const EAT_RADIUS = 10;
const PAC_R = 13;
const TOP_SPEED = 800; // px of line per second: the calm pace the line (and Pac-Man) never goes past
const EASE = 1.4; // how quickly it closes the distance to where the scroll is (per second) // Pac-Man's radius, px
// the blocks that appear as the line reaches them: everything after the hero, and the footer
const REVEAL = "main > :not(.home-hero) :is(h2, h3, p, li), .site-footer--hi > *";

export function ReadingPath() {
  const [route, setRoute] = useState<Route | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const drawnRef = useRef<number | null>(null); // how much of the line is drawn, kept across relayouts
  // everything that lights up along the line, measured once per layout: dots of the line itself, grid dots
  // it eats, rings and stations. Each has the length along the line at which it appears.
  const [marks, setMarks] = useState<{
    total: number;
    dots: { x: number; y: number; len: number }[];
    eaten: { x: number; y: number; len: number }[];
    rings: { x: number; y: number; len: number }[];
    stations: { x: number; y: number; len: number }[];
    samples: { len: number; x: number; y: number; at: number }[]; // at: the reading point (page y) that draws it
  } | null>(null);

  // 1) design the route from where things sit on the page
  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main");
    const base = document.querySelector<HTMLElement>(".site-footer__base");
    if (!main || !base) return;
    document.documentElement.classList.add("has-reading-path");

    const build = () => {
      const P = DOT_PITCH;
      const sy = window.scrollY;
      const W = document.documentElement.clientWidth;
      const mainR = main.getBoundingClientRect();
      const ox = ((mainR.left % P) + P) % P;
      const oy = (((window.innerHeight / 2) % P) + P) % P;
      const gx = (x: number) => ox + Math.round((x - ox) / P) * P; // nearest grid column (page coords)
      const gy = (y: number) => oy + Math.round((y - oy) / P) * P; // nearest grid row (page coords)
      const box = (el: Element | null) => {
        const r = el?.getBoundingClientRect();
        return r ? { l: r.left, r: r.right, t: r.top + sy, b: r.bottom + sy, cx: r.left + r.width / 2, cy: r.top + sy + r.height / 2 } : null;
      };
      const $ = (sel: string) => box(document.querySelector(sel));

      const baseB = box(base)!;
      const floorY = gy(baseB.t);
      const floorL = gx(mainR.left);
      const floorR = gx(mainR.right);
      document.documentElement.classList.toggle("has-reading-reveal", W > PHONE && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      if (W <= PHONE) {
        setRoute({ d: `M ${floorL} ${floorY} L ${floorR} ${floorY}`, floorY, straight: floorR - floorL, ox, oy, rings: [], stations: [] });
        return;
      }

      const L = mainR.left, Wm = mainR.width;
      const all = (sel: string) => Array.from(document.querySelectorAll(sel)).map(box).filter(Boolean) as NonNullable<ReturnType<typeof box>>[];
      const sub = $(".home-hero__sub");
      const arrows = all(".work-list__arrow");
      const lastRow = all(".work-list li").pop();
      const label = $(".home-hero__label");
      const para = box(document.querySelector(".home-about__big")?.nextElementSibling ?? null);
      const careerList = $(".home-career");
      const flowLabel = box(document.querySelector(".home-flow-wrap")?.previousElementSibling ?? null);
      const steps = all(".home-flow li");
      const connect = $(".site-footer__links"); // top of the "Say hi!" block
      const hiEl = document.querySelector(".hi__big");
      const hiWords = document.createRange(); // the words "Say hi!", not their full-width block
      if (hiEl) hiWords.selectNodeContents(hiEl);
      const hi = hiEl ? box({ getBoundingClientRect: () => hiWords.getBoundingClientRect() } as Element) : null;
      if (!label || !sub || !lastRow || !arrows.length || !para) return;
      if (!careerList || !flowLabel || !steps.length || !connect || !hi) return;

      const mid = (a: number, b: number) => (a + b) / 2;
      const edgeL = gx(Math.max(P * 0.5, L - P)); // hugging the content's left edge
      const overL = gx(L + P * 0.5); // left turns that brush over the first letters of a label, like the hero's
      const eduX = gx(Math.min(...steps.map((st) => st.l)) - P * 1.2); // just left of the Education / How I work column
      const hugR = gx(Math.min(W - P * 0.5, L + Wm + P)); // hugging the content's right edge
      const edgeR = gx(W + P * 3); // turns on the right swing out past the edge of the screen
      const ringX = gx(arrows[0].cx - P * 2); // near the right edge, a little in from where the arrows were
      const rings: Pt[] = arrows.map((a) => ({ x: ringX, y: a.cy }));
      const laneY = mid(flowLabel.b, Math.min(...steps.map((st) => st.t))); // between the label and the step titles
      const stations: Pt[] = steps.map((st) => ({ x: gx(st.l), y: laneY }));

      // "Email, LinkedIn / Say hi!": two circles round just those two, spiralling outwards, then off the left
      // edge and round onto the floor. The incoming run is the top of the first circle.
      const GAP = P * 0.8;
      const tI = gy(connect.t - P * 0.8), bI = hi.b + P * 0.25; // inner circle: top, bottom
      const lI = gx(Math.min(connect.l, hi.l) - P), rI = gx(hi.r + P * 1.5); // inner circle: left, right
      const sayHi: Pt[] = [{ x: edgeR, y: tI }];
      for (let k = 0; k < 2; k++) {
        const g = GAP * k;
        sayHi.push(
          { x: lI - g, y: tI - g },
          { x: lI - g, y: bI + g },
          { x: rI + g, y: bI + g },
          { x: rI + g, y: tI - g - GAP },
        );
      }
      sayHi.push({ x: lI - GAP * 2, y: tI - GAP * 2 });

      // the route: level runs across the page joined by round turns at the edges. Corners are listed here;
      // "through" points keep the line straight (the drop through the rings).
      type V = Pt & { through?: boolean; r?: number; rv?: number }; // r: turn size; rv: its height only
      const route: V[] = [
        { x: gx(L + Wm * 0.85), y: -P * 2 }, // from the very top of the page
        { x: gx(L + Wm * 0.85), y: gy(label.t - P * 1.5) }, // turning left just above the hero text
        { x: edgeL, y: gy(label.t - P * 1.5) }, // hugging the headline round its left
        { x: edgeL, y: gy(sub.b + P * 1.2) },
        { x: ringX, y: gy(sub.b + P * 1.2), r: P * 12 }, // just under it, a big easy curve down to the work
        ...rings.map((r) => ({ ...r, through: true })), // straight down through every ring
        { x: ringX, y: gy(lastRow.b + P * 1.5), r: P * 12 }, // just under the projects, back across
        { x: overL, y: gy(lastRow.b + P * 1.5) }, // round "About", brushing over it
        { x: overL, y: gy(para.b + P * 0.8) }, // round the statement, just under it
        { x: hugR, y: gy(para.b + P * 0.8) },
        { x: hugR, y: gy(careerList.b + P * 0.6) }, // round Career on the right, just under it
        // round "Education": a wide curve that brushes over the start of the word, then a tight turn into How I work
        { x: eduX, y: gy(careerList.b + P * 0.6), r: P * 16 },
        { x: eduX, y: laneY, rv: P * 5 }, // a wide, low curve into How I work, over its label
        { x: edgeR, y: laneY },
        ...sayHi, // two circles round "Email, LinkedIn / Say hi!", then off the left edge onto the floor
        { x: lI - GAP * 2, y: floorY },
        { x: floorR, y: floorY },
      ];

      // Every corner becomes a quarter ellipse: it takes up to half of each side it shares with another
      // corner (all of a side that ends in a straight-through point), capped so turns stay generous but
      // round, never wider than 1.6× their height.
      const K = 0.5523; // cubic handle length for a quarter circle
      const isCorner = (i: number) => i > 0 && i < route.length - 1 && !route[i].through;
      const side = (i: number, j: number) => Math.hypot(route[j].x - route[i].x, route[j].y - route[i].y) / (isCorner(i) && isCorner(j) ? 2 : 1);
      const f = (n: number) => n.toFixed(1);
      let d = `M ${f(route[0].x)} ${f(route[0].y)}`;
      let floorStart = route[route.length - 2].x;
      for (let i = 1; i < route.length - 1; i++) {
        if (!isCorner(i)) continue;
        const prev = route[i - 1], here = route[i], next = route[i + 1];
        const dir = (v: number) => (Math.abs(v) < 0.5 ? 0 : Math.sign(v)); // runs are level or upright; ignore float dust
        const inDir = { x: dir(here.x - prev.x), y: dir(here.y - prev.y) };
        const outDir = { x: dir(next.x - here.x), y: dir(next.y - here.y) };
        let rIn = side(i - 1, i), rOut = side(i, i + 1);
        const v = inDir.y ? rIn : rOut; // the vertical radius
        const h = Math.min(inDir.x ? rIn : rOut, here.r ?? P * 10, Math.max(v * 1.6, P * 2));
        const vv = Math.min(v, here.rv ?? here.r ?? P * 14);
        if (inDir.x) [rIn, rOut] = [h, vv];
        else [rIn, rOut] = [vv, h];
        const a = { x: here.x - inDir.x * rIn, y: here.y - inDir.y * rIn };
        const b = { x: here.x + outDir.x * rOut, y: here.y + outDir.y * rOut };
        d += ` L ${f(a.x)} ${f(a.y)} C ${f(a.x + inDir.x * rIn * K)} ${f(a.y + inDir.y * rIn * K)} ${f(b.x - outDir.x * rOut * K)} ${f(b.y - outDir.y * rOut * K)} ${f(b.x)} ${f(b.y)}`;
        if (i === route.length - 2) floorStart = b.x;
      }
      d += ` L ${f(floorR)} ${f(floorY)}`;
      setRoute({ d, floorY, straight: floorR - floorStart, ox, oy, rings, stations });
    };

    let t = 0;
    const schedule = () => {
      window.clearTimeout(t);
      t = window.setTimeout(build, 200);
    };
    schedule();
    document.fonts?.ready.then(schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(main);
    window.addEventListener("resize", schedule);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      document.documentElement.classList.remove("has-reading-path", "has-reading-reveal");
    };
  }, []);

  // 2) measure the line once: its dots (every quarter grid step), the grid dots it eats, rings and stations
  useEffect(() => {
    const path = pathRef.current;
    if (!path || !route) return setMarks(null);
    const P = DOT_PITCH;
    const total = path.getTotalLength();
    const samples: { len: number; x: number; y: number; at: number }[] = [];
    const dots: { x: number; y: number; len: number }[] = [];
    const eatenMap = new Map<number, { x: number; y: number; len: number }>();
    const STEP = P / 4;
    for (let l = 0; l <= total; l += 3) {
      const p = path.getPointAtLength(l);
      samples.push({ len: l, x: p.x, y: p.y, at: 0 });
      const c = Math.round((p.x - route.ox) / P), r = Math.round((p.y - route.oy) / P);
      const gx = route.ox + c * P, gy = route.oy + r * P;
      const key = r * 100000 + c;
      if (Math.hypot(gx - p.x, gy - p.y) <= EAT_RADIUS && !eatenMap.has(key)) eatenMap.set(key, { x: gx, y: gy, len: l });
    }
    for (let l = 0; l <= total; l += STEP) {
      const p = path.getPointAtLength(l);
      dots.push({ x: p.x, y: p.y, len: l });
    }
    // pace: close to an even speed along the whole line, so the tip (and Pac-Man) moves with the scroll at a
    // steady rate and never races across a row. The line from its start to the floor spans the page's height.
    const floorLen = Math.max(0, total - route.straight); // the path's measured length can come out a hair short
    const body = samples.filter((q) => q.len <= floorLen);
    const y0 = body[0].y, yEnd = body[body.length - 1].y;
    // half even speed, half the line's own height: steady, and the tip stays on screen
    body.forEach((q) => (q.at = floorLen ? 0.5 * q.y + 0.5 * (y0 + (q.len / floorLen) * (yEnd - y0)) : y0));
    const y1 = body[body.length - 1].at;
    samples.forEach((q) => q.len > floorLen && (q.at = y1));
    const at = (pts: Pt[]) =>
      pts.map((pt) => {
        let best = samples[0];
        for (const q of samples) if (Math.hypot(q.x - pt.x, q.y - pt.y) < Math.hypot(best.x - pt.x, best.y - pt.y)) best = q;
        return { x: best.x, y: best.y, len: best.len }; // exactly on the line
      });
    setMarks({
      total,
      dots,
      eaten: Array.from(eatenMap.values()).sort((a, b) => a.len - b.len),
      rings: at(route.rings),
      stations: at(route.stations),
      samples,
    });
  }, [route]);

  // 3) follow the scroll 1:1. Only the elements that change get touched, straight in the DOM (no re-render).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !marks || !route) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const groups = {
      dots: Array.from(svg.querySelectorAll<SVGCircleElement>(".reading-path__dot")),
      eaten: Array.from(svg.querySelectorAll<SVGCircleElement>(".reading-path__eaten")),
      rings: Array.from(svg.querySelectorAll<SVGCircleElement>(".reading-path__ring")),
      stations: Array.from(svg.querySelectorAll<SVGCircleElement>(".reading-path__station")),
    };
    const head = svg.querySelector<SVGCircleElement>(".reading-path__head");
    // after the ball has played (playBall adds "ball-pacman" to <html>), scrolling back up shows Pac-Man
    // at the tip, facing back along the line and chomping it as it shrinks
    const pacman = svg.querySelector<SVGPathElement>(".reading-path__pacman");
    let lastDrawn = -1;
    let chomping = false;
    // content below the hero stays faint until the line gets to it (desktop only): a project when the line
    // Content appears with the line: each block is wiped into view along the stretch of line that passes it
    // (left to right or right to left along a run, top to bottom along a drop), and wiped out again the same
    // way when the line goes back (scrolling up, or Pac-Man). Desktop only.
    const floorLen = Math.max(0, marks.total - route.straight);
    type Pass = { start: number; end: number; across: boolean; pts: { len: number; x: number; y: number }[] };
    const passOf = (r: DOMRect, top: number): Pass => {
      const bottom = top + r.height;
      const dist = (q: { x: number; y: number }) => Math.hypot(Math.max(r.left - q.x, 0, q.x - r.right), Math.max(top - q.y, 0, q.y - bottom));
      const NEAR = DOT_PITCH * 1.5;
      const body = marks.samples.filter((q) => q.len <= floorLen);
      let i = body.findIndex((q) => dist(q) <= NEAR);
      if (i < 0) {
        // never close: it appears whole where the line comes nearest
        const best = body.reduce((a, q) => (dist(q) < dist(a) ? q : a), body[0]);
        return { start: best.len, end: best.len, across: true, pts: [] };
      }
      let j = i;
      while (j + 1 < body.length && dist(body[j + 1]) <= NEAR * 2) j++;
      const pts = body.slice(i, j + 1);
      const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
      const across = Math.max(...xs) - Math.min(...xs) >= Math.max(...ys) - Math.min(...ys);
      return { start: pts[0].len, end: pts[pts.length - 1].len, across, pts };
    };
    const reveal = document.documentElement.classList.contains("has-reading-reveal")
      ? (() => {
          const els = Array.from(document.querySelectorAll<HTMLElement>(REVEAL));
          return els
            .filter((el) => !els.some((o) => o !== el && o.contains(el))) // outermost blocks only
            .map((el) => {
              el.classList.add("reading-reveal");
              const r = el.getBoundingClientRect();
              const top = r.top + window.scrollY;
              return { el, r, top, pass: passOf(r, top), clip: "hidden" };
            });
        })()
      : [];
    // In: wiped in along the line as it grows. Out: when the line goes back (scrolling up, or Pac-Man) past
    // the middle of a block's stretch, the whole block softly fades away.
    const wipe = (b: (typeof reveal)[number], drawn: number, growing: boolean) => {
      const { pass, r, top } = b;
      let clip = b.clip;
      if (drawn >= pass.end) clip = "";
      else if (!growing) {
        if (drawn < (pass.start + pass.end) / 2) clip = "hidden";
      } else if (drawn >= pass.start) {
        if (b.clip !== "") {
          const done = pass.pts.filter((q) => q.len <= drawn);
          const lo = (k: "x" | "y") => Math.min(...done.map((q) => q[k]));
          const hi = (k: "x" | "y") => Math.max(...done.map((q) => q[k]));
          const px = (n: number) => `${Math.max(0, n).toFixed(0)}px`;
          clip = pass.across
            ? `inset(0 ${px(r.right - hi("x"))} 0 ${px(lo("x") - r.left)})`
            : `inset(${px(lo("y") - top)} 0 ${px(top + r.height - hi("y"))} 0)`;
        }
      } else clip = "hidden";
      if (clip === b.clip) return;
      b.clip = clip;
      b.el.classList.toggle("is-reached", clip !== "hidden");
      if (clip !== "hidden") b.el.style.clipPath = clip; // hidden keeps its last shape and fades out whole
    };
    // the line trails the scroll: it heads for where the scroll says it should be, easing in and never faster
    // than a calm top speed, both on the way down and (as Pac-Man) on the way back up. On load it draws in
    // from the top the same way.
    let drawnSoFar = 0;
    let lastTime = performance.now();
    const shown = { dots: 0, eaten: 0, rings: 0, stations: 0 };
    const sync = (key: keyof typeof shown, list: { len: number }[], drawn: number) => {
      let n = 0;
      while (n < list.length && list[n].len <= drawn) n++;
      const els = groups[key];
      if (n > shown[key]) for (let i = shown[key]; i < n; i++) els[i]?.classList.add("is-on");
      else for (let i = n; i < shown[key]; i++) els[i]?.classList.remove("is-on");
      shown[key] = n;
    };
    const drawnNow = () => {
      const { total, samples } = marks;
      if (reduced) return total;
      const H = window.innerHeight;
      const max = document.documentElement.scrollHeight - H;
      const near = Math.max(0, Math.min(1, 1 - (max - window.scrollY) / (H * 0.6)));
      if (near >= 0.999) return total;
      // the reading point: a third of the way down the screen, a little lower once you start scrolling (the line
      // draws a little ahead of it), and reaching the bottom as the page ends
      const settle = Math.min(1, window.scrollY / (H * 0.5));
      const readY = window.scrollY + H * (0.3 + 0.25 * settle + 0.45 * near);
      // the curve follows the reading point; the straight floor then draws out with the last bit of scroll
      let k = 0;
      while (k < samples.length && samples[k].len <= floorLen && samples[k].at <= readY) k++;
      const upTo = samples[Math.max(0, k - 1)]?.len ?? 0;
      if (upTo < floorLen - 4) return upTo;
      return floorLen + route.straight * Math.min(1, Math.max(0, (near - 0.5) / 0.45));
    };
    // after a relayout (fonts, resize) carry on from where it was; arriving part-way down the page (a link to
    // #work, a restored scroll) starts there instead of drawing in from the top
    drawnSoFar = reduced ? marks.total : drawnRef.current ?? (window.scrollY > 50 ? drawnNow() : 0);
    let raf = 0;
    const frame = () => {
      raf = 0;
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const target = drawnNow();
      const gap = target - drawnSoFar;
      // relaxed when you scroll gently; the further behind it falls (a fast scroll), the faster it catches up
      const far = Math.abs(gap) / 500;
      const step = Math.sign(gap) * Math.min(Math.abs(gap) * (1 - Math.exp(-dt * EASE * (1 + far))), TOP_SPEED * (1 + far * 2) * dt);
      drawnSoFar = Math.abs(gap) < 1 ? target : drawnSoFar + step;
      const drawn = drawnSoFar;
      drawnRef.current = drawn;
      const moving = drawn !== target;
      if (moving) raf = requestAnimationFrame(frame);
      sync("dots", marks.dots, drawn);
      sync("eaten", marks.eaten, drawn);
      sync("rings", marks.rings, drawn);
      sync("stations", marks.stations, drawn);
      const growing = lastDrawn < 0 || drawn >= lastDrawn;
      reveal.forEach((b) => wipe(b, drawn, growing));
      const tip = marks.dots[Math.max(0, shown.dots - 1)];
      const live = drawn > 0 && drawn < marks.total && !!tip;
      // Pac-Man: shows up when the line goes back and stays (resting, mouth half open) until it grows again
      if (lastDrawn >= 0 && drawn < lastDrawn - 0.5) chomping = document.documentElement.classList.contains("ball-pacman");
      else if (lastDrawn >= 0 && drawn > lastDrawn + 0.5) chomping = false;
      lastDrawn = drawn;
      const pac = chomping && live;
      if (head) {
        head.style.opacity = live && !pac ? "1" : "0";
        if (tip) {
          head.setAttribute("cx", String(tip.x));
          head.setAttribute("cy", String(tip.y));
        }
      }
      if (pacman) {
        pacman.classList.toggle("is-on", pac);
        if (pac && tip) {
          const back = marks.dots[Math.max(0, shown.dots - 5)];
          const angle = Math.atan2(back.y - tip.y, back.x - tip.x); // faces the line it is eating
          const m = moving ? 0.12 + 0.55 * Math.abs(Math.sin(now / 110)) : 0.4; // mouth half-angle: chomping while it eats
          const r = PAC_R;
          pacman.setAttribute(
            "d",
            `M 0 0 L ${(r * Math.cos(m)).toFixed(2)} ${(r * Math.sin(m)).toFixed(2)} A ${r} ${r} 0 1 1 ${(r * Math.cos(m)).toFixed(2)} ${(-r * Math.sin(m)).toFixed(2)} Z`,
          );
          pacman.setAttribute("transform", `translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(${((angle * 180) / Math.PI).toFixed(1)})`);
        }
      }
    };
    const onScroll = () => {
      if (!raf) {
        lastTime = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      reveal.forEach((b) => {
        b.el.classList.remove("reading-reveal", "is-reached");
        b.el.style.clipPath = "";
      });
    };
  }, [marks, route]);

  return (
    <svg ref={svgRef} className="reading-path" aria-hidden="true" width="100%" height="100%" data-floor-y={route?.floorY}>
      {route && <path ref={pathRef} d={route.d} className="reading-path__guide" />}
      {marks?.eaten.map((e, i) => <circle key={`e${i}`} className="reading-path__eaten" cx={e.x} cy={e.y} r={4.5} />)}
      {marks?.dots.map((d, i) => <circle key={`d${i}`} className="reading-path__dot" cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={1.3} />)}
      {marks?.rings.map((r, i) => <circle key={`r${i}`} className="reading-path__ring" cx={r.x} cy={r.y} r={14} />)}
      {marks?.stations.map((st, i) => <circle key={`s${i}`} className="reading-path__station" cx={st.x} cy={st.y} r={4} />)}
      <circle className="reading-path__head" r={3.5} style={{ opacity: 0 }} />
      <path className="reading-path__pacman" />
    </svg>
  );
}
