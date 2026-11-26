import { useEffect, useRef, useState } from "react";
import { asset } from "../asset";
import { Dots, Footer, Nav } from "../components/Chrome";

type Piece = { title: string; year?: string; image: string; alt: string; idea: string; tools: string[] };

const pieces: Piece[] = [
  {
    title: "Queen Falling",
    year: "2021",
    image: "/images/hand/queen-falling.webp",
    alt: "An ink collage of a queen in profile, filled with small drawn icons",
    idea: "An icon collage in ink and calligraphy pen, from the line “I’d rather watch my kingdom fall. I want it all or not at all.” Kingdom Fall, Claire Wyndham.",
    tools: ["Paper", "Ink pen", "Tracing paper"],
  },
  {
    title: "Color Wheel",
    image: "/images/hand/color-wheel.webp",
    alt: "A hand-cut paper color wheel arranged as a starburst",
    idea: "Cut and arranged by hand. Each point is a step in the spectrum, from the dark outside toward a bright center.",
    tools: ["Bristol paper", "Acrylic paint"],
  },
  {
    title: "Deciphered Map",
    image: "/images/hand/halftone.webp",
    alt: "A film sheet of a halftone portrait laid over a map",
    idea: "The film sheet deciphers the map.",
    tools: ["Paper", "Ink pen", "Polka-dot film sheet"],
  },
];

const Brush = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M10.5 2.5l3 3-5.5 5.5-3-3zM5 9l2 2c0 2-1.5 3-4 3 .8-.8 1-1.6 1-2.6C4 10 4.4 9.4 5 9z" fill="currentColor" />
  </svg>
);

export function Handcrafted() {
  const [open, setOpen] = useState<number | null>(null);
  const swipe = useRef<number | null>(null);
  const go = (step: number) => setOpen((i) => (i === null ? i : (i + step + pieces.length) % pieces.length));

  useEffect(() => {
    document.title = "Handcrafted · Rana Ebrahim";
  }, []);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const piece = open === null ? null : pieces[open];
  return (
    <div className="page" id="top">
      <Dots />
      <Nav />
      <main className="craft">
        <ul className="gallery">
          {pieces.map((p, i) => (
            <li key={p.title}>
              <button type="button" className="gallery__item" onClick={() => setOpen(i)}>
                <span className="gallery__frame">
                  <img src={asset(p.image)} alt={p.alt} loading="lazy" />
                </span>
                <span className="gallery__title">{p.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </main>
      {piece ? (
        <div
          className="gallery-view"
          role="dialog"
          aria-modal="true"
          aria-label={piece.title}
          onClick={() => setOpen(null)}
          onPointerDown={(e) => (swipe.current = e.clientX)}
          onPointerUp={(e) => {
            const dx = swipe.current === null ? 0 : e.clientX - swipe.current;
            swipe.current = null;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); // swipe left or right
          }}
        >
          <button className="gallery-view__close" type="button" onClick={() => setOpen(null)} autoFocus>
            Close
          </button>
          <button className="gallery-view__nav is-prev" type="button" aria-label="Previous piece" onClick={(e) => (e.stopPropagation(), go(-1))}>
            ←
          </button>
          <figure key={piece.title} onClick={(e) => e.stopPropagation()}>
            <img src={asset(piece.image)} alt={piece.alt} draggable={false} />
            <figcaption>
              <strong>
                {piece.title}
                {piece.year ? <span> · {piece.year}</span> : null}
              </strong>
              <span className="gallery-view__idea">{piece.idea}</span>
              <span className="gallery-view__tools">
                {piece.tools.map((t) => (
                  <span key={t}>
                    <Brush />
                    {t}
                  </span>
                ))}
              </span>
              <span className="gallery-view__count">
                {open! + 1} / {pieces.length}
              </span>
            </figcaption>
          </figure>
          <button className="gallery-view__nav is-next" type="button" aria-label="Next piece" onClick={(e) => (e.stopPropagation(), go(1))}>
            →
          </button>
        </div>
      ) : null}
      <Footer />
    </div>
  );
}
