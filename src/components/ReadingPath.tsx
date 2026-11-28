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
const PAC_R = 13;
// the blocks that appear as the line reaches them: everything after the hero, and the footer
const REVEAL = "main > :not(.home-hero) :is(h2, h3, p, li), .site-footer--hi > *";

export function ReadingPath() {
  const [route, setRoute] = useState<Route | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const eatRef = useRef<SVGPathElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const maskRef = useRef<SVGPathElement>(null);
  const drawnRef = useRef<number | null>(null); // how much of the line is drawn, kept across relayouts
  // everything that lights up along the line, measured once per layout: dots of the line itself, grid dots
  // it eats, rings and stations. Each has the length along the line at which it appears.
  const [marks, setMarks] = useState<{
    total: number;
    rings: { x: number; y: number; len: number }[];
    stations: { x: number; y: number; len: number }[];
    samples: { len: number; x: number; y: number; at: number }[];
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
      const eduX = edgeL; // the curve round Education swings wide, out to the left edge of the content
      const hugR = gx(Math.min(W - P * 0.5, L + Wm + P)); // hugging the content's right edge
      const edgeR = gx(W + P * 3); // turns on the right swing out past the edge of the screen
      const ringX = gx(arrows[0].cx - P * 2); // near the right edge, a little in from where the arrows were
      const rings: Pt[] = arrows.map((a) => ({ x: ringX, y: a.cy }));
      const laneY = mid(flowLabel.b, Math.min(...steps.map((st) => st.t))); // between the label and the step titles
      const EDU_R = P * 12; // size of the curve round Education
      // the lower half of that curve lands on the line just before the first step, so every step sits on the line
      const EDU_R_LOW = Math.min(EDU_R, Math.max(P * 3, Math.min(...steps.map((st) => st.l)) - eduX - P * 0.5));
      // a dot at each step that sits on the straight part of the line (the curve passes the first one by)
      const stations: Pt[] = steps.filter((st) => st.l >= eduX + EDU_R_LOW - P * 0.5).map((st) => ({ x: gx(st.l), y: laneY }));

      // "Email, LinkedIn / Say hi!": two circles round just those two, spiralling outwards, then off the left
      // edge and round onto the floor. The incoming run is the top of the first circle.
      const GAP = P * 0.8;
      const tI = gy(connect.t - P * 0.8), bI = hi.b + P * 0.25; // inner circle: top, bottom
      const lI = gx(Math.min(connect.l, hi.l) - P), rI = gx(hi.r + P * 1.5); // inner circle: left, right
      // Spiral turns sit only GAP apart; a large corner would cut through the previous run and leave a dash cloud.
      const spiralR = GAP * 0.4;
      const sayHi: (Pt & { r?: number })[] = [{ x: edgeR, y: tI }];
      for (let k = 0; k < 2; k++) {
        const g = GAP * k;
        sayHi.push(
          { x: lI - g, y: tI - g, r: k === 0 ? undefined : spiralR },
          { x: lI - g, y: bI + g, r: spiralR },
          { x: rI + g, y: bI + g, r: spiralR },
          { x: rI + g, y: tI - g - GAP, r: spiralR },
        );
      }
      sayHi.push({ x: lI - GAP * 2, y: tI - GAP * 2, r: spiralR });

      // the route: level runs across the page joined by round turns at the edges. Corners are listed here;
      // "through" points keep the line straight (the drop through the rings).
      type V = Pt & { through?: boolean; r?: number }; // r: turn size
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
        // round Education: one wide, smooth curve out to the left that rolls onto the line before Research
        { x: eduX, y: gy(careerList.b + P * 0.6), r: EDU_R },
        { x: eduX, y: laneY, r: EDU_R_LOW },
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
        if ((!inDir.x && !inDir.y) || (!outDir.x && !outDir.y)) continue;
        if (inDir.x === outDir.x && inDir.y === outDir.y) continue;
        if (inDir.x === -outDir.x && inDir.y === -outDir.y) continue;
        let rIn = side(i - 1, i), rOut = side(i, i + 1);
        const v = inDir.y ? rIn : rOut; // the vertical radius
        const h = Math.min(inDir.x ? rIn : rOut, here.r ?? P * 10, Math.max(v * 1.6, P * 2));
        const vv = Math.min(v, here.r ?? P * 14);
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
    const total = path.getTotalLength();
    const samples: { len: number; x: number; y: number; at: number }[] = [];
    const step = Math.max(8, DOT_PITCH / 3);
    for (let l = 0; l <= total; l += step) {
      const p = path.getPointAtLength(l);
      samples.push({ len: l, x: p.x, y: p.y, at: 0 });
    }
    const end = path.getPointAtLength(total);
    if ((samples[samples.length - 1]?.len ?? 0) < total - 0.5) samples.push({ len: total, x: end.x, y: end.y, at: 0 });
    // Map by how far down the page the line has already been — not by length. A winding path is much
    // longer than the page, so even-speed along the line makes the tip trail the scroll.
    const floorLen = Math.max(0, total - route.straight);
    const body = samples.filter((q) => q.len <= floorLen);
    let peak = body[0].y;
    for (const q of body) {
      if (q.y > peak) peak = q.y;
      q.at = peak;
    }
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
      rings: at(route.rings),
      stations: at(route.stations),
      samples,
    });
  }, [route]);

  // 3) tip tracks the reading line. Paint on scroll only. Mask dash is in real path units.
  useEffect(() => {
    const svg = svgRef.current;
    const mask = maskRef.current;
    if (!svg || !mask || !marks || !route) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rings = Array.from(svg.querySelectorAll<SVGCircleElement>(".reading-path__ring"));
    const stations = Array.from(svg.querySelectorAll<SVGCircleElement>(".reading-path__station"));
    const head = svg.querySelector<SVGCircleElement>(".reading-path__head");
    const pacman = svg.querySelector<SVGPathElement>(".reading-path__pacman");
    const floorLen = Math.max(0, marks.total - route.straight);
    const hide = document.documentElement.classList.contains("has-reading-reveal");
    const samples = marks.samples;

    const workEls = [
      document.querySelector<HTMLElement>(".work-list__head"),
      ...document.querySelectorAll<HTMLElement>(".work-list li"),
    ].filter((el): el is HTMLElement => !!el);
    const skip = new Set(workEls);
    const blocks: { el: HTMLElement; trigger: number; on: boolean }[] = [];
    if (hide) {
      workEls.forEach((el, i) => {
        const ring = marks.rings[Math.min(i, Math.max(0, marks.rings.length - 1))];
        if (ring) blocks.push({ el, trigger: ring.len, on: false });
      });
      for (const el of document.querySelectorAll<HTMLElement>(REVEAL)) {
        if (skip.has(el) || el.closest(".work-list")) continue;
        const r = el.getBoundingClientRect();
        const top = r.top + window.scrollY;
        const bottom = top + r.height;
        let trigger = -1;
        for (const q of samples) {
          if (q.len > floorLen) break;
          if (q.x >= r.left && q.x <= r.right && q.y >= top && q.y <= bottom) {
            trigger = q.len;
            break;
          }
        }
        if (trigger >= 0) blocks.push({ el, trigger, on: false });
      }
    }

    const shown = { rings: 0, stations: 0 };
    const sync = (key: "rings" | "stations", list: { len: number }[], els: SVGCircleElement[], drawn: number) => {
      let n = 0;
      while (n < list.length && list[n].len <= drawn) n++;
      if (n > shown[key]) for (let i = shown[key]; i < n; i++) els[i]?.classList.add("is-on");
      else for (let i = n; i < shown[key]; i++) els[i]?.classList.remove("is-on");
      shown[key] = n;
    };

    const pointAt = (len: number) => {
      const target = Math.min(Math.max(len, 0), marks.total);
      let lo = 0, hi = samples.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (samples[mid].len < target) lo = mid + 1;
        else hi = mid;
      }
      const b = samples[lo];
      const a = samples[Math.max(0, lo - 1)];
      const span = b.len - a.len;
      const t = span <= 0 ? 1 : (target - a.len) / span;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    };

    const drawnNow = () => {
      const { total } = marks;
      if (reduced) return total;
      const H = window.innerHeight;
      const max = document.documentElement.scrollHeight - H;
      if (max <= 1) return total;
      const near = Math.max(0, Math.min(1, 1 - (max - window.scrollY) / (H * 0.6)));
      if (near >= 0.999) return total;
      const settle = Math.min(1, window.scrollY / (H * 0.5));
      const readY = window.scrollY + H * (0.3 + 0.25 * settle + 0.45 * near);
      let k = 0;
      while (k < samples.length && samples[k].len <= floorLen && samples[k].at <= readY) k++;
      const a = samples[Math.max(0, k - 1)];
      if (!a || a.len >= floorLen - 4) {
        return floorLen + route.straight * Math.min(1, Math.max(0, (near - 0.5) / 0.45));
      }
      const b = samples[k];
      if (!b || b.len > floorLen || b.at <= a.at) return a.len;
      const t = Math.max(0, Math.min(1, (readY - a.at) / (b.at - a.at)));
      return a.len + (b.len - a.len) * t;
    };

    let lastDrawn = -1;
    let chomping = false;
    let raf = 0;

    const paint = () => {
      const drawn = reduced ? marks.total : drawnNow();
      if (Math.abs(drawn - lastDrawn) < 0.25 && lastDrawn >= 0) return;
      drawnRef.current = drawn;
      mask.setAttribute("stroke-dasharray", `${Math.max(0, drawn)} ${marks.total}`);
      sync("rings", marks.rings, rings, drawn);
      sync("stations", marks.stations, stations, drawn);
      for (const b of blocks) {
        const on = drawn >= b.trigger;
        if (on === b.on) continue;
        b.on = on;
        b.el.classList.toggle("is-reached", on);
      }
      const live = drawn > 0 && drawn < marks.total;
      if (lastDrawn >= 0 && drawn < lastDrawn - 0.5) chomping = document.documentElement.classList.contains("ball-pacman");
      else if (lastDrawn >= 0 && drawn > lastDrawn + 0.5) chomping = false;
      lastDrawn = drawn;
      const pac = chomping && live;
      const tip = pointAt(drawn);
      if (head) {
        head.style.opacity = live && !pac ? "1" : "0";
        head.setAttribute("cx", String(tip.x));
        head.setAttribute("cy", String(tip.y));
      }
      if (pacman) {
        pacman.classList.toggle("is-on", pac);
        if (pac) {
          const back = pointAt(drawn - 24);
          const angle = Math.atan2(back.y - tip.y, back.x - tip.x);
          const m = 0.4;
          pacman.setAttribute(
            "d",
            `M 0 0 L ${(PAC_R * Math.cos(m)).toFixed(2)} ${(PAC_R * Math.sin(m)).toFixed(2)} A ${PAC_R} ${PAC_R} 0 1 1 ${(PAC_R * Math.cos(m)).toFixed(2)} ${(-PAC_R * Math.sin(m)).toFixed(2)} Z`,
          );
          pacman.setAttribute("transform", `translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(${((angle * 180) / Math.PI).toFixed(1)})`);
        }
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        paint();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    paint();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      blocks.forEach((b) => b.el.classList.remove("is-reached"));
    };
  }, [marks, route]);

  return (
    <svg ref={svgRef} className="reading-path" aria-hidden="true" width="100%" height="100%" data-floor-y={route?.floorY}>
      <defs>
        <mask id="reading-draw" maskUnits="userSpaceOnUse" x="-80" y="-80" width="4000" height="8000">
          <rect x="-80" y="-80" width="4000" height="8000" fill="black" />
          <path ref={maskRef} d={route?.d ?? ""} fill="none" stroke="white" strokeWidth="18" strokeLinecap="round" />
        </mask>
      </defs>
      {route && <path ref={pathRef} d={route.d} className="reading-path__guide" />}
      {route && <path ref={eatRef} className="reading-path__eat" d={route.d} mask="url(#reading-draw)" />}
      {route && <path ref={lineRef} className="reading-path__line" d={route.d} mask="url(#reading-draw)" />}
      {marks?.rings.map((r, i) => <circle key={`r${i}`} className="reading-path__ring" cx={r.x} cy={r.y} r={14} />)}
      {marks?.stations.map((st, i) => <circle key={`s${i}`} className="reading-path__station" cx={st.x} cy={st.y} r={4} />)}
      <circle className="reading-path__head" r={3.5} style={{ opacity: 0 }} />
      <path className="reading-path__pacman" />
    </svg>
  );
}
