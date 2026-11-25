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

/* At the very end of the page the chat ball plays on the floor: it bounces from one bottom corner to
   the other, using "Say hi!" as a step on the way (lands on it, springs a little higher, drops back to
   the floor), settles in the corner for 2 seconds, then heads back. Scroll up and it rolls home. */
function playBall(el: HTMLElement) {
  const G = 2600;
  const R = 24;
  const icon = el.querySelector<SVGElement>(".chat-mark__icon");
  type P = { x: number; y: number };
  type Arc = { from: P; to: P; apexY: number; tUp: number; t: number; step?: boolean };
  let arcs: Arc[] = [];
  let arcI = 0;
  let arcT0 = 0;
  let cur: P = { x: 0, y: 0 }; // offset from home
  let spin = 0;
  let raf = 0;
  let rest = 0;
  let playing = false;
  let side: "left" | "right" = "right";
  let after: () => void = () => {};

  const home = () => {
    const prev = el.style.transform;
    el.style.transform = "none";
    const r = el.getBoundingClientRect();
    el.style.transform = prev;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const arc = (from: P, to: P, h: number): Arc => {
    const apexY = Math.min(from.y, to.y) - h; // screen y grows downward
    const tUp = Math.sqrt((2 * (from.y - apexY)) / G);
    const tDown = Math.sqrt((2 * (to.y - apexY)) / G);
    return { from, to, apexY, tUp, t: tUp + tDown };
  };
  // build the hops for one trip along the floor (all points are ball centres, in viewport px)
  const plan = (toSide: "left" | "right") => {
    const h0 = home();
    const W = window.innerWidth;
    const floor = h0.y;
    const leftX = W - h0.x; // mirror of the home corner
    const start = { x: h0.x + cur.x, y: h0.y + cur.y };
    const endX = toSide === "left" ? leftX : h0.x;
    const pts: { p: P; h: number; step?: boolean }[] = [];
    const stepEl = document.querySelector<HTMLElement>(".hi__big");
    const sr = stepEl?.getBoundingClientRect();
    const onScreen = sr && sr.top > 70 && sr.bottom < floor && sr.width > 0;
    const dir = Math.sign(endX - start.x) || 1;
    if (onScreen && sr) {
      const top = sr.top + sr.height * 0.14 - R; // ball resting on top of the letters
      // two steps across the words: first the near word, then the far one
      const near = toSide === "left" ? sr.left + sr.width * 0.8 : sr.left + sr.width * 0.2;
      const far = toSide === "left" ? sr.left + sr.width * 0.25 : sr.left + sr.width * 0.75;
      const between = (near - start.x) * dir > 0 && (endX - far) * dir > 0;
      if (between) {
        const runUp = start.x + (near - start.x) * 0.45;
        pts.push({ p: { x: runUp, y: floor }, h: 110 }); // a hop along the floor
        pts.push({ p: { x: near, y: top }, h: 70, step: true }); // up onto "Say hi!"
        pts.push({ p: { x: far, y: top }, h: 55, step: true }); // a step across the words
        const off = toSide === "left" ? sr.left - 40 : sr.right + 40; // spring off, a little higher
        pts.push({ p: { x: Math.max(R + 8, Math.min(W - R - 8, off)), y: floor }, h: 140 });
      }
    }
    if (!pts.length) {
      pts.push({ p: { x: start.x + (endX - start.x) * 0.4, y: floor }, h: 130 });
      pts.push({ p: { x: start.x + (endX - start.x) * 0.75, y: floor }, h: 80 });
    }
    pts.push({ p: { x: endX, y: floor }, h: 60 }); // into the corner
    pts.push({ p: { x: endX, y: floor }, h: 22 }); // settle
    pts.push({ p: { x: endX, y: floor }, h: 8 });
    const list: Arc[] = [];
    let from = start;
    pts.forEach(({ p, h, step }) => {
      list.push({ ...arc(from, p, h), step });
      from = p;
    });
    return { list, origin: h0 };
  };
  let origin = { x: 0, y: 0 };
  const ripple = (k: number) => {
    const r = el.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent("dot-ripple", { detail: { x: r.left + r.width / 2, y: r.bottom, k } }));
  };
  const frame = (now: number) => {
    raf = 0;
    const a = arcs[arcI];
    if (!a) return;
    const t = Math.min(a.t, (now - arcT0) / 1000);
    const x = a.from.x + (a.to.x - a.from.x) * (t / a.t);
    const y = a.apexY + 0.5 * G * (t - a.tUp) * (t - a.tUp);
    const next = { x: x - origin.x, y: y - origin.y };
    spin += (next.x - cur.x) / R;
    cur = next;
    el.style.transform = `translate(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px)`;
    if (icon) icon.style.transform = `rotate(${spin.toFixed(3)}rad)`;
    if (t >= a.t) {
      ripple(Math.min(0.8, 0.25 + (a.to.y - a.apexY) / 300));
      if (a.step) {
        // the words give under the ball, like a step
        document.querySelector(".hi__big")?.animate(
          [{ transform: "translateY(0) scaleY(1)" }, { transform: "translateY(5px) scaleY(0.975)" }, { transform: "translateY(0) scaleY(1)" }],
          { duration: 320, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
        );
      }
      arcI += 1;
      arcT0 = now;
      if (arcI >= arcs.length) {
        after();
        return;
      }
    }
    raf = requestAnimationFrame(frame);
  };
  const trip = (toSide: "left" | "right", then: () => void) => {
    const p = plan(toSide);
    arcs = p.list;
    origin = p.origin;
    arcI = 0;
    arcT0 = performance.now();
    after = () => {
      side = toSide;
      then();
    };
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  };
  const ROUNDS = 3;
  let rounds = 0;
  let gone = false;
  const tip = el.querySelector<HTMLElement>(".chat-mark__tip");
  const tipText = tip?.textContent ?? "";
  const showTip = (on: boolean) => {
    if (tip) tip.textContent = on ? "Wanna know more?" : tipText;
    el.classList.toggle("play-tip", on);
    el.classList.toggle("tip-left", on && side === "left");
  };
  const vanish = () => {
    gone = true;
    el.style.pointerEvents = "none";
    const r = el.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent("dot-ripple", { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, k: 1 } }));
    el.animate(
      [
        { transform: el.style.transform, opacity: 1, filter: "blur(0)" },
        { transform: `${el.style.transform} scale(0.15)`, opacity: 0, filter: "blur(6px)" },
      ],
      { duration: 700, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
    );
  };
  const loop = () => {
    if (!playing) return;
    trip(side === "right" ? "left" : "right", () => {
      rounds += 1;
      showTip(true);
      rest = window.setTimeout(() => {
        showTip(false);
        if (rounds >= ROUNDS) vanish();
        else loop();
      }, 3500);
    });
  };
  const atBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  const onScroll = () => {
    const bottom = atBottom();
    if (bottom && !playing && !gone) {
      playing = true;
      el.classList.add("is-playing");
      window.clearTimeout(rest);
      loop();
    } else if (!bottom && playing) {
      playing = false;
      window.clearTimeout(rest);
      showTip(false);
      if (gone) {
        el.getAnimations().forEach((a) => a.cancel());
        el.style.transform = "";
        el.style.pointerEvents = "";
        cur = { x: 0, y: 0 };
        el.classList.remove("is-playing");
        el.animate([{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "scale(1)" }], { duration: 500, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
        return;
      }
      if (side === "right" && !arcs[arcI]) {
        el.classList.remove("is-playing");
        return;
      }
      trip("right", () => {
        el.classList.remove("is-playing");
        el.style.transform = "";
        cur = { x: 0, y: 0 };
      });
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.clearTimeout(rest);
    if (raf) cancelAnimationFrame(raf);
    el.style.transform = "";
    el.classList.remove("is-playing", "play-tip", "tip-left");
    el.style.pointerEvents = "";
    el.getAnimations().forEach((a) => a.cancel());
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
