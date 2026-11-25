import { Link } from "react-router-dom";

export const work = [
  {
    name: "Pulse",
    to: "/work/pulse",
    description: "An AI-first chat workspace and live dashboard for noon’s support team, used by 200+ agents.",
  },
  {
    name: "Echo",
    to: "/work/echo",
    description: "noon’s internal CRM.",
  },
  {
    name: "AI Analyst",
    to: "/work/analyst",
    description: "Designed and built through Cursor: a customer support analytics chatbot.",
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
            <Link to={item.to} viewTransition>
              <span className="work-list__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="work-list__name" style={{ viewTransitionName: `work-${item.to.split("/").pop()}` }}>{item.name}</span>
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
