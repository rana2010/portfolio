import { useEffect, useState } from "react";
import { asset } from "../asset";
import { Dots, Footer, Nav } from "../components/Chrome";
import { EchoPrototype } from "../components/EchoPrototype";
import { Editable } from "../components/EditContext";
import { Laptop } from "../components/Laptop";

const glance = [
  ["role", "Role", "Product Designer"],
  ["product", "Product", "Internal CRM"],
  ["focus", "Focus", "Ticket creation"],
  ["status", "Status", "In development"],
] as const;

const tags = [
  ["tag-ui", "UI Design"],
  ["tag-forms", "Form Design"],
  ["tag-disclosure", "Progressive Disclosure"],
  ["tag-testing", "Usability Testing"],
] as const;

// the three tries, each in one line: what it was, why it did not work, the principle behind the call
const tries = [
  {
    id: "v1",
    name: "Scroll rail",
    what: "One long form, with a rail that jumps to the required fields.",
    why: "In testing, agents were confused: a new behaviour to learn mid-task.",
    principle: "Jakob's law",
    src: "/images/echo/echo-v1-rail.webp",
    alt: "Version 1: one long form with required-field chips and a scroll rail on the right.",
  },
  {
    id: "v2",
    name: "Numbered stepper",
    what: "A familiar stepper down the side.",
    why: "Fields change with the department and layout, so the steps shifted under the agent.",
    principle: "Consistency",
    src: "/images/echo/echo-v2-stepper.webp",
    alt: "Version 2: a numbered stepper on the left of the ticket form.",
  },
] as const;

const finals = [
  ["f1", "/images/echo/echo-final-step1.webp", "Two decisions first: department and layout.", "Progressive disclosure"],
  ["f2", "/images/echo/echo-final-step2.webp", "Then only the fields this ticket needs, in sections.", "Chunking"],
  ["f3", "/images/echo/echo-final-required.webp", "A missed field is outlined, with a message saying what to do.", "Error recovery"],
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
            text="Understanding what agents need mid-call, and iterating to the calmest form."
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
          <Editable id="try-heading" as="h2" text="Try it" />
          <Editable id="try-body" className="support" text="Pick a department and a layout, press Next, then submit with a field empty." />
          <Laptop label="Echo ticket form, interactive">
            <EchoPrototype />
          </Laptop>
        </section>

        <section className="case-block">
          <Editable id="problem-heading" as="h2" text="The problem" />
          <Editable
            id="problem-1"
            className="statement"
            text="Agents create tickets during urgent conversations, and the fields change with every department and layout."
          />
          <Editable id="problem-2" className="support" text="noon is replacing Zoho with Echo to cut cost and shape the tool around its teams." />
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
          <div className="echo-final">
            {finals.map(([id, src, caption, principle]) => (
              <figure key={id} className="figure">
                <div className="frame">
                  <Shot src={src} alt={caption} />
                </div>
                <figcaption>
                  <span className="echo-chip">{principle}</span>
                  <Editable id={`${id}-caption`} as="span" text={caption} />
                </figcaption>
              </figure>
            ))}
          </div>
          <Editable id="tradeoff" className="statement" text="The trade-off: one extra click, for a form that fits the ticket." />
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
