import { useEffect, useRef, useState, type ReactNode } from "react";
import { Dots, Footer, Nav } from "../components/Chrome";

const career = [
  { company: "noon", role: "Product Designer II", years: "2025–Present" },
  { company: "Fawry", role: "Junior Product Designer", years: "2024–2025" },
  { company: "Promolinks International", role: "UX Designer", years: "2023–2024" },
];

const lede =
  "I make research-based design decisions and ship working prototypes in code.";

const stack = [
  { label: "Design", items: ["Figma"] },
  { label: "Development", items: ["React", "Tailwind CSS", "shadcn/ui"] },
  { label: "AI tools", items: ["Cursor", "Claude", "ChatGPT"] },
  { label: "Version control & deployment", items: ["GitHub"] },
];

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

function StackIcon({ name }: { name: string }) {
  if (name === "Figma") {
    return (
      <Icon>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <circle cx="16.5" cy="16.5" r="3.2" />
      </Icon>
    );
  }
  if (name === "React") {
    return (
      <Icon>
        <circle cx="12" cy="12" r="1.6" />
        <ellipse cx="12" cy="12" rx="8" ry="3.2" />
        <ellipse cx="12" cy="12" rx="8" ry="3.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="8" ry="3.2" transform="rotate(120 12 12)" />
      </Icon>
    );
  }
  if (name === "Tailwind CSS") {
    return (
      <Icon>
        <path d="M5 14c1.5-3 3-4.5 4.5-4.5S12 11 13.5 11 16.5 9.5 18 6.5c.4 2.2-.2 4-1.8 5.4-1.2 1-2.5 1.4-4 1.1" />
        <path d="M5 18.5c1.5-2.4 3-3.6 4.5-3.6s2.4 1.2 3.6 1.2 2.6-1.2 4.2-3.6" />
      </Icon>
    );
  }
  if (name === "shadcn/ui") {
    return (
      <Icon>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M9 12h6M12 9v6" />
      </Icon>
    );
  }
  if (name === "Cursor") {
    return (
      <Icon>
        <path d="M6 4.5 17.5 12 11 13.2 8.8 19.5Z" />
      </Icon>
    );
  }
  if (name === "Claude") {
    return (
      <Icon>
        <path d="M12 4.5 13.6 9.4 18.5 11 13.6 12.6 12 17.5 10.4 12.6 5.5 11 10.4 9.4Z" />
      </Icon>
    );
  }
  if (name === "ChatGPT") {
    return (
      <Icon>
        <path d="M6 8.5A5.5 5.5 0 0 1 12 5h.5A4.5 4.5 0 0 1 17 9.2 4 4 0 0 1 16 16.5H9.2A4.2 4.2 0 0 1 6 8.5Z" />
      </Icon>
    );
  }
  return (
    <Icon>
      <circle cx="7" cy="7" r="2.2" />
      <circle cx="17" cy="7" r="2.2" />
      <circle cx="12" cy="17" r="2.2" />
      <path d="M9 8.2 15 8.2M8.2 8.8 10.6 15.2M15.8 8.8 13.4 15.2" />
    </Icon>
  );
}

function TypedLede() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setCount(lede.length);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.55 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || count >= lede.length) return;
    const pause = lede[count] === "." ? 220 : lede[count] === "," ? 90 : 26;
    const id = window.setTimeout(() => setCount((current) => current + 1), pause);
    return () => window.clearTimeout(id);
  }, [started, count]);

  return (
    <section className="lede-screen">
      <p className="lede" ref={ref} aria-label={lede}>
        <span className="lede-ghost" aria-hidden="true">
          {lede}
        </span>
        <span className="lede-live" aria-hidden="true">
          {lede.slice(0, count)}
          <span className="caret" />
        </span>
      </p>
    </section>
  );
}

export function Home() {
  useEffect(() => {
    document.title = "Rana Ebrahim";
  }, []);

  return (
    <div className="page">
      <Dots />
      <Nav />
      <main className="home">
        <section className="hero-stage">
          <h1 className="hero">Let’s collaborate</h1>
          <p className="hero-sans">and create good products together.</p>
        </section>

        <TypedLede />

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

        <section className="career education">
          <h2>Education</h2>
          <ol>
            <li>
              <span className="edu-mark" aria-hidden="true">
                <Icon>
                  <path d="M3.5 10 12 6l8.5 4L12 14Z" />
                  <path d="M7 12.2v3.2c0 .4 2.2 2.1 5 2.1s5-1.7 5-2.1v-3.2" />
                  <path d="M20.5 10.2V15" />
                </Icon>
              </span>
              <div>
                <p className="job-company">The American University in Cairo</p>
                <p className="job-role">
                  Marketing, with minors in Computer Science and Interactive Design
                </p>
              </div>
            </li>
            <li>
              <span className="edu-mark" aria-hidden="true">
                <Icon>
                  <circle cx="12" cy="9" r="3.2" />
                  <path d="M8.2 12.2 6.5 19l5.5-2.2L17.5 19l-1.7-6.8" />
                </Icon>
              </span>
              <div>
                <p className="job-company">Gamification Certificate</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="stack">
          <h2>Tech stack</h2>
          <div className="stack-board">
            {stack.map((group) => (
              <div key={group.label}>
                <p>{group.label}</p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>
                      <StackIcon name={item} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
