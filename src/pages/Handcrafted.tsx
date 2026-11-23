import { useEffect, useState } from "react";
import { asset } from "../asset";
import { Dots, Footer, Nav } from "../components/Chrome";

type Piece = {
  title: string;
  year?: string;
  image: string;
  alt: string;
  idea: string;
};

const pieces: Array<Piece & { feature?: boolean }> = [
  {
    title: "Queen Falling",
    year: "2021",
    image: "/images/hand/queen-falling.webp",
    alt: "An ink collage of a queen in profile, filled with small drawn icons",
    idea: "An icon collage in ink and calligraphy pen, from the line “I’d rather watch my kingdom fall. I want it all or not at all.” Kingdom Fall, Claire Wyndham.",
    feature: true,
  },
  {
    title: "Color wheel",
    image: "/images/hand/color-wheel.webp",
    alt: "A hand-cut paper color wheel arranged as a starburst",
    idea: "Cut and arranged by hand. Each point is a step in the spectrum, from the dark outside toward a bright center.",
  },
  {
    title: "Egypt's deciphered map",
    image: "/images/hand/halftone.webp",
    alt: "A film sheet of a halftone portrait laid over a map",
    idea: "The film sheet deciphers the map.",
  },
];

export function Handcrafted() {
  const [open, setOpen] = useState<Piece | null>(null);

  useEffect(() => {
    document.title = "Handcrafted · Rana Ebrahim";
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="page" id="top">
      <Dots />
      <Nav />
      <main className="craft">
        <p className="craft-lede">
          In the era of AI, I’ve found myself reminiscing about design and craft by hand.
        </p>
        <ul className="gallery">
          {pieces.map((piece) => (
            <li key={piece.title}>
              <button type="button" className="gallery__item" onClick={() => setOpen(piece)}>
                <span className="gallery__frame">
                  <img src={asset(piece.image)} alt={piece.alt} loading="lazy" />
                </span>
                <span className="gallery__meta">
                  <span className="gallery__title">{piece.title}</span>
                  {piece.year ? <span className="gallery__year">{piece.year}</span> : null}
                </span>
                <span className="gallery__idea">{piece.idea}</span>
              </button>
            </li>
          ))}
        </ul>
      </main>
      {open ? (
        <div
          className="gallery-view"
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          onClick={() => setOpen(null)}
        >
          <button className="gallery-view__close" type="button" onClick={() => setOpen(null)} autoFocus>
            Close
          </button>
          <figure onClick={(event) => event.stopPropagation()}>
            <img src={asset(open.image)} alt={open.alt} />
            <figcaption>
              <strong>{open.title}</strong>
              {open.year ? ` · ${open.year}` : ""}
              <br />
              {open.idea}
            </figcaption>
          </figure>
        </div>
      ) : null}
      <Footer />
    </div>
  );
}
