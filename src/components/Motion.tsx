import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Text that fills in word by word as it scrolls up the screen: pale grey → ink. */
export function ScrollFill({ text, className, as: Tag = "p" }: { text: string; className?: string; as?: "p" | "h2" | "h3" }) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(" ");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      el.style.setProperty("--p", "1");
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // starts filling when the top reaches 88% of the screen, done when the bottom reaches 45%
      const start = vh * 0.88;
      const end = vh * 0.45;
      const p = (start - r.top) / (start - end + r.height);
      el.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(3));
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
  return (
    <Tag
      ref={ref as never}
      className={`scroll-fill${className ? ` ${className}` : ""}`}
      style={{ "--n": words.length } as CSSProperties}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" style={{ "--i": i } as CSSProperties}>
          {w}{i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

/* A number that counts up once when it scrolls into view. Keeps any prefix/suffix, e.g. "200+". */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const m = /^(\D*)(\d+)(.*)$/.exec(value);
  const target = m ? parseInt(m[2], 10) : 0;
  const [n, setN] = useState(() => (m && !reduced() ? 0 : target));
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!m || !el || reduced()) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          setN(Math.round(target * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!m) return <>{value}</>;
  return (
    <span ref={ref} className="count-up" aria-label={value}>
      <span aria-hidden="true">
        {m[1]}
        {n}
        {m[3]}
      </span>
    </span>
  );
}

/* Case-study progress: after a reader reaches the end of a case study, a quiet toast says how many
   they've explored and points to the next unread one. Remembered per browser. */
const STUDIES = [
  { slug: "pulse", name: "Pulse", to: "/work/pulse" },
  { slug: "echo", name: "Echo", to: "/work/echo" },
  { slug: "analyst", name: "AI Analyst", to: "/work/analyst" },
];
const KEY = "rana-explored";
const readSeen = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const writeSeen = (v: string[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* storage can be blocked; the toast still works for this visit */
  }
};

export function ExploreToast() {
  const { pathname } = useLocation();
  const slug = STUDIES.find((s) => pathname.endsWith(`/work/${s.slug}`))?.slug;
  const [toast, setToast] = useState<{ count: number; next?: (typeof STUDIES)[number] } | null>(null);
  const [out, setOut] = useState(false);

  useEffect(() => {
    setToast(null);
    setOut(false);
    if (!slug) return;
    let fired = false;
    const timers: number[] = [];
    const check = () => {
      if (fired) return;
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight < doc.scrollHeight * 0.9) return;
      fired = true;
      const seen = Array.from(new Set([...readSeen(), slug]));
      writeSeen(seen);
      const idx = STUDIES.findIndex((s) => s.slug === slug);
      const order = [...STUDIES.slice(idx + 1), ...STUDIES.slice(0, idx)];
      const next = order.find((s) => !seen.includes(s.slug));
      setToast({ count: seen.length, next });
      timers.push(window.setTimeout(() => setOut(true), 6500));
      timers.push(window.setTimeout(() => setToast(null), 7100));
    };
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [slug]);

  if (!toast) return null;
  const all = toast.count >= STUDIES.length;
  return (
    <div className={`explore-toast${out ? " is-out" : ""}`} role="status">
      <span className="explore-toast__pips" aria-hidden="true">
        {STUDIES.map((s, i) => (
          <i key={s.slug} className={i < toast.count ? "on" : ""} />
        ))}
      </span>
      <span className="explore-toast__text">
        {all ? "All 3 case studies explored. Thanks for reading." : `${toast.count} of ${STUDIES.length} case studies explored`}
      </span>
      {!all && toast.next && (
        <Link className="explore-toast__next" to={toast.next.to} viewTransition>
          Next: {toast.next.name} →
        </Link>
      )}
      <button className="explore-toast__x" type="button" aria-label="Dismiss" onClick={() => setOut(true)}>
        ×
      </button>
    </div>
  );
}
