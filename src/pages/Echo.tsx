import { useEffect, useState } from "react";
import { asset } from "../asset";
import { Dots, Footer, Nav } from "../components/Chrome";
import { EchoFlow } from "../components/EchoFlow";
import { Editable } from "../components/EditContext";

const glance = [
  ["role", "Role", "Product Designer"],
  ["scope", "Scope", "Whole product"],
  ["focus", "Focus", "Ticket creation"],
  ["status", "Status", "In development"],
] as const;

const tags = [
  ["tag-research", "User Research"],
  ["tag-shadowing", "Shadowing"],
  ["tag-ui", "UI Design"],
  ["tag-disclosure", "Progressive Disclosure"],
] as const;

// the two tries that did not work: what it was, why it failed, the principle behind dropping it
const tries = [
  {
    id: "v1",
    name: "A scroll rail",
    what: "One long form, with a rail that jumps to the required fields.",
    why: "In testing, agents were confused: a new behaviour to learn mid-call.",
    principle: "Jakob's law",
    src: "/images/echo/echo-v1-rail.webp",
    alt: "Version 1: one long form with required-field chips and a scroll rail on the right.",
  },
  {
    id: "v2",
    name: "A numbered stepper",
    what: "A familiar stepper down the side.",
    why: "Fields change with the department and layout, so the steps shifted under the agent.",
    principle: "Consistency",
    src: "/images/echo/echo-v2-stepper.webp",
    alt: "Version 2: a numbered stepper on the left of the ticket form.",
  },
] as const;

function Shot({ src, alt }: { src: string; alt: string }) {
  const [missing, setMissing] = useState(false);
  if (missing) return <div className="shot-pending">{src.split("/").pop()}</div>;
  return <img src={asset(src)} alt={alt} loading="lazy" onError={() => setMissing(true)} />;
}

export function Echo() {
  useEffect(() => {
    document.title = "Ticket Creation · Rana Ebrahim";
  }, []);

  return (
    <div className="page case echo">
      <Dots />
      <Nav />
      <main>
        <header className="case-hero">
          <Editable id="kicker" className="case-kicker" text="Echo · noon's internal CRM" />
          <Editable id="title" as="h1" className="case-title" text="Ticket Creation" />
          <Editable
            id="summary"
            className="case-summary"
            text="I designed Echo, the CRM replacing Zoho at noon, end to end. This is the story of its most used flow: creating a ticket while a customer is waiting."
          />
          <ul className="tags">
            {tags.map(([id, label]) => (
              <Editable key={id} id={id} as="li" text={label} />
            ))}
          </ul>
          <dl className="glance">
            {glance.map(([id, label, value]) => (
              <div key={id}>
                <Editable id={`${id}-label`} as="dt" text={label} />
                <Editable id={`${id}-value`} as="dd" text={value} />
              </div>
            ))}
          </dl>
        </header>

        <section className="case-block">
          <Editable id="why-heading" as="h2" text="Why Echo" />
          <Editable
            id="why-1"
            className="support"
            text="noon wanted to stop paying for Zoho and shape a CRM around its own teams. For agents, that meant giving up a tool they knew. A new tool that is merely different slows them down on day one."
          />
        </section>

        <section className="case-block">
          <Editable id="research-heading" as="h2" text="Watching agents work" />
          <Editable
            id="research-1"
            className="support"
            text="Before designing anything, I ran research sessions and shadowed agents in Zoho to see how their days actually worked. One thing shaped everything after it:"
          />
          <Editable
            id="research-insight"
            className="statement"
            text="agents start filling in the ticket while the customer is still talking."
          />
          <Editable
            id="research-2"
            className="support"
            text="Listening, filtering and typing at once. Creating a ticket is the flow agents use most, and the one under the most pressure, so it is where I went deep."
          />
        </section>

        <section className="case-block">
          <Editable id="versions-heading" as="h2" text="What didn't work" />
          <div className="echo-tries">
            {tries.map((t, i) => (
              <article key={t.id} className="echo-try">
                <div className="frame">
                  <Shot src={t.src} alt={t.alt} />
                </div>
                <Editable id={`${t.id}-name`} as="h3" text={`${i + 1}. ${t.name}`} />
                <Editable id={`${t.id}-what`} className="support" text={t.what} />
                <Editable id={`${t.id}-why`} className="echo-try__why" text={t.why} />
                <span className="echo-chip">{t.principle}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="case-block">
          <Editable id="final-heading" as="h2" text="What worked" />
          <ul className="echo-principles">
            <li>
              <span className="echo-chip">Progressive disclosure</span>
              <Editable id="p1" as="span" text="Two decisions first: department and layout." />
            </li>
            <li>
              <span className="echo-chip">Chunking</span>
              <Editable id="p2" as="span" text="Then only that ticket's fields, grouped in sections." />
            </li>
            <li>
              <span className="echo-chip">Error recovery</span>
              <Editable id="p3" as="span" text="A missed field is outlined, with a message saying what to do." />
            </li>
          </ul>
          <Editable id="tradeoff" className="statement" text="The trade-off: one extra click, for a form that fits the ticket." />
        </section>

        <section className="case-block">
          <Editable id="try-heading" as="h2" text="Try the final flow" />
          <EchoFlow />
        </section>

        <section className="case-block">
          <Editable id="outcome-heading" as="h2" text="Next" />
          <Editable id="outcome-1" className="support" text="Echo is in development: no usage data yet. Usability testing of the final flow with agents comes next." />
        </section>
      </main>
      <Footer next={{ name: "CS Analytics Bot", to: "/work/analyst" }} />
    </div>
  );
}
