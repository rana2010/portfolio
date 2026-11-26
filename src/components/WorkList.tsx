import { Link } from "react-router-dom";

export const work = [
  {
    name: "Pulse",
    to: "/work/pulse",
    description: "AI · Customer Support Chat",
  },
  {
    name: "Ticket Creation",
    to: "/work/echo",
    description: "Understanding user needs and iterating for the best UI"
  },
  {
    name: "CS Analytics Bot",
    to: "/work/analyst",
    description: "AI analyst used for product discovery",
  },
];

export function WorkList({ heading = "Selected work" }: { heading?: string }) {
  return (
    <section className="work-list" id="work">
      <div className="work-list__head">
        <h2>{heading}</h2>
      </div>
      <ol>
        {work.map((item) => (
          <li key={item.name}>
            <Link to={item.to} viewTransition>
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
