import { useEffect } from "react";
import { asset } from "../asset";
import { BrowserFrame, Dots, Footer, Nav } from "../components/Chrome";

const meta = [
  ["Timeline", "12 months: 8 to design and ship, 4 iterating on features and supporting flows"],
  ["Platform", "Internal web app · dark/light · Arabic RTL + English"],
  ["Tools", "Figma, Dovetail"],
  ["Surfaces", "Agent chat · TL dashboard · QA Center"],
  ["Status", "Shipped, in daily use"],
];

const problems = [
  "Data without hierarchy. The MVP’s side panel listed 20+ equal fields, and “Is VIP: No” looked like the rest.",
  "Detours. Agents left for Zoho, an internal order-tracking tool and personal notes: slower replies, repeated questions, SLA risk.",
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
    body: "Must: unified context panel, direct ticket access. Should: AI summary, performance dashboard, VIP tagging. Could: internal notes, translation. Won’t: an AI that replaces humans.",
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

const moscow = [
  {
    title: "Must",
    items: [
      "Unified customer info panel",
      "Direct access to order and ticket info from chat",
      "Chat transfer to agents and departments",
    ],
  },
  {
    title: "Should",
    items: [
      "AI summary per chat",
      "Customer tagging (VIP, repeat complaints)",
      "Chat queue filters (mine, new, waiting)",
    ],
  },
  {
    title: "Could",
    items: ["Internal agent notes", "Multilingual auto-translation", "Sentiment tagging"],
  },
  {
    title: "Won’t (for now)",
    items: ["AI replacing human agents", "Gamification (leaderboards, badges)", "Phone and email channels"],
    wont: true,
  },
];

function SectionIntro({
  index,
  title,
  headline,
}: {
  index: string;
  title: string;
  headline: string;
}) {
  return (
    <header className="section-intro">
      <p className="section-label">
        <span>{index}</span>
        {title}
      </p>
      <h2>{headline}</h2>
    </header>
  );
}

function Lead({ text }: { text: string }) {
  const i = text.indexOf(". ");
  if (i === -1) return <>{text}</>;
  return (
    <>
      <strong>{text.slice(0, i + 1)}</strong> {text.slice(i + 2)}
    </>
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
        <div className="decision-row" key={row.label} data-label={row.label}>
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
          <div className="results">
            <div>
              <p>−20%</p>
              <span>average handling time in the first 6 months (per PM)</span>
            </div>
            <div>
              <p>200+</p>
              <span>agents across noon marketplaces use it daily</span>
            </div>
            <div>
              <p>Solo</p>
              <span>product designer, working with a PM</span>
            </div>
          </div>
        </header>

        <section className="case-block">
          <div className="intro-split">
            <p className="lede">
              Agents built workarounds: extra tabs, personal notes, paraphrase tools. Team
              leads could see problems but couldn’t act on them. I redesigned Pulse so the
              detours aren’t needed. Average handling time dropped 20% in the first 6
              months after agents onboarded, with no other workflow changes (per PM).
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

        <section className="case-block">
          <SectionIntro
            index="00"
            title="Designed for"
            headline="Two roles: one answers chats, one manages people."
          />
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
          <SectionIntro
            index="01"
            title="The problem"
            headline="The MVP had the data, but no hierarchy and no actions."
          />
          <div className="col">
            <ul className="problem-list">
              {problems.map((item) => (
                <li key={item}>
                  <Lead text={item} />
                </li>
              ))}
            </ul>
          </div>
          <figure className="figure">
            <figcaption>Before: the MVP inbox and the hand-refreshed dashboard.</figcaption>
            <div className="shot-pair">
              <div className="frame">
                <img src={asset("/pulse/mvp-inbox.webp")} alt="The earlier inbox, with a flat side panel of equal fields" />
              </div>
              <div className="frame">
                <img src={asset("/pulse/mvp-dashboard.webp")} alt="The earlier realtime dashboard, refreshed by hand" />
              </div>
            </div>
          </figure>
        </section>

        <section className="case-block">
          <SectionIntro
            index="02"
            title="Research → insight"
            headline="Workarounds were symptoms of missing hierarchy, not missing features."
          />
          <div className="col">
            <div className="research">
              <p className="method">
                Multiple interview rounds with agents and team leads (incl. group
                interviews) · 2 focus groups (Arabic / English) · TL workflow session ·
                synthesized in Dovetail
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
              <p className="method">Both from one round of 6 agent interviews.</p>
              <ul className="problem-list">
                {insights.map((item) => (
                  <li key={item}>
                    <Lead text={item} />
                  </li>
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
        </section>

        <section className="case-block">
          <SectionIntro
            index="03"
            title="Process"
            headline="Scope came from research; options came from benchmarks."
          />
          <div className="col">
            <p className="method">
              Research → MoSCoW feature prioritization → sitemaps and key flows →
              benchmarking → iterations with the PM, returning to research for every new
              flow.
            </p>
          </div>
          <ol className="steps">
            {steps.map((step) => (
              <li key={step.n}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="moscow-board">
            <div className="moscow-grid">
              {moscow.map((q) => (
                <article key={q.title} className={q.wont ? "wont" : undefined}>
                  <h3>{q.title}</h3>
                  <ul>
                    {q.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
          <p className="takeaway moscow-note">
            <strong>Cut a Must.</strong> Canned replies started as a Must; the redesigned
            workflow removed the need, so we never built them.
          </p>
          <figure className="figure">
            <div className="frame">
              <img src={asset("/pulse/process.webp")} alt="Benchmark notes on Zendesk, beside the live agent workspace" />
            </div>
          </figure>
        </section>

        <section className="case-block tight">
          <SectionIntro
            index="04"
            title="Key decisions"
            headline="Every workaround pointed to something the product should provide."
          />
        </section>

        <section className="decision">
          <p className="decision-kicker">Decision 1 of 3</p>
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
                label: "Trade-off",
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
          <p className="decision-kicker">Decision 2 of 3</p>
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
          <p className="decision-kicker">Decision 3 of 3</p>
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
                <img src={asset("/pulse/vip.webp")} alt="A VIP badge on the customer, seen while choosing the chat" />
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
          <SectionIntro
            index="05"
            title="Craft"
            headline="Designed for the bad moments too: failures, loading, empty and RTL."
          />
          <div className="col">
            <p className="body-text">
              Failed send with Try again, return-details card, RTL-first Arabic bubbles,
              empty and skeleton states.
            </p>
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

        <section className="case-block">
          <SectionIntro
            index="06"
            title="Impact & reflection"
            headline="AHT dropped 20% in six months (per PM)."
          />
          <div className="impact">
            <article className="impact-lead">
              <h3>−20% AHT</h3>
              <p>
                Average handling time dropped 20% in the first 6 months after onboarding,
                with no other workflow changes. Measured by the PM.
              </p>
            </article>
            <article>
              <h3>AI as the default path</h3>
              <p>An AI summary opens every chat; drafts stay editable.</p>
            </article>
            <article>
              <h3>A more efficient journey</h3>
              <p>Context in one panel instead of tabs; one-action alerts for TLs.</p>
            </article>
            <article>
              <h3>Designed for lower cognitive load</h3>
              <p>For agents and team leads alike.</p>
            </article>
            <p className="takeaway">
              <strong>Takeaway.</strong> AHT fell 20% in six months (per PM), but that’s
              one number for the whole redesign. Next I’d instrument tab-switching and
              AI-draft edit rate to learn which decisions drove it.
            </p>
          </div>
        </section>
      </main>
      <Footer giant />
    </div>
  );
}
