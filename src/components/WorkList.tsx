import { Link } from "react-router-dom";

export const work = [
  {
    name: "Pulse",
    to: "/work/pulse",
    description: "Product design for one of the Middle East's largest online shopping platforms.",
  },
  {
    name: "Echo",
    to: "/work/echo",
    description: "I owned the design of Echo, noon’s internal CRM built to replace Zoho.",
  },
  {
    name: "AI Analyst",
    to: "/work/analyst",
    description: "A chatbot for customer support analytics, vibe coded.",
  },
];

export function WorkList({ heading = "Selected work" }: { heading?: string }) {
  return (
    <section className="work-list" id="work">
      <div className="work-list__head">
        <h2>{heading}</h2>
        <p>({String(work.length).padStart(2, "0")})</p>
      </div>
      <ol>
        {work.map((item, i) => (
          <li key={item.name}>
            <Link to={item.to}>
              <span className="work-list__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="work-list__name">{item.name}</span>
              <span className="work-list__meta">{item.description}</span>
              <span className="work-list__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
