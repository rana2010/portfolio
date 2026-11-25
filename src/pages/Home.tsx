import { useEffect, useRef } from "react";
import { Dots, Footer, Nav } from "../components/Chrome";
import { WorkList } from "../components/WorkList";
import { ScrollFill } from "../components/Motion";

const career = [
  { company: "noon", role: "Product Designer II", years: "Jan 2025 – Present" },
  { company: "Fawry", role: "Product Designer", years: "Jan – Sep 2024" },
  { company: "Promolinks International", role: "User Experience Designer", years: "May – Nov 2023" },
];

const flow = [
  { step: "Research", line: "Interviews, focus groups, synthesis", tools: ["Dovetail"] },
  { step: "Design", line: "Flows, systems, high fidelity", tools: ["Figma"] },
  { step: "Build", line: "Coded prototypes with AI", tools: ["Claude", "Cursor"] },
  { step: "Ship", line: "Versioned and deployed", tools: ["GitHub"] },
];

export function Home() {
  const hero = useRef<HTMLElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = hero.current;
      if (!el) return;
      const p = Math.min(1, Math.max(0, window.scrollY / (el.offsetHeight * 0.9)));
      el.style.setProperty("--hero-p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.title = "Rana Ebrahim";
  }, []);

  return (
    <div className="page" id="top">
      <Dots />
      <Nav />
      <main className="home-ds">
        <section className="home-hero" ref={hero}>
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
            <ScrollFill
              className="home-about__big"
              text="Product Designer with 3+ years of experience across e-commerce and fintech."
            />
            <ScrollFill text="I work end to end, across user research, product discovery, UX/UI design and coded prototypes, with a focus on behavioral design and AI-assisted products." />

            <h3 className="home-about__sub">Career</h3>
            <ol className="home-career">
              {career.map((job) => (
                <li key={job.company}>
                  <span className="home-career__co">{job.company}</span>
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
                    <span>BA, Communication and Interactive Design</span>
                    <span className="home-edu__yr">2018 – 2023</span>
                  </li>
                  <li>
                    <span>Gamification</span>
                    <span>University of Pennsylvania · Online certificate</span>
                    <span className="home-edu__yr">2024</span>
                  </li>
                </ol>
              </div>
            </div>

            <h3 className="home-about__sub">How I work</h3>
            <ol className="home-flow">
              {flow.map((f) => (
                <li key={f.step}>
                  <span className="home-flow__step">
                    {f.step}
                  </span>
                  <span className="home-flow__line">{f.line}</span>
                  <span className="home-flow__tools">{f.tools.join(", ")}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
