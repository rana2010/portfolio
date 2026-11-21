import { useEffect } from "react";
import { Dots, Footer, Nav } from "../components/Chrome";

const expertiseLeft = ["Fintech & e-commerce", "AI Support tools", "Coded prototyping"];
const expertiseRight = ["UX research", "Coded prototyping", "Product discovery"];

const career = [
  { company: "noon", role: "Product Designer II", years: "2025–Present" },
  { company: "Fawry", role: "Junior Product Designer", years: "2024–2025" },
  { company: "Promolinks International", role: "UX Designer", years: "2023–2024" },
];

const stack = [
  { label: "Design", items: ["Figma"] },
  { label: "Development", items: ["React", "Tailwind CSS", "shadcn/ui"] },
  { label: "AI tools", items: ["Cursor", "Claude", "ChatGPT"] },
  { label: "Version control & deployment", items: ["GitHub"] },
];

export function Home() {
  useEffect(() => {
    document.title = "Rana Ebrahim";
  }, []);

  return (
    <div className="page">
      <Dots />
      <Nav />
      <main className="home">
        <h1 className="hero">
          <span className="hero-script">Let’s collaborate</span>
          <span className="hero-sans">and create good products together</span>
        </h1>

        <section className="intro">
          <p className="intro-copy">
            I make research-based design decisions. I map the flows, run user interviews,
            and ship working prototypes in code.
          </p>
          <div className="expertise">
            <p className="eyebrow">Expertise</p>
            <div className="expertise-cols">
              <ul>
                {expertiseLeft.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <ul>
                {expertiseRight.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="career">
          <h2>Career</h2>
          <ol>
            {career.map((job) => (
              <li key={job.company}>
                <div>
                  <p className="job-company">{job.company}</p>
                  <p className="job-role">{job.role}</p>
                </div>
                <p className="job-years">{job.years}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="stack">
          <h2>Tech stack</h2>
          <ul>
            {stack.map((group) => (
              <li key={group.label}>
                <p>{group.label}</p>
                <p>{group.items.join("  ·  ")}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}
