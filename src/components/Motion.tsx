import { useEffect, useRef, useState } from "react";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* A number that counts up once when it scrolls into view. Keeps any prefix/suffix, e.g. "200+". */
export function CountUp({ value, duration = 1800 }: { value: string; duration?: number }) {
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
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // fast start, long gentle settle
          setN(Math.round(target * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }, // starts when half of it is on screen
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
