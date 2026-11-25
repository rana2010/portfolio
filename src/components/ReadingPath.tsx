import { useEffect, useRef, useState } from "react";
import { DOT_PITCH } from "./grid";

/* Home page reading thread (route from Rana's sketch). A quiet dotted line, drawn by your scroll, that runs
   underneath the content as one clean meander: level runs across the page joined by round turns at the edges.
   It comes in from the very top, turns under the nav, rounds the headline on the left, drops straight through
   the project rings, rounds About and Career, runs along How I work through each step, comes back over
   "Let's connect", circles "Let's connect / Say hi!" twice and lands on the footer, where it runs straight: the floor the chat ball
   plays on. It eats the background dots it passes over. On desktop, content stays faint until the line gets
   to it. Phones (≤ 640px): only the straight floor, nothing hidden. Reduced motion: drawn in full. */

type Pt = { x: number; y: number };
type Route = { d: string; floorY: number; straight: number; ox: number; oy: number; rings: Pt[]; stations: Pt[] };
const PHONE = 640;
const EAT_RADIUS = 10;
const SIDEWAYS = 0.4; // how much scroll a sideways pixel of line costs, relative to a downward one
// the blocks that appear as the line reaches them: everything after the hero, and the footer
const REVEAL = "main > :not(.home-hero) :is(h2, h3, p, li), .site-footer--hi > *";

export function ReadingPath() {
  const [route, setRoute] = useState<Route | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
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
      const navH = document.querySelector<HTMLElement>(".site-nav")?.offsetHeight ?? 64;
      const all = (sel: string) => Array.from(document.querySelectorAll(sel)).map(box).filter(Boolean) as NonNullable<ReturnType<typeof box>>[];
      const sub = $(".home-hero__sub");
      const head = $(".work-list__head");
      const rows = all(".work-list li");
      const arrows = all(".work-list__arrow");
      const aboutLabel = $(".home-about__label");
      const para = box(document.querySelector(".home-about__big")?.nextElementSibling ?? null);
      const [career, eduLabel] = all(".home-about__sub");
      const careerList = $(".home-career");
      const flowLabel = box(document.querySelector(".home-flow-wrap")?.previousElementSibling ?? null);
      const steps = all(".home-flow li");
      const connect = $(".site-footer__label");
      const hiEl = document.querySelector(".hi__big");
      const hiWords = document.createRange(); // the words "Say hi!", not their full-width block
      if (hiEl) hiWords.selectNodeContents(hiEl);
      const hi = hiEl ? box({ getBoundingClientRect: () => hiWords.getBoundingClientRect() } as Element) : null;
      if (!sub || !head || !rows.length || !arrows.length || !aboutLabel || !para || !career || !eduLabel) return;
      if (!careerList || !flowLabel || !steps.length || !connect || !hi) return;

      const mid = (a: number, b: number) => (a + b) / 2;
      const edgeL = gx(Math.max(P * 0.5, L - P * 2)); // just past the content, near the screen's left edge
      const edgeR = gx(W + P * 3); // turns on the right swing out past the edge of the screen
      const ringX = arrows[0].cx;
      const rings: Pt[] = arrows.map((a) => ({ x: a.cx, y: a.cy }));
      const laneY = mid(flowLabel.b, Math.min(...steps.map((st) => st.t))); // between the label and the step titles
      const stations: Pt[] = steps.map((st) => ({ x: gx(st.l), y: laneY }));

      // "Let's connect / Say hi!": two circles round just those two, spiralling outwards, then off the left
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
      type V = Pt & { through?: boolean };
      const route: V[] = [
        { x: gx(L + Wm * 0.85), y: -P * 2 }, // from the very top of the page
        { x: gx(L + Wm * 0.85), y: gy(navH + P * 2) }, // turning left under the nav
        { x: edgeL, y: gy(navH + P * 2) }, // round the left of the headline
        { x: edgeL, y: gy(mid(sub.b, head.t)) },
        { x: ringX, y: gy(mid(sub.b, head.t)) }, // across to the work
        ...rings.map((r) => ({ ...r, through: true })), // straight down through every ring
        { x: ringX, y: gy(mid(rows[rows.length - 1].b, aboutLabel.t)) }, // back across to About
        { x: edgeL, y: gy(mid(rows[rows.length - 1].b, aboutLabel.t)) },
        { x: edgeL, y: gy(mid(para.b, career.t)) }, // under the statement, round Career
        { x: gx(L + Wm * 0.58), y: gy(mid(para.b, career.t)) },
        { x: gx(L + Wm * 0.58), y: gy(mid(careerList.b, eduLabel.t)) },
        { x: edgeL, y: gy(mid(careerList.b, eduLabel.t)) },
        { x: edgeL, y: laneY }, // down beside Education, along How I work
        { x: edgeR, y: laneY },
        ...sayHi, // two circles round "Let's connect / Say hi!", then off the left edge onto the floor
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
        const h = Math.min(inDir.x ? rIn : rOut, P * 10, Math.max(v * 1.6, P * 2));
        const vv = Math.min(v, P * 14);
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
    // pace: sideways runs take scroll too (not only going down), so the line never jumps across a row.
    // Each sample costs its drop plus part of its sideways travel; the total is spread over the page's height.
    const floorLen = Math.max(0, total - route.straight); // the path's measured length can come out a hair short
    const body = samples.filter((q) => q.len <= floorLen);
    let cost = 0;
    body.forEach((q, i) => {
      if (i) cost += Math.abs(q.y - body[i - 1].y) + Math.abs(q.x - body[i - 1].x) * SIDEWAYS;
      q.at = cost;
    });
    const y0 = body[0].y, y1 = body[body.length - 1].y;
    body.forEach((q) => (q.at = cost ? y0 + (q.at / cost) * (y1 - y0) : y0)); // phones: floor only, no cost
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
    // content below the hero stays faint until the line gets to it (desktop only): a project when the line
    // reaches its ring, a How I work step at its station, anything else when the line passes its first line
    const floorLen = Math.max(0, marks.total - route.straight);
    const reachY = (y: number) => marks.samples.find((q) => q.y >= y)?.len ?? floorLen;
    const reveal = document.documentElement.classList.contains("has-reading-reveal")
      ? (() => {
          const els = Array.from(document.querySelectorAll<HTMLElement>(REVEAL));
          const projects = Array.from(document.querySelectorAll(".work-list li"));
          const steps = Array.from(document.querySelectorAll(".home-flow li"));
          return els
            .filter((el) => !els.some((o) => o !== el && o.contains(el))) // outermost blocks only
            .map((el) => {
              el.classList.add("reading-reveal");
              const r = el.getBoundingClientRect();
              const len =
                marks.rings[projects.indexOf(el)]?.len ??
                marks.stations[steps.indexOf(el)]?.len ??
                reachY(r.top + window.scrollY + Math.min(r.height / 2, DOT_PITCH));
              return { el, len: Math.min(len, floorLen) };
            });
        })()
      : [];
    // on load the line slides in from the left edge, up to where the reading point is
    const introStart = performance.now();
    const INTRO_MS = 1400;
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
      // the reading point: a third of the way down at the top of the page, settling a little ahead of the
      // reader (two thirds down) after half a screen of scroll, and reaching the bottom as the page ends
      const settle = Math.min(1, window.scrollY / (H * 0.5));
      const readY = window.scrollY + H * (0.3 + 0.38 * settle + 0.32 * near);
      // the curve follows the reading point; the straight floor then draws out with the last bit of scroll
      let k = 0;
      while (k < samples.length && samples[k].len <= floorLen && samples[k].at <= readY) k++;
      const upTo = samples[Math.max(0, k - 1)]?.len ?? 0;
      if (upTo < floorLen - 4) return upTo;
      return floorLen + route.straight * Math.min(1, Math.max(0, (near - 0.5) / 0.45));
    };
    let raf = 0;
    const frame = () => {
      raf = 0;
      const t = Math.min(1, (performance.now() - introStart) / INTRO_MS);
      const intro = reduced ? 1 : 1 - Math.pow(1 - t, 3);
      const drawn = drawnNow() * intro;
      if (t < 1) raf = requestAnimationFrame(frame);
      sync("dots", marks.dots, drawn);
      sync("eaten", marks.eaten, drawn);
      sync("rings", marks.rings, drawn);
      sync("stations", marks.stations, drawn);
      reveal.forEach((r) => r.el.classList.toggle("is-reached", drawn >= r.len));
      if (head) {
        const tip = marks.dots[Math.max(0, shown.dots - 1)];
        const live = drawn > 0 && drawn < marks.total && tip;
        head.style.opacity = live ? "1" : "0";
        if (tip) {
          head.setAttribute("cx", String(tip.x));
          head.setAttribute("cy", String(tip.y));
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      reveal.forEach((r) => r.el.classList.remove("reading-reveal", "is-reached"));
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
    </svg>
  );
}
