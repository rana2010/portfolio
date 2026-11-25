import { useEffect, useRef, useState, type CSSProperties } from "react";

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
