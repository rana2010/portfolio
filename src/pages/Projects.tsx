import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Dots, Nav } from "../components/Chrome";

const work = [
  {
    index: "01",
    name: "Pulse",
    to: "/work/pulse",
    description:
      "Product design for one of the Middle East's largest online shopping platforms.",
    image: "/pulse/projects-hero.webp",
    alt: "Pulse workspace",
  },
  {
    index: "02",
    name: "Echo",
    to: "/work/echo",
    description: "I owned the design of Echo, Noon’s internal CRM built to replace Zoho.",
    image: "/images/echo/echo-projects-hero.webp",
    alt: "Echo ticket list",
  },
];

export function Projects() {
  useEffect(() => {
    document.title = "Projects · Rana Ebrahim";
  }, []);

  return (
    <div className="page">
      <Dots />
      <Nav />
      <main className="projects">
        <h1>
          Selected
          <br />
          work
        </h1>
        <div className="work-cards">
          {work.map((item) => (
            <article className="work-card" key={item.name}>
              <Link to={item.to}>
                <img src={item.image} alt={item.alt} />
                <p className="index">{item.index}</p>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
