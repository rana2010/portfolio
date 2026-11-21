import { useEffect } from "react";
import { Dots, Nav } from "../components/Chrome";

type Piece = {
  title: string;
  year?: string;
  image: string;
  alt: string;
  idea: string;
};

const feature: Piece = {
  title: "Queen Falling",
  year: "2021",
  image: "/images/hand/queen-falling.webp",
  alt: "An ink collage of a queen in profile, filled with small drawn icons",
  idea: "An icon collage in ink and calligraphy pen, from the line “I’d rather watch my kingdom fall. I want it all or not at all.” Kingdom Fall, Claire Wyndham.",
};

const studies: Piece[] = [
  {
    title: "Color wheel",
    image: "/images/hand/color-wheel.webp",
    alt: "A hand-cut paper color wheel arranged as a starburst",
    idea: "Cut and arranged by hand. Each point is a step in the spectrum, from the dark outside toward a bright center.",
  },
  {
    title: "Egypt’s deciphered make",
    image: "/images/hand/halftone.webp",
    alt: "A film sheet of a halftone portrait laid over a map",
    idea: "The film sheet deciphers the map.",
  },
];

export function Handcrafted() {
  useEffect(() => {
    document.title = "Handcrafted · Rana Ebrahim";
  }, []);

  return (
    <div className="page">
      <Dots />
      <Nav />
      <main className="craft">
        <p className="craft-lede">
          In the era of AI, I’ve found myself reminiscing about design and craft by hand.
        </p>
        <figure className="craft-feature">
          <img src={feature.image} alt={feature.alt} />
          <figcaption>
            <p>
              {feature.title}
              {feature.year ? <span>{feature.year}</span> : null}
            </p>
            <p>{feature.idea}</p>
          </figcaption>
        </figure>
        <div className="craft-grid">
          {studies.map((piece) => (
            <figure className="craft-piece" key={piece.title} tabIndex={0}>
              <img src={piece.image} alt={piece.alt} />
              <figcaption>
                <p>{piece.title}</p>
                <p>{piece.idea}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </main>
    </div>
  );
}
