import { useEffect } from "react";
import { BrowserFrame, Dots, Footer, Nav } from "../components/Chrome";

const meta = [
  ["Role", "Solo Product Designer, with PM"],
  ["Timeline", "~8–12 months"],
  ["Platform", "Internal web app · dark/light · Arabic RTL + English"],
  ["Tools", "Figma, Dovetail"],
  ["Surfaces", "Agent chat · TL dashboard · QA Center"],
  ["Status", "Shipped, in daily use"],
];

const problems = [
  "Data without hierarchy. The MVP’s side panel listed 20+ equal fields, and “Is VIP: No” looked like the rest.",
  "Detours. Agents left for Zoho, Agent One and personal notes: slower replies, repeated questions, SLA risk.",
  "Passive dashboard. TLs saw numbers on a manually refreshed screen, with no way to act.",
  "AI bypassed. The business’s core bet wasn’t being used.",
];

const insights = [
  "Workarounds were symptoms. Notes held ticket context and saved replies the UI should have provided.",
  "Effort, not distrust. Agents skipped AI because a saved reply was faster than fixing a long, robotic one.",
  "TLs manage people, not chats. On a breach they contact the agent.",
];

const steps = [
  {
    n: "01",
    title: "Research → MoSCoW",
    body: "Must: unified context panel, canned replies, direct ticket access. Should: AI summary, live dashboard, VIP tagging. Won’t: an AI that replaces humans.",
  },
  {
    n: "02",
    title: "Sitemaps & key flows",
    body: "Two role-based surfaces, one design system.",
  },
  {
    n: "03",
    title: "Benchmarking",
    body: "Zendesk, Tidio, Intercom, Front and more gave options. Research decided which fit our agents.",
  },
  {
    n: "04",
    title: "Iterating with the PM",
    body: "Every new flow sent me back to research. Even the timestamp position in Arabic bubbles got a debate.",
  },
];

function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <div className="section-heading">
      <p>{index}</p>
      <h2>{title}</h2>
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="tags">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Rows({
  rows,
}: {
  rows: { label: string; body: string }[];
}) {
  return (
    <div className="decision-rows">
      {rows.map((row) => (
        <div className="decision-row" key={row.label}>
          <p>{row.label}</p>
          <p>{row.body}</p>
        </div>
      ))}
    </div>
  );
}

export function CaseStudy() {
  useEffect(() => {
    document.title = "Pulse · Rana Ebrahim";
  }, []);

  return (
    <div className="page case">
      <Dots />
      <Nav />
      <main>
        <header className="case-hero">
          <p className="case-kicker">Case study · noon · internal AI-powered support tool</p>
          <h1>Removing the detours</h1>
          <p className="case-dek">
            Redesigning Pulse so agents resolve in one screen and team leads act from the
            dashboard
          </p>
        </header>

        <section className="case-block">
          <div className="intro-split">
            <p className="lede">
              Agents built workarounds: extra tabs, personal notes, paraphrase tools. Team
              leads could see problems but couldn’t act on them. I redesigned Pulse so the
              detours aren’t needed, increasing AI adoption and lightening the workflow
              for both roles.
            </p>
            <dl className="meta">
              {meta.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="figure">
            <div className="slate">
              <BrowserFrame
                label="PULSE / WORKSPACE"
                src="/pulse/workspace.webp"
                alt="Pulse workspace with an AI summary, the chat, and conversation details"
              />
            </div>
            <figcaption>01 — The redesigned Pulse workspace.</figcaption>
          </figure>
        </section>

        <section className="case-block split">
          <SectionHeading index="00" title="Designed for" />
          <div className="personas">
            <article>
              <h3>L1 Agent</h3>
              <p>
                Handles up to 3 chats in Arabic and English. Needs context at a glance and
                AI drafts worth sending.
              </p>
            </article>
            <article>
              <h3>Team Lead</h3>
              <p>
                Watches several queues and, on a breach, contacts the agent. Needs signals
                they can act on.
              </p>
            </article>
          </div>
        </section>

        <section className="case-block">
          <div className="split">
            <SectionHeading index="01" title="The problem" />
            <ul className="problem-list">
              {problems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <figure className="figure">
            <figcaption>The MVP had the data but no hierarchy and no actions.</figcaption>
            <div className="shot-pair">
              <div className="frame">
                <img src="/pulse/mvp-inbox.webp" alt="The earlier inbox, with a flat side panel of equal fields" />
              </div>
              <div className="frame">
                <img src="/pulse/mvp-dashboard.webp" alt="The earlier realtime dashboard, refreshed by hand" />
              </div>
            </div>
          </figure>
        </section>

        <section className="case-block">
          <div className="split">
            <SectionHeading index="02" title="Research → insight" />
            <div className="research">
              <p className="method">
                Interviews (6 agents + TLs) · 2 focus groups (Arabic / English) · TL
                workflow session · synthesized in Dovetail
              </p>
              <div className="stats">
                <article>
                  <p>4 of 6</p>
                  <span>agents lacked order and complaint history in-chat</span>
                </article>
                <article>
                  <p>4 of 6</p>
                  <span>kept canned replies in external notebooks</span>
                </article>
              </div>
              <ul className="problem-list">
                {insights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <blockquote>
                <p>
                  “When a chat starts, I need to immediately see if the customer has
                  previous complaints and their status.”
                </p>
                <footer>— L1 agent</footer>
              </blockquote>
            </div>
          </div>
          <figure className="figure">
            <div className="frame">
              <img
                src="/pulse/dovetail.webp"
                alt="Research synthesis: four of six agents lacked customer history in the chat"
              />
            </div>
            <figcaption>
              Tagged patterns pointed to missing hierarchy, not missing features.
            </figcaption>
          </figure>
        </section>

        <section className="case-block">
          <div className="split">
            <SectionHeading index="03" title="Process" />
            <p className="method">
              Research → MoSCoW feature priortization→ sitemaps and key flows →
              benchmarking → iterations with the PM, returning to research for every new
              flow.
            </p>
          </div>
          <ol className="steps">
            {steps.map((step) => (
              <li key={step.n}>
                <p>{step.n}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <figure className="figure">
            <div className="frame">
              <img src="/pulse/process.webp" alt="Benchmark notes on Zendesk, beside the live agent workspace" />
            </div>
            <figcaption>Scope came from research; options came from benchmarks.</figcaption>
          </figure>
        </section>

        <section className="case-block tight">
          <div className="split">
            <SectionHeading index="04" title="Key decisions" />
            <p className="method">
              Every workaround pointed to something the product should provide, so I
              removed the need for the detour.
            </p>
          </div>
        </section>

        <section className="decision">
          <p className="decision-kicker">Decision 1</p>
          <h2>Replace the workarounds, don’t add features</h2>
          <Tags items={["Recognition over recall", "Progressive disclosure"]} />
          <Rows
            rows={[
              {
                label: "Insight",
                body: "Notes existed because context and saved replies lived elsewhere.",
              },
              {
                label: "Designed",
                body: "A side panel with live timers and interaction history, plus AI replies in the composer, so there’s no reason to keep notes.",
              },
              {
                label: "Trade off",
                body: "In-chat notes, pushing agents toward AI replies instead of personal scripts.",
              },
            ]}
          />
          <figure className="figure">
            <div className="frame">
              <img
                src="/pulse/panel.webp"
                alt="Conversation details in focus: customer, VIP, order, and live timers"
              />
            </div>
            <figcaption>Everything agents opened a tab or note for is one glance away.</figcaption>
          </figure>
        </section>

        <section className="decision">
          <p className="decision-kicker">Decision 2</p>
          <h2>Make AI the default path, and cheap to trust</h2>
          <Tags items={["Tesler’s Law", "Doherty threshold"]} />
          <Rows
            rows={[
              {
                label: "Insight",
                body: "Agents skipped AI because fixing it cost more than pasting.",
              },
              {
                label: "Designed",
                body: "An AI summary opens each chat; drafts stay editable (intentional friction, so agents review before sending); a “Generating” skeleton keeps the UI instant.",
              },
              {
                label: "Trade-off",
                body: "A per-chat Turn off AI with confirm replaces a global toggle: it keeps AI consistent and still gives agents control.",
              },
            ]}
          />
          <figure className="figure">
            <div className="frame">
              <img
                src="/pulse/ai.webp"
                alt="AI replies turned on, with an editable draft and a generating state"
              />
            </div>
            <figcaption>AI is the default, and opting out is deliberate.</figcaption>
          </figure>
        </section>

        <section className="decision">
          <p className="decision-kicker">Decision 3</p>
          <h2>Signals that lead to action, not interruptions</h2>
          <Tags items={["Von Restorff", "Hick’s Law", "Data-ink ratio"]} />
          <Rows
            rows={[
              {
                label: "Agents",
                body: "Stakeholder proposed a buzzing alert for VIPs. I proposed a gold crown and VVIP badge instead: a buzz interrupts mid-reply and piles onto a busy day, while the crown costs no attention, and aging VIP chats still pick up SLA badges.",
              },
              {
                label: "TLs",
                body: "A breach banner, inline View / Assign, an agent drawer with Message Agent, a status donut and a department filter.",
              },
              {
                label: "Cut",
                body: "CSAT, closed chats and the concurrency column (now merged into load, 3/3). If no one acts on a metric, it goes.",
              },
            ]}
          />
          <div className="shot-pair captioned">
            <figure className="figure">
              <div className="frame">
                <img src="/pulse/vip.webp" alt="A VIP badge on the customer, seen while choosing the chat" />
              </div>
              <figcaption>
                Priority is seen at the moment of choice, without an interruption.
              </figcaption>
            </figure>
            <figure className="figure">
              <div className="frame">
                <img
                  src="/pulse/dashboard.webp"
                  alt="Team lead dashboard with a breach signal and Message Agent"
                />
              </div>
              <figcaption>Every signal ends in one action on the right person.</figcaption>
            </figure>
          </div>
        </section>

        <section className="case-block">
          <div className="split">
            <SectionHeading index="05" title="Craft" />
            <div className="decision-rows">
              <div className="decision-row">
                <p>States</p>
                <p>
                  Failed send with Try again, return-details card, RTL-first Arabic
                  bubbles, empty and skeleton states.
                </p>
              </div>
            </div>
          </div>
          <figure className="figure">
            <figcaption className="craft-label">Loading state</figcaption>
            <BrowserFrame
              label="Loading state"
              src="/pulse/loading.webp"
              alt="Skeleton loading state of the Pulse workspace"
            />
          </figure>
          <div className="frame craft-still">
            <img
              src="/pulse/craft.webp"
              alt="States for the summary, composer, alerts, chat list, and message bubbles"
            />
          </div>
        </section>

        <section className="case-block split">
          <SectionHeading index="06" title="Impact & reflection" />
          <div className="impact">
            <article>
              <h3>Increased AI adoption</h3>
              <p>More AI use means faster chat resolution, and better customer support.</p>
            </article>
            <article>
              <h3>A more efficient journey</h3>
              <p>Context in one panel instead of tabs; one-action alerts for TLs.</p>
            </article>
            <article>
              <h3>Lower cognitive load</h3>
              <p>For agents and team leads alike.</p>
            </article>
            <p className="takeaway">
              Takeaway. I designed to remove detours but can’t prove it yet. Next I’d
              instrument tab-switching and AI-draft edit rate.
            </p>
          </div>
        </section>
      </main>
      <Footer giant />
    </div>
  );
}
