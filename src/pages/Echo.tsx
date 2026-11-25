import { useEffect, useState } from "react";
import { asset } from "../asset";
import { Dots, Footer, Nav } from "../components/Chrome";
import { EchoPrototype } from "../components/EchoPrototype";
import { Editable } from "../components/EditContext";

const glance = [
  ["role", "Role", "Product Designer, end to end"],
  ["context", "Context", "noon's internal CRM, replacing Zoho to cut cost and allow customisation"],
  ["focus", "Focus", "Ticket creation, the most used flow"],
  ["status", "Status", "In development, usability testing planned"],
] as const;

const tags = [
  ["tag-ui", "UI Design"],
  ["tag-forms", "Form Design"],
  ["tag-disclosure", "Progressive Disclosure"],
  ["tag-tools", "Internal Tools"],
] as const;

function Media({ src, alt }: { src: string; alt: string }) {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return (
      <div className="shot-pending">
        <span>{src.split("/").pop()}</span>
      </div>
    );
  }
  return <img src={asset(src)} alt={alt} onError={() => setMissing(true)} />;
}

function Figure({ src, alt, captionId, caption }: { src: string; alt: string; captionId: string; caption: string }) {
  return (
    <figure className="figure">
      <div className="frame">
        <Media src={src} alt={alt} />
      </div>
      <figcaption>
        <Editable id={captionId} as="span" text={caption} />
      </figcaption>
    </figure>
  );
}

export function Echo() {
  useEffect(() => {
    document.title = "Echo · Rana Ebrahim";
  }, []);

  return (
    <div className="page case echo">
      <Dots />
      <Nav />
      <main>
        <header className="case-hero">
          <Editable id="kicker" className="case-kicker" text="Case study · noon · internal CRM" />
          <Editable id="title" as="h1" className="case-title" text="Echo: a ticket form that keeps up with the call" />
          <Editable
            id="summary"
            className="case-summary"
            text="noon is replacing Zoho with its own CRM, Echo, to cut cost and shape the tool around its teams. I designed it end to end. This is the story of one screen, Create Ticket, and the three tries it took to make it calm."
          />
          <ul className="tags">
            {tags.map(([id, label]) => (
              <Editable key={id} id={id} as="li" text={label} />
            ))}
          </ul>
        </header>

        <section className="case-block">
          <Editable id="glance-heading" as="h2" text="At a glance" />
          <dl className="glance">
            {glance.map(([id, label, value]) => (
              <div key={id}>
                <Editable id={`${id}-label`} as="dt" text={label} />
                <Editable id={`${id}-value`} as="dd" text={value} />
              </div>
            ))}
          </dl>
        </section>

        <section className="case-block">
          <Editable id="try-heading" as="h2" text="Try the final flow" />
          <Editable
            id="try-body"
            className="support"
            text="Pick a department and a layout, press Next, then try to submit with a field empty."
          />
          <EchoPrototype />
        </section>

        <section className="case-block">
          <Editable id="problem-heading" as="h2" text="The problem" />
          <Editable
            id="problem-1"
            className="support"
            text="Agents create tickets during urgent conversations. The fields a ticket needs change with the department and the layout the agent picks, so one long form shows too much, and the wrong things."
          />
        </section>

        <section className="case-block">
          <Editable id="versions-heading" as="h2" text="Three tries" />
          <article className="version">
            <Editable id="v1-heading" as="h3" text="1. A rail that jumps to required fields." />
            <Editable
              id="v1-body"
              className="support"
              text="One long form, with required-field chips and a rail on the right that scrolls the agent to what is missing. In testing, agents were confused: it was a new behaviour to learn in the middle of a task. People expect a form to work like the forms they already know (Jakob's law)."
            />
            <Figure
              src="/images/echo/echo-v1-rail.webp"
              alt="Version 1: one long form with required-field chips and a scroll rail on the right."
              captionId="v1-caption"
              caption="Version 1. Clever, but a new pattern to learn mid-call."
            />
          </article>
          <article className="version">
            <Editable id="v2-heading" as="h3" text="2. A numbered stepper." />
            <Editable
              id="v2-body"
              className="support"
              text="A familiar pattern this time. But the fields change with the department and layout, so the steps change too: the map moves under the agent's feet. Under time pressure, an interface that is not predictable adds load instead of removing it."
            />
            <Figure
              src="/images/echo/echo-v2-stepper.webp"
              alt="Version 2: a numbered stepper on the left of the ticket form."
              captionId="v2-caption"
              caption="Version 2. Familiar, but the steps shift with every choice."
            />
          </article>
          <article className="version">
            <Editable id="v3-heading" as="h3" text="3. Two choices first, then only what they need." />
            <Editable
              id="v3-body"
              className="support"
              text="Progressive disclosure: the agent answers the two questions that shape the ticket, department and layout, and presses Next. Only then do the fields for that ticket appear, grouped into sections with clear headings (chunking, and Gestalt proximity). A quiet section list keeps them oriented without asking them to navigate."
            />
            <Figure
              src="/images/echo/echo-final-step1.webp"
              alt="Final version, step 1: only Department and Layout, with a section list on the left."
              captionId="v3a-caption"
              caption="Step 1. Two decisions, nothing else competing for attention."
            />
            <Figure
              src="/images/echo/echo-final-step2.webp"
              alt="Final version, step 2: the fields for the chosen layout, grouped into sections."
              captionId="v3b-caption"
              caption="Step 2. Only the fields this ticket needs."
            />
            <Editable
              id="v3-errors"
              className="support"
              text="Mistakes are caught, not punished: submit with a required field empty and that field is outlined, with a short message saying what to do (Nielsen: help users recognise, diagnose and recover from errors)."
            />
            <Figure
              src="/images/echo/echo-final-required.webp"
              alt="A missed required field outlined in red, with a 'Please complete required fields' message."
              captionId="v3c-caption"
              caption="A missed field is easy to spot and fix."
            />
            <Editable id="tradeoff" className="statement" text="The trade-off: one extra click, for a form that fits the ticket." />
          </article>
        </section>

        <section className="case-block">
          <Editable id="outcome-heading" as="h2" text="Where it is now" />
          <Editable
            id="outcome-1"
            className="support"
            text="Echo is in development, so there is no usage data yet. Next is usability testing of the final flow with agents."
          />
          <Editable
            id="outcome-take"
            className="statement"
            text="What I took from it: the best version came from removing things, not adding them."
          />
        </section>
      </main>
      <Footer next={{ name: "AI Analyst", to: "/work/analyst" }} />
    </div>
  );
}
