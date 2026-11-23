import { useEffect } from "react";
import { Dots, Footer, Nav } from "../components/Chrome";
import { WorkList } from "../components/WorkList";

const career = [
  { company: "noon", role: "Product Designer II", years: "Jan 2025 – Present" },
  { company: "Fawry", role: "Product Designer", years: "Jan – Sep 2024" },
  { company: "Promolinks International", role: "User Experience Designer", years: "May – Nov 2023" },
];

const stack = [
  { label: "Design", items: ["Figma", "Dovetail"] },
  { label: "Development", items: ["React", "Tailwind CSS", "shadcn/ui"] },
  { label: "AI tools", items: ["Cursor", "Claude"] },
  { label: "Version control & deployment", items: ["GitHub"] },
];

export function Home() {
  useEffect(() => {
    document.title = "Rana Ebrahim";
  }, []);

  return (
    <div className="page" id="top">
      <Dots />
      <Nav />
      <main className="home-ds">
        <section className="home-hero">
          <p className="home-hero__label">Product designer · Cairo, Egypt</p>
          <h1 className="home-hero__title">
            I make <em>research-backed</em>
            <br className="home-hero__br" /> design decisions
          </h1>
          <p className="home-hero__sub">and ship prototypes in code.</p>
          <div className="home-hero__foot">
            <span />
            <a href="#work">Scroll ↓</a>
          </div>
        </section>

        <WorkList />

        <section className="home-about" id="about">
          <h2 className="home-about__label">About</h2>
          <div className="home-about__body">
            <p className="home-about__big">
              Product Designer with 3+ years of experience across e-commerce and fintech.
            </p>
            <p>
              I work end to end, across user research, product discovery, UX/UI design and coded
              prototypes, with a focus on behavioral design and AI-assisted products.
            </p>

            <h3 className="home-about__sub">Career</h3>
            <ol className="home-career">
              {career.map((job) => (
                <li key={job.company}>
                  <span className="home-career__co">{job.company}</span>
                  <span className="home-career__role">{job.role}</span>
                  <span className="home-career__yr">{job.years}</span>
                </li>
              ))}
            </ol>

            <div className="home-pair">
              <div>
                <h3 className="home-about__sub">Education</h3>
                <ol className="home-edu">
                  <li>
                    <span>The American University in Cairo</span>
                    <span>BA, Communication and Interactive Design · 2018 – 2023</span>
                  </li>
                  <li>
                    <span>
                      <a
                        className="text-link"
                        href="https://coursera.org/verify/8FBV6NL2KGCC"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Gamification
                      </a>
                    </span>
                    <span>University of Pennsylvania (Coursera) · 2024</span>
                  </li>
                  <li>
                    <span>Google UX Design</span>
                    <span>Professional Certificate</span>
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="home-about__sub">Tech stack</h3>
                <dl className="home-stack">
                  {stack.map((group) => (
                    <div key={group.label}>
                      <dt>{group.label}</dt>
                      <dd>{group.items.join(", ")}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
