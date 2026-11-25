import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { flushSync } from "react-dom";
import { asset } from "../asset";
import { DotField } from "./DotField";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle() {
          const next: Theme = theme === "light" ? "dark" : "light";
          const root = document.documentElement;
          const apply = () => {
            flushSync(() => setTheme(next));
            root.dataset.theme = next;
          };
          const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
          if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            root.classList.add("vt-theme");
            doc.startViewTransition(apply).finished.finally(() => root.classList.remove("vt-theme"));
          } else {
            apply();
          }
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}



function SunIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <g fill="currentColor">
        <circle cx="9" cy="9" r="3.35" />
        <rect x="8.2" y="0.7" width="1.6" height="2.5" rx="0.8" />
        <rect x="8.2" y="14.8" width="1.6" height="2.5" rx="0.8" />
        <rect x="0.7" y="8.2" width="2.5" height="1.6" rx="0.8" />
        <rect x="14.8" y="8.2" width="2.5" height="1.6" rx="0.8" />
        <rect x="3.15" y="2.05" width="1.6" height="2.5" rx="0.8" transform="rotate(-45 3.95 3.3)" />
        <rect x="13.25" y="2.05" width="1.6" height="2.5" rx="0.8" transform="rotate(45 14.05 3.3)" />
        <rect x="3.15" y="13.45" width="1.6" height="2.5" rx="0.8" transform="rotate(45 3.95 14.7)" />
        <rect x="13.25" y="13.45" width="1.6" height="2.5" rx="0.8" transform="rotate(-45 14.05 14.7)" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.2 1.6a7 7 0 1 0 6.2 9.4 5.6 5.6 0 0 1-6.2-9.4Z"
      />
    </svg>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("ThemeProvider is missing");
  return value;
}

export function CairoTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(t);
  }, []);
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const h = parts.find((p) => p.type === "hour")?.value ?? "";
  const m = parts.find((p) => p.type === "minute")?.value ?? "";
  return (
    <span className="site-nav__time" aria-label={`Cairo time ${h}:${m}`}>
      Cairo, EG{" "}
      <b>
        {h}
        <i>:</i>
        {m}
      </b>
    </span>
  );
}

/* End-of-page play, like a basketball. When you reach the bottom of the page the chat ball waits 2s,
   hops up onto the footer line, springs off it in a big arc over "Say hi!", lands on the words and
   bounces on them 2 or 3 times (each lower, as a real ball loses energy), drops off the left end to the
   floor, then dribbles back to the bottom-right corner and shows "Wanna know more?". Two rounds, then it
   dissolves into the dots. Every arc is a true parabola under constant gravity; bounce heights follow a
   coefficient of restitution; dribbles are pushed down faster, like a hand on the ball.
   Scroll up at any point and it hops home. */
function playBall(el: HTMLElement) {
  const G = 2600; // gravity, px/s²
  const E = 0.62; // restitution: speed kept per bounce (height kept = E²)
  const R = 26;
  const icon = el.querySelector<SVGElement>(".chat-mark__icon");
  const tip = el.querySelector<HTMLElement>(".chat-mark__tip");
  const tipText = tip?.textContent ?? "";

  type V = { x: number; y: number };
  type Hit = "floor" | "line" | "say" | null;
  // one flight: from a to b, peaking `apex` px above the higher end; gDown > G = pushed down (dribble)
  type Arc = { a: V; b: V; Y: number; tUp: number; tDown: number; gDown: number; hit: Hit };
  const arc = (a: V, b: V, apex: number, hit: Hit, gDown = G): Arc => {
    const Y = Math.min(a.y, b.y) - apex;
    const tUp = Math.sqrt((2 * (a.y - Y)) / G);
    const tDown = Math.sqrt((2 * (b.y - Y)) / gDown);
    return { a, b, Y, tUp, tDown, gDown, hit };
  };

  let origin: V = { x: 0, y: 0 };
  let pos: V = { x: 0, y: 0 };
  let vy = 0;
  let spin = 0;
  let squash = 0;
  let arcs: Arc[] = [];
  let ai = 0;
  let t0 = 0;
  let raf = 0;
  let lastNow = 0;
  let done: () => void = () => {};
  let wait = 0;
  let playing = false;
  let gone = false;
  let round = 0;
  const ROUNDS = 2;

  const homeCentre = () => {
    const prev = el.style.transform;
    el.style.transform = "none";
    const r = el.getBoundingClientRect();
    el.style.transform = prev;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  // build one round as a list of arcs
  const plan = (): Arc[] => {
    origin = homeCentre();
    const W = window.innerWidth;
    const floor = origin.y;
    const leftX = W - origin.x;
    const list: Arc[] = [];
    let p: V = { ...pos };

    // 1) hop up onto the footer line
    const lineR = document.querySelector<HTMLElement>(".site-footer__base")?.getBoundingClientRect();
    if (lineR && lineR.top < floor - 10 && lineR.top > 80) {
      const ly = lineR.top - R;
      const lx = Math.min(lineR.right - R, p.x - 110);
      const q = { x: lx, y: ly };
      list.push(arc(p, q, 70, "line"));
      p = q;
      // it falls back onto the line and bounces along it, each bounce lower, drifting left
      let lh = 70 * E * E + 18;
      for (let i = 0; i < 2; i++) {
        const tFlight = Math.sqrt((2 * lh) / G) * 2;
        const nq = { x: Math.max(lineR.left + R, p.x - 260 * tFlight), y: ly };
        list.push(arc(p, nq, lh, "line"));
        p = nq;
        lh *= E * E;
      }
    }

    // 2) spring off the line in a big arc, over "Say hi!", landing on its right side
    const sr = document.querySelector<HTMLElement>(".hi__big")?.getBoundingClientRect();
    if (sr && sr.width > 0 && sr.top > 70 && sr.bottom < floor) {
      const sy = sr.top + sr.height * 0.14 - R; // ball resting on top of the letters
      const first = { x: sr.right - sr.width * 0.12, y: sy };
      const bigApex = Math.max(120, Math.min(260, (p.y - sy) * 0.5 + 120));
      list.push(arc(p, first, bigApex, "say"));
      // 3) bounce on the words, each bounce lower (h × E²), drifting left
      let h = Math.min(110, bigApex * E * E); // "jumps low"
      let x = first.x;
      const n = sr.width > 320 ? 3 : 2;
      const span = (sr.width * 0.7) / (n + 0.5);
      for (let i = 0; i < n - 1; i++) {
        const q = { x: x - span * (1 - i * 0.15), y: sy };
        list.push(arc({ x, y: sy }, q, h, "say"));
        x = q.x;
        h *= E * E;
      }
      // 4) last bounce carries it off the left end, down to the floor
      const off = { x: Math.max(leftX, sr.left - R * 0.5), y: floor };
      list.push(arc({ x, y: sy }, off, Math.max(28, h), "floor"));
      p = off;
    } else {
      const q = { x: leftX + 40, y: floor };
      list.push(arc(p, q, 220, "floor"));
      p = q;
    }

    // 5) settle in the bottom-left corner: two floor bounces from the drop
    const drop = list[list.length - 1].b.y - list[list.length - 1].Y;
    let h = drop * E * E;
    for (let i = 0; i < 2 && h > 8; i++) {
      const lastOne = i === 1 || h * E * E <= 8;
      const q = { x: lastOne ? leftX : p.x + (leftX - p.x) * 0.6, y: floor };
      list.push(arc(p, q, h, "floor"));
      p = q;
      h *= E * E;
    }
    if (Math.abs(p.x - leftX) > 1) {
      list.push(arc(p, { x: leftX, y: floor }, 6, "floor"));
      p = { x: leftX, y: floor };
    }

    // 6) dribble to the bottom-right corner: steady height, pushed down faster
    const dist = origin.x - leftX;
    const DH = 95;
    const n = Math.max(4, Math.round(dist / 170));
    const stepX = dist / (n + 2);
    for (let i = 0; i < n; i++) {
      const q = { x: p.x + stepX, y: floor };
      list.push(arc(p, q, DH, "floor", G * 1.7));
      p = q;
    }
    // 7) let go of the dribble: bounces die out into the corner
    let fh = DH * 0.75;
    while (p.x < origin.x - 1 && fh > 6) {
      const q = { x: Math.min(origin.x, p.x + Math.max(stepX * 0.45, (origin.x - p.x) * 0.55)), y: floor };
      list.push(arc(p, q, fh, "floor"));
      p = q;
      fh *= E * E;
    }
    if (p.x < origin.x) list.push(arc(p, { x: origin.x, y: floor }, 4, "floor"));
    return list;
  };

  const ripple = (k: number) =>
    window.dispatchEvent(new CustomEvent("dot-ripple", { detail: { x: pos.x, y: pos.y + R, k } }));
  const dipSay = () =>
    document.querySelector(".hi__big")?.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(4px)" }, { transform: "translateY(0)" }],
      { duration: 300, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );

  const render = () => {
    const stretch = Math.min(0.09, Math.abs(vy) / 16000);
    const sx = 1 + 0.2 * squash - stretch * 0.6;
    const sy = 1 - 0.22 * squash + stretch;
    const lift = (1 - sy) * R; // keep the bottom on the surface while squashed
    el.style.transform = `translate(${(pos.x - origin.x).toFixed(1)}px, ${(pos.y - origin.y + lift).toFixed(1)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
    if (icon) icon.style.transform = `rotate(${spin.toFixed(3)}rad)`;
  };

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;
    squash = Math.max(0, squash - dt * 8);
    const a = arcs[ai];
    if (!a) {
      render();
      return;
    }
    const t = (now - t0) / 1000;
    const T = a.tUp + a.tDown;
    const tt = Math.min(t, T);
    const x = a.a.x + (a.b.x - a.a.x) * (tt / T);
    const y = tt < a.tUp ? a.Y + 0.5 * G * (a.tUp - tt) ** 2 : a.Y + 0.5 * a.gDown * (tt - a.tUp) ** 2;
    vy = tt < a.tUp ? -G * (a.tUp - tt) : a.gDown * (tt - a.tUp);
    spin += (x - pos.x) / R;
    pos = { x, y };
    if (t >= T) {
      const impact = a.gDown * a.tDown;
      squash = Math.min(1, impact / 1500);
      if (a.hit) ripple(Math.min(0.9, 0.2 + impact / 2600));
      if (a.hit === "say") dipSay();
      ai += 1;
      t0 = now - (t - T) * 1000; // carry the leftover time into the next arc
      if (ai >= arcs.length) {
        vy = 0;
        render();
        const d = done;
        d();
        if (squash > 0) raf = requestAnimationFrame(frame); // let the last squash relax
        return;
      }
    }
    render();
    raf = requestAnimationFrame(frame);
  };
  const run = (list: Arc[], then: () => void) => {
    arcs = list;
    ai = 0;
    t0 = lastNow = performance.now();
    done = then;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  };

  const showTip = (on: boolean) => {
    if (tip) tip.textContent = on ? "Wanna know more?" : tipText;
    el.classList.toggle("play-tip", on);
  };
  const vanish = () => {
    gone = true;
    el.style.pointerEvents = "none";
    window.dispatchEvent(new CustomEvent("dot-ripple", { detail: { x: pos.x, y: pos.y, k: 1 } }));
    el.animate(
      [
        { transform: el.style.transform, opacity: 1, filter: "blur(0)" },
        { transform: `${el.style.transform} scale(0.15)`, opacity: 0, filter: "blur(6px)" },
      ],
      { duration: 700, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
    );
  };
  const startRound = () => {
    if (!playing) return;
    origin = homeCentre();
    pos = { ...origin };
    run(plan(), () => {
      round += 1;
      showTip(true);
      wait = window.setTimeout(() => {
        showTip(false);
        if (round >= ROUNDS) vanish();
        else wait = window.setTimeout(startRound, 2000);
      }, 3500);
    });
  };
  const goHome = () => {
    origin = homeCentre();
    const list = Math.hypot(pos.x - origin.x, pos.y - origin.y) < 1 ? [] : [arc(pos, { ...origin }, 60, "floor")];
    const finish = () => {
      el.style.transform = "";
      el.classList.remove("is-playing");
      if (icon) icon.style.transform = "";
    };
    if (!list.length) return finish();
    run(list, finish);
  };

  const atBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  const onScroll = () => {
    const bottom = atBottom();
    if (bottom && !playing && !gone) {
      playing = true;
      el.classList.add("is-playing");
      window.clearTimeout(wait);
      if (!arcs[ai]) pos = homeCentre();
      wait = window.setTimeout(startRound, 2000);
    } else if (!bottom && playing) {
      playing = false;
      window.clearTimeout(wait);
      showTip(false);
      if (gone) {
        el.getAnimations().forEach((a) => a.cancel());
        el.style.transform = "";
        el.style.pointerEvents = "";
        el.classList.remove("is-playing");
        el.animate([{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "scale(1)" }], { duration: 500, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
        return;
      }
      goHome();
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.clearTimeout(wait);
    if (raf) cancelAnimationFrame(raf);
    el.getAnimations().forEach((a) => a.cancel());
    el.style.transform = "";
    el.style.pointerEvents = "";
    el.classList.remove("is-playing", "play-tip", "tip-left");
    if (tip) tip.textContent = tipText;
    if (icon) icon.style.transform = "";
  };
}

let droppedThisLoad = false;

/* The chat button behaves like a basketball: it drops in from above and to the left, bounces a few
   times (each bounce lower, set by real gravity and restitution), rolls into its corner and stops.
   Each landing ripples along the floor and a shadow follows it. Returns a cleanup function. */
function bounceIn(el: HTMLElement, onSettled: () => void, onDone: () => void) {
  const G = 2600; // px/s²
  const E = 0.64; // restitution: how much speed survives each bounce
  const SLOW = 0.86; // horizontal speed kept on each bounce
  const R = 24; // ball radius, for the spin
  const H = Math.round(window.innerHeight * 0.8);
  const W = Math.min(440, Math.round(window.innerWidth * 0.55));
  const ROLL = 36;

  // vertical motion: fall from H, then bounces until they get small
  const segs: number[] = []; // airborne durations
  let v = Math.sqrt(2 * G * H);
  segs.push(v / G); // first fall
  v *= E;
  while (v > 380) {
    segs.push((2 * v) / G);
    v *= E;
  }
  // horizontal: travel W - ROLL in the air, then roll the last bit
  let k = 0;
  segs.forEach((t, i) => (k += t * Math.pow(SLOW, i)));
  const vx0 = (W - ROLL) / k;
  const vRoll = vx0 * Math.pow(SLOW, segs.length);
  const rollT = (2 * ROLL) / vRoll;

  const impacts: { t: number; x: number }[] = [];
  const pos = (ms: number) => {
    let t = ms / 1000;
    let x = -W;
    const y0 = -H;
    let up = Math.sqrt(2 * G * H) * E;
    for (let i = 0; i < segs.length; i++) {
      const vx = vx0 * Math.pow(SLOW, i);
      if (t <= segs[i]) {
        const y = i === 0 ? y0 + 0.5 * G * t * t : -(up * t - 0.5 * G * t * t);
        return { x: x + vx * t, y: Math.min(0, y), sinceHit: i === 0 ? 9 : 0 };
      }
      t -= segs[i];
      x += vx * segs[i];
      if (i > 0) up *= E;
    }
    // rolling
    const tt = Math.min(t, rollT);
    const a = vRoll / rollT;
    return { x: x + vRoll * tt - 0.5 * a * tt * tt, y: 0, sinceHit: 9 };
  };
  let acc = 0;
  segs.forEach((t) => {
    acc += t;
    impacts.push({ t: acc * 1000, x: pos(acc * 1000 - 1).x });
  });
  const total = (acc + rollT) * 1000 + 120;

  const STEP = 1000 / 60;
  const ball: Keyframe[] = [];
  const spins: number[] = [];
  const shade: Keyframe[] = [];
  for (let ms = 0; ms <= total; ms += STEP) {
    const p = pos(ms);
    const hit = impacts.find((h) => ms >= h.t && ms - h.t < 90);
    const sq = hit ? 1 - (ms - hit.t) / 90 : 0;
    const str = hit ? Math.min(1, 1 - impacts.indexOf(hit) * 0.25) : 0;
    const sx = 1 + 0.16 * sq * str;
    const sy = 1 - 0.18 * sq * str;
    const spin = (p.x + W) / R; // radians rolled
    ball.push({ offset: ms / total, transform: `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})` });
    const kk = Math.max(0, 1 - Math.min(1, -p.y / 220));
    shade.push({ offset: ms / total, transform: `translate(calc(-50% + ${p.x.toFixed(1)}px), -50%) scale(${(0.45 + kk * 0.55).toFixed(3)})`, opacity: (kk * 0.9).toFixed(3) });
    spins.push(spin);
  }
  // land upright: scale the spin so it finishes on a whole number of turns
  const end = spins[spins.length - 1] || 1;
  const turns = Math.max(1, Math.round(end / (2 * Math.PI)));
  const fit = (turns * 2 * Math.PI) / end;
  for (let i = 0; i < spins.length; i++) spins[i] *= fit;
  spins[spins.length - 1] = turns * 2 * Math.PI;
  ball[ball.length - 1].offset = 1;
  shade[shade.length - 1].offset = 1;

  const r = el.getBoundingClientRect(); // resting spot, measured before any transform
  const floor = window.innerHeight - 3; // the very bottom edge of the screen
  el.style.opacity = "1";
  const icon = el.querySelector<SVGElement>(".chat-mark__icon");
  const a1 = el.animate(ball, { duration: total, fill: "both" });
  const a3 = icon
    ? icon.animate(
        ball.map((b, i) => ({ offset: b.offset, transform: `rotate(${spins[i].toFixed(3)}rad)` })),
        { duration: total, fill: "both" },
      )
    : null;

  const shadow = document.createElement("span");
  shadow.className = "chat-shadow";
  shadow.style.left = `${r.left + r.width / 2}px`;
  shadow.style.top = `${floor}px`;
  document.body.appendChild(shadow);
  const a2 = shadow.animate(shade, { duration: total, fill: "both" });

  const timers: number[] = [];
  impacts.forEach((h, i) => {
    timers.push(
      window.setTimeout(() => {
        const ring = document.createElement("span");
        ring.className = "floor-ripple";
        ring.style.left = `${r.left + r.width / 2 + h.x}px`;
        ring.style.top = `${floor}px`;
        ring.style.setProperty("--k", String(Math.max(0.35, 1 - i * 0.25)));
        window.dispatchEvent(new CustomEvent("dot-ripple", { detail: { x: r.left + r.width / 2 + h.x, y: floor, k: Math.max(0.35, 1 - i * 0.25) } }));
        document.body.appendChild(ring);
        window.setTimeout(() => ring.remove(), 900);
      }, h.t),
    );
  });
  timers.push(window.setTimeout(onSettled, total + 60));
  timers.push(window.setTimeout(onDone, total + 5200));
  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    a1.cancel();
    a2.cancel();
    a3?.cancel();
    shadow.remove();
    el.style.opacity = "";
  };
}

export function Nav() {
  const { theme, toggle } = useTheme();
  // plays on every full page load (including refresh), not on in-site navigation
  const [chat, setChat] = useState<"wait" | "drop" | "idle">(() => (droppedThisLoad ? "idle" : "wait"));
  useEffect(() => {
    if (chat !== "wait") return;
    const t = window.setTimeout(() => {
      droppedThisLoad = true;
      setChat("drop");
    }, 4000);
    return () => window.clearTimeout(t);
  }, [chat]);
  const mark = useRef<HTMLAnchorElement>(null);
  const [tip, setTip] = useState(false);
  useEffect(() => {
    if (chat !== "drop") return;
    const el = mark.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTip(true);
      const t = window.setTimeout(() => {
        setTip(false);
        setChat("idle");
      }, 5000);
      return () => window.clearTimeout(t);
    }
    return bounceIn(el, () => setTip(true), () => {
      setTip(false);
      setChat("idle");
    });
  }, [chat]);
  useEffect(() => {
    if (chat !== "idle" || !mark.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return playBall(mark.current);
  }, [chat]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={scrolled ? "site-nav is-scrolled" : "site-nav"}>
        <Link className="site-nav__name" to="/" viewTransition>
          Rana Ebrahim
        </Link>
        <nav className="site-nav__links" aria-label="Main">
          <Link
            to={{ pathname: "/", hash: "work" }}
            viewTransition
            onClick={(e) => {
              const onHome = window.location.pathname.replace(/\/+$/, "").match(/\/(portfolio)?(\/home)?$/);
              const list = document.getElementById("work");
              if (onHome && list) {
                e.preventDefault();
                list.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", "#work");
              }
            }}
          >
            Work
          </Link>
          <NavLink to="/handcrafted" viewTransition>Handcrafted</NavLink>
          <button
            className="site-nav__theme"
            type="button"
            onClick={toggle}
            aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          >
            {theme === "light" ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>
      </header>
      <Link ref={mark} className={`chat-mark is-${chat}${tip ? " tip-on" : ""}`} to="/chat" aria-label="Ask me about my work: my AI bot">
        <svg className="chat-mark__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path className="chat-mark__star" d="M11 2.5c.7 5.1 2.4 6.8 7.5 7.5-5.1.7-6.8 2.4-7.5 7.5-.7-5.1-2.4-6.8-7.5-7.5 5.1-.7 6.8-2.4 7.5-7.5Z" />
          <path className="chat-mark__star chat-mark__star--sm" d="M18.5 15.5c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z" />
        </svg>
        <span className="chat-mark__tip" aria-hidden="true">Ask me about my work</span>
      </Link>
    </>
  );
}

const EMAIL = "ranaebrahim@aucegypt.edu";

/* "Email" copies the address; falls back to opening the mail app. */
function CopyEmail() {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);
  return (
    <a
      className={`u-link copy-email${copied ? " is-copied" : ""}`}
      href={`mailto:${EMAIL}`}
      onClick={(e) => {
        if (!navigator.clipboard) return;
        e.preventDefault();
        navigator.clipboard.writeText(EMAIL).then(
          () => setCopied(true),
          () => (window.location.href = `mailto:${EMAIL}`),
        );
      }}
      title={EMAIL}
      aria-label={`Copy my email, ${EMAIL}`}
    >
      {copied ? "Email copied ✓" : "Email"}
    </a>
  );
}

export function Footer({
  next,
}: {
  giant?: boolean;
  next?: { name: string; to: string };
}) {
  const base = (
    <div className="site-footer__base">
      <p>© 2026 Rana Ebrahim</p>
      <p className="site-footer__time">
        Local time in <CairoTime />
      </p>
    </div>
  );

  if (next) {
    return (
      <footer className="site-footer site-footer--case">
        <Link className="ds-next" to={next.to} viewTransition>
          <span className="ds-next__label">Next</span>
          <span className="ds-next__title">{next.name}</span>
        </Link>
        {base}
      </footer>
    );
  }

  return (
    <footer className="site-footer site-footer--hi" id="contact">
      <p className="site-footer__label">Let’s connect</p>
      <p className="hi__big">
        Say <em>hi!</em>
      </p>
      <div className="site-footer__links">
        <CopyEmail />
        <a className="u-link" href="https://www.linkedin.com/in/rana-ebrahimm/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
      {base}
    </footer>
  );
}

export function Dots() {
  const { theme } = useTheme();
  const light = theme !== "dark";

  return (
    <DotField
      className="dots"
      dotRadius={1.1}
      dotSpacing={26}
      pattern="grid"
      gradientFrom={light ? "#8f8e86" : "#d8d7d1"}
      gradientTo={light ? "#6d6c66" : "#f4f4f2"}
      gradientAngle={180}
      cursorRadius={110}
      bulgeStrength={0.36}
      twist={0}
      glowColor={light ? "#121211" : "#f4f4f2"}
      glowRadius={64}
      glowIntensity={0.16}
      baseOpacity={light ? 0.38 : 0.22}
      waveAmplitude={0}
      sparkle={false}
      speed={0}
      interactive
      holdToZoom={false}
      intro={false}
      lightMode={light}
    />
  );
}

export function BrowserFrame({
  label,
  tall = false,
  src,
  alt = "",
}: {
  label: string;
  tall?: boolean;
  src?: string;
  alt?: string;
}) {
  return (
    <div className={tall ? "browser browser-tall" : "browser"}>
      <div className="browser-bar">
        <span className="traffic" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="browser-label">{label}</span>
      </div>
      <div className={src ? "browser-view has-shot" : "browser-view"}>
        {src ? <img src={asset(src)} alt={alt} /> : null}
      </div>
    </div>
  );
}


/* Thin reading-progress line at the top of a case study */
export function ReadProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return <div className="read-progress" ref={bar} aria-hidden="true" />;
}

/* A small ring that expands from where a link or button is tapped or clicked */
export function useTapRing() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onDown = (e: PointerEvent) => {
      document.documentElement.style.setProperty("--vt-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--vt-y", `${e.clientY}px`);
      const target = (e.target as Element | null)?.closest("a, button, [role='tab']");
      if (!target || e.button > 0) return;
      // the tap travels through the dotted background instead of drawing its own ring
      window.dispatchEvent(new CustomEvent("dot-ripple", { detail: { x: e.clientX, y: e.clientY, k: 0.55 } }));
    };
    // hovering a link or button sends a soft pulse through the dots
    let last: Element | null = null;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const t = (e.target as Element | null)?.closest("a, button, [role='tab']") ?? null;
      if (t === last) return;
      last = t;
      if (t) window.dispatchEvent(new CustomEvent("dot-ripple", { detail: { x: e.clientX, y: e.clientY, k: 0.28 } }));
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerover", onOver);
    };
  }, []);
}
