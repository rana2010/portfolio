import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; ox: number; oy: number; vx: number; vy: number };

/**
 * A word that looks like normal text at rest. When the pointer moves over the
 * headline, the word switches to a canvas of fine dots that scatter around the
 * pointer and spring back; once everything settles it switches back to text.
 * Real text stays in the DOM for screen readers, selection and search.
 */
export function DotWord({ children }: { children: string }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dots: Dot[] = [];
    let raf = 0;
    let running = false;
    let built = false;
    const pointer = { x: -9999, y: -9999 };
    let color = "#ff6a2b";
    let w = 0;
    let h = 0;
    let padX = 0;
    let padY = 0;
    let cell = 2;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function build() {
      const style = getComputedStyle(wrap!);
      const size = parseFloat(style.fontSize);
      color = style.getPropertyValue("--dot-color").trim() || style.color;
      const rect = wrap!.getBoundingClientRect();

      const off = document.createElement("canvas");
      const o = off.getContext("2d")!;
      const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      o.font = font;
      const m = o.measureText(children);
      padX = Math.ceil(size * 0.3);
      padY = Math.ceil(size * 0.3);
      const textW = Math.max(rect.width, m.actualBoundingBoxRight + m.actualBoundingBoxLeft);
      w = Math.ceil(textW + padX * 2);
      h = Math.ceil(rect.height + padY * 2);
      off.width = w;
      off.height = h;
      o.font = font;
      o.textBaseline = "alphabetic";
      o.fillStyle = "#000";
      const ascent = m.actualBoundingBoxAscent;
      const descent = m.actualBoundingBoxDescent;
      const baseline = padY + (rect.height - (ascent + descent)) / 2 + ascent;
      o.fillText(children, padX, baseline);

      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      canvas!.style.left = `${-padX}px`;
      canvas!.style.top = `${-padY}px`;

      const data = o.getImageData(0, 0, w, h).data;
      cell = size > 80 ? 2 : 1.5;
      dots = [];
      for (let y = 0; y < h; y += cell) {
        for (let x = 0; x < w; x += cell) {
          if (data[(Math.round(y) * w + Math.round(x)) * 4 + 3] > 120) {
            dots.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
          }
        }
      }
      built = true;
    }

    function draw() {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      ctx!.fillStyle = color;
      const s = cell + 0.35;
      for (const d of dots) ctx!.fillRect(d.x, d.y, s, s);
    }

    function setActive(on: boolean) {
      wrap!.classList.toggle("is-dotted", on);
    }

    function tick() {
      let moving = false;
      const radius = 64;
      for (const d of dots) {
        const dx = d.x - pointer.x;
        const dy = d.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < radius && dist > 0.01) {
          const force = (1 - dist / radius) * 1.6;
          d.vx += (dx / dist) * force + (Math.random() - 0.5) * 0.6;
          d.vy += (dy / dist) * force + (Math.random() - 0.5) * 0.6;
        }
        d.vx += (d.ox - d.x) * 0.08;
        d.vy += (d.oy - d.y) * 0.08;
        d.vx *= 0.8;
        d.vy *= 0.8;
        d.x += d.vx;
        d.y += d.vy;
        if (!moving && (Math.abs(d.x - d.ox) > 0.15 || Math.abs(d.y - d.oy) > 0.15)) moving = true;
      }
      draw();
      if (moving || pointer.x > -9000) {
        raf = requestAnimationFrame(tick);
      } else {
        for (const d of dots) {
          d.x = d.ox;
          d.y = d.oy;
        }
        running = false;
        setActive(false);
      }
    }

    function start() {
      if (!built) return;
      if (!running) {
        running = true;
        setActive(true);
        raf = requestAnimationFrame(tick);
      }
    }

    function onMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      const near =
        pointer.x > -80 && pointer.x < rect.width + 80 && pointer.y > -80 && pointer.y < rect.height + 80;
      if (!near) {
        pointer.x = -9999;
        pointer.y = -9999;
        return;
      }
      start();
    }

    function onLeave() {
      pointer.x = -9999;
      pointer.y = -9999;
    }

    const zone = wrap.closest("h1") ?? wrap;
    zone.addEventListener("pointermove", onMove as EventListener);
    zone.addEventListener("pointerleave", onLeave);

    let ro: ResizeObserver | null = null;
    document.fonts.ready.then(() => {
      build();
      ro = new ResizeObserver(() => build());
      ro.observe(wrap);
    });
    const themeObserver = new MutationObserver(() => build());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelAnimationFrame(raf);
      zone.removeEventListener("pointermove", onMove as EventListener);
      zone.removeEventListener("pointerleave", onLeave);
      ro?.disconnect();
      themeObserver.disconnect();
      setActive(false);
    };
  }, [children]);

  return (
    <span className="dot-word" ref={wrapRef}>
      {children}
      <canvas ref={canvasRef} aria-hidden="true" />
    </span>
  );
}
