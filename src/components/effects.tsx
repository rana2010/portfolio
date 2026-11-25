import { useEffect, useRef } from "react";

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
