import { useEffect, useState } from "react";
import { asset } from "../asset";
import { Dots, Footer, Nav } from "../components/Chrome";
import { Editable, useEdit } from "../components/EditContext";

const glance = [
  ["role", "Role", "Product Designer, owning Echo's design end to end"],
  ["context", "Context", "Internal CRM replacing noon's Zoho subscription"],
  ["platform", "Platform", "Desktop web"],
  ["status", "Status", "In development, usability testing planned"],
] as const;

const tags = [
  ["tag-product", "Product Design"],
  ["tag-tools", "Internal Tools"],
  ["tag-crm", "CRM"],
  ["tag-disclosure", "Progressive Disclosure"],
  ["tag-interaction", "Interaction Design"],
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

function Figure({
  src,
  alt,
  captionId,
  caption,
}: {
  src: string;
  alt: string;
  captionId: string;
  caption: string;
}) {
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
  const { editing, toggleEdit } = useEdit();

  useEffect(() => {
    document.title = "Echo · Rana Ebrahim";
  }, []);

  return (
    <div className="page case echo">
        <Dots />
        <Nav />
        <main>
          <header className="case-hero">
            <Editable
              id="kicker"
              className="case-kicker"
              text="Case study · noon · internal CRM"
            />
            <Editable
              id="title"
              as="h1"
              className="case-title"
              text="Echo: noon's internal CRM system"
            />
            <Editable
              id="summary"
              className="case-summary"
              text="I owned the design of Echo, noon's internal CRM built to replace Zoho. Shadowing showed agents fill in tickets while the customer is still talking, so I deep-dived the ticket creation flow and rebuilt it around progressive disclosure after two versions failed."
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
            <Figure
              src="/images/echo/echo-hero.webp"
              alt="Final ticket creation screen on a clean background."
              captionId="hero-caption"
              caption="Echo's ticket form, designed for agents who are typing while the customer is still talking."
            />
          </section>

          <section className="case-block">
            <Editable id="problem-heading" as="h2" text="The problem" />
            <Editable
              id="problem-1"
              className="support"
              text="noon wanted to stop paying for Zoho. That sounds like a procurement decision, but for the people using it, it meant giving up a tool they knew for one they didn't."
            />
            <Editable
              id="problem-2"
              className="support"
              text="A new CRM that is merely different slows agents down on day one. Benchmarking showed the big names in the market were dense and complex, so I set one rule for Echo:"
            />
            <Editable
              id="problem-rule"
              className="statement"
              text="every screen has to earn its place by keeping the agent focused."
            />
            <Figure
              src="/images/echo/echo-sitemap.webp"
              alt='The cleaned-up sitemap with the "Create Ticket" branch highlighted.'
              captionId="sitemap-caption"
              caption="Echo's full structure (tickets, agents, organization, and customization), mapped before any screen was designed."
            />
          </section>

          <section className="case-block">
            <Editable id="shadow-heading" as="h2" text="What shadowing revealed" />
            <Editable
              id="shadow-1"
              className="support"
              text="I started by shadowing agents in Zoho to see how their days actually worked."
            />
            <Editable
              id="shadow-2"
              className="support"
              text="One observation shaped everything after it:"
            />
            <Editable
              id="shadow-insight"
              className="statement"
              text="agents don't wait for the call to end. They start filling in the ticket while the customer is still talking."
            />
            <Editable
              id="shadow-3"
              className="support"
              text="That is divided attention. Listening, filtering, and typing happen at once, so any form that makes an agent scan or hunt competes with the customer on the line. Ticket creation became the flow to go deep on, because it was the most frequent and the most pressure-sensitive."
            />
          </section>

          <section className="case-block">
            <Editable
              id="versions-heading"
              as="h2"
              text="Three versions, three different failures"
            />
            <article className="version">
              <Editable id="v1-heading" as="h3" text="Version 1: the stepper." />
              <Editable
                id="v1-body"
                className="support"
                text="I gave agents a section stepper beside a long form to keep them oriented. It didn't prevent mistakes. A stepper lets someone jump anywhere, including straight to Submit, so a hurried agent could skip required fields. It solved orientation, not completeness."
              />
              <Figure
                src="/images/echo/echo-v1-stepper.webp"
                alt="A numbered section stepper beside the ticket form."
                captionId="v1-caption"
                caption="It solved orientation, not completeness."
              />
            </article>
            <article className="version">
              <Editable id="v2-heading" as="h3" text="Version 2: the required-field tracker." />
              <Editable
                id="v2-body"
                className="support"
                text="I added chips and a clickable scroll rail that marked required sections. It looked odd, and adjusting it didn't fix that. People expect a form to look like forms they've used before, and an agent mid-call has no spare attention to decode a new pattern. I had added interface to explain the form instead of fixing the form."
              />
              <Figure
                src="/images/echo/echo-v2-tracker.webp"
                alt="The chips-and-scroll-rail screen with callouts on what looked wrong."
                captionId="v2-caption"
                caption="I kept the rejected idea in because dropping it was the key judgment call."
              />
            </article>
            <article className="version">
              <Editable id="v3-heading" as="h3" text="Version 3: progressive disclosure." />
              <Editable
                id="v3-body"
                className="support"
                text="The real problem was how many fields competed for attention at once. Step 1 now shows only what the agent needs first. Step 2 reveals the next set. A familiar section list keeps them oriented, and submitting without required fields triggers an inline error."
              />
              <Figure
                src="/images/echo/echo-hero.webp"
                alt="Step 1 of the ticket form, showing only the first fields."
                captionId="v3-caption"
                caption="Each version failed in a different way, and each failure shaped the next."
              />
              <Editable
                id="tradeoff"
                className="statement"
                text="The trade-off I accepted: one extra step."
              />
              <Editable
                id="tradeoff-body"
                className="support"
                text="I chose a shorter screen at each moment over a single long page."
              />
            </article>
          </section>

          <section className="case-block">
            <Editable id="flow-heading" as="h2" text="The final flow" />
            <Editable
              id="flow-body"
              className="support"
              text="Two steps, ordered by what agents need first. Required fields show inline errors if the agent submits too early, and a successful submit returns them to the ticket list with a confirmation."
            />
            <Figure
              src="/images/echo/echo-error.webp"
              alt="Submitting too early shows an inline error on the required fields."
              captionId="flow-caption"
              caption="Every state designed for agents who submit in a hurry."
            />
          </section>

          <section className="case-block">
            <Editable id="outcome-heading" as="h2" text="Outcome and reflection" />
            <Editable
              id="outcome-1"
              className="support"
              text="Echo is still in development, so there is no usage data yet. What exists is a product mapped end to end and a core flow reshaped around a real behavior."
            />
            <Editable
              id="outcome-next"
              className="support"
              text="Next: test time-to-create and missed required fields on a simulated call, comparing all three versions."
            />
            <Editable
              id="outcome-take"
              className="statement"
              text="What I took from it: my best version came from admitting the first two had solved the wrong problem."
            />
          </section>
        </main>
        <Footer giant />
        <button
          type="button"
          className={editing ? "edit-toggle is-on" : "edit-toggle"}
          aria-pressed={editing}
          onClick={toggleEdit}
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>
    );
  }
