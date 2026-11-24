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

let droppedThisLoad = false;

type Frame = { t: number; x: number; y: number; sx?: number; sy?: number };
const UP = "cubic-bezier(0, 0.55, 0.45, 1)";
const DOWN = "cubic-bezier(0.55, 0, 1, 0.45)";

/* The chat button falls, bounces, hops along the bottom of the screen, comes back and settles.
   Each landing sends a ripple along the "floor". Returns a cleanup function. */
function bounceIn(el: HTMLElement, onSettled: () => void, onDone: () => void) {
  const H = Math.round(window.innerHeight * 0.85);
  const W = Math.min(300, Math.round(window.innerWidth * 0.5));
  const f: Frame[] = [
    { t: 0, x: 0, y: -H },
    { t: 560, x: 0, y: 0, sx: 1.16, sy: 0.82 },
    { t: 620, x: 0, y: -6, sx: 0.94, sy: 1.06 },
    { t: 860, x: 0, y: -80 },
    { t: 1080, x: 0, y: 0, sx: 1.1, sy: 0.9 },
    // hop left along the floor
    { t: 1290, x: -W * 0.17, y: -58, sx: 0.96, sy: 1.05 },
    { t: 1480, x: -W * 0.34, y: 0, sx: 1.1, sy: 0.9 },
    { t: 1670, x: -W * 0.52, y: -48, sx: 0.96, sy: 1.05 },
    { t: 1850, x: -W * 0.7, y: 0, sx: 1.08, sy: 0.92 },
    { t: 2020, x: -W * 0.85, y: -34, sx: 0.97, sy: 1.04 },
    { t: 2180, x: -W, y: 0, sx: 1.08, sy: 0.92 },
    // and back home
    { t: 2400, x: -W * 0.66, y: -52, sx: 0.96, sy: 1.05 },
    { t: 2620, x: -W * 0.33, y: 0, sx: 1.08, sy: 0.92 },
    { t: 2820, x: -W * 0.15, y: -36, sx: 0.97, sy: 1.04 },
    { t: 3000, x: 0, y: 0, sx: 1.06, sy: 0.94 },
    { t: 3120, x: 0, y: -10 },
    { t: 3240, x: 0, y: 0, sx: 1.02, sy: 0.98 },
    { t: 3340, x: 0, y: 0 },
  ];
  const total = f[f.length - 1].t;
  const kf = f.map((p, i) => {
    const next = f[i + 1];
    const easing = next ? (next.y < p.y ? UP : DOWN) : "linear";
    return { offset: p.t / total, transform: `translate(${p.x}px, ${p.y}px) scale(${p.sx ?? 1}, ${p.sy ?? 1})`, easing };
  });
  el.style.opacity = "1";
  const ball = el.animate(kf, { duration: total, fill: "both" });

  // a soft shadow on the floor that follows the ball and shrinks as it rises
  const shadow = document.createElement("span");
  shadow.className = "chat-shadow";
  document.body.appendChild(shadow);
  const r = el.getBoundingClientRect();
  shadow.style.left = `${r.left + r.width / 2}px`;
  shadow.style.top = `${r.bottom}px`;
  const skf = f.map((p) => {
    const k = Math.max(0, 1 - Math.min(1, -p.y / 160));
    return { offset: p.t / total, transform: `translate(calc(-50% + ${p.x}px), -50%) scale(${0.5 + k * 0.5})`, opacity: k * 0.9 };
  });
  const shade = shadow.animate(skf, { duration: total, fill: "both" });

  // ripples along the bottom of the screen at each landing
  const timers: number[] = [];
  f.forEach((p) => {
    if (p.y !== 0 || !p.sx || p.sx < 1.05) return;
    timers.push(
      window.setTimeout(() => {
        const ring = document.createElement("span");
        ring.className = "floor-ripple";
        ring.style.left = `${r.left + r.width / 2 + p.x}px`;
        ring.style.top = `${r.bottom}px`;
        document.body.appendChild(ring);
        window.setTimeout(() => ring.remove(), 900);
      }, p.t),
    );
  });
  timers.push(window.setTimeout(onSettled, total + 80));
  timers.push(window.setTimeout(onDone, total + 5200));
  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    ball.cancel();
    shade.cancel();
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
    }, 6000);
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
          <NavLink to="/projects" viewTransition>Selected work</NavLink>
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
      <a
        className="u-link"
        href="#top"
        onClick={(event) => {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        Back to top ↑
      </a>
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
    <footer className="site-footer" id="contact">
      <p className="site-footer__label">Let’s connect</p>
      <a className="site-footer__big" href="mailto:ranaebrahim@aucegypt.edu">
        Say <em>hi!</em>
      </a>
      <div className="site-footer__links">
        <a className="u-link" href="mailto:ranaebrahim@aucegypt.edu">ranaebrahim@aucegypt.edu</a>
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
      const ring = document.createElement("span");
      ring.className = "tap-ring";
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      document.body.appendChild(ring);
      ring.addEventListener("animationend", () => ring.remove(), { once: true });
      window.setTimeout(() => ring.remove(), 900);
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);
}
