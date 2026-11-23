import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { asset } from "../asset";
import { BrowserFrame, Dots, Footer, Nav } from "../components/Chrome";

const problems = [
  "Data without hierarchy. The MVP’s side panel listed 20+ equal fields, and “Is VIP: No” looked like the rest.",
  "Detours. Agents left for Zoho, an internal order-tracking tool and personal notes: slower replies, repeated questions, SLA risk.",
  "Passive dashboard. TLs saw numbers on a manually refreshed screen, with no way to act.",
  "AI bypassed. The business’s core bet wasn’t being used.",
];

const insights = [
  "Workarounds were symptoms. Notes held ticket context and saved replies the UI should have provided.",
  "It was effort. Agents skipped AI because a saved reply was faster than fixing a long, robotic one.",
  "TLs manage people. On a breach they contact the agent.",
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

const personas = [
  {
    role: "L1 agent",
    where: "In the chat",
    asks: "Has this customer complained before, and what happened?",
    constraint: "Handles up to 3 chats at once, in Arabic and English.",
  },
  {
    role: "Team lead",
    where: "On the dashboard",
    asks: "Which chat is breaching, and who do I contact?",
    constraint: "Watches several queues and manages people, not chats.",
  },
];

const modules = [
  {
    title: "Conversation details panel",
    body: "Order, complaint history, VIP status and live timers beside the chat, ordered by what agents need first.",
    src: "/pulse/panel.webp",
    alt: "Conversation details in focus: customer, VIP, order, and live timers",
  },
  {
    title: "AI summary and replies",
    body: "An AI summary opens each chat and drafts stay editable, with a Generating skeleton so the screen never waits.",
    src: "/pulse/ai.webp",
    alt: "AI replies turned on, with an editable draft and a generating state",
  },
  {
    title: "VIP signals",
    body: "A gold crown and VVIP badge on the customer, seen at the moment an agent picks the next chat.",
    src: "/pulse/vip.webp",
    alt: "A VIP badge on the customer, seen while choosing the chat",
  },
  {
    title: "Team lead dashboard",
    body: "A breach banner with inline View and Assign, an agent drawer with Message Agent, a status donut and a department filter.",
    src: "/pulse/dashboard.webp",
    alt: "Team lead dashboard with a breach signal and Message Agent",
  },
];

const decisions = [
  {
    constraint: "Notes existed because context and saved replies lived somewhere else.",
    decision:
      "Build what the workarounds were doing: a side panel with live timers and interaction history, and AI replies in the composer.",
    tradeoff: "We left out in-chat notes, which pushed agents toward AI replies instead of their own scripts.",
  },
  {
    constraint: "Agents skipped AI because fixing a draft cost more than pasting a saved reply.",
    decision: "Make AI the default: a summary opens every chat and drafts stay editable, so agents review before sending.",
    tradeoff: "A per-chat Turn off AI with a confirm step instead of a global toggle. AI stays consistent and agents keep control.",
  },
  {
    constraint: "A stakeholder asked for a buzzing alert on VIP chats.",
    decision:
      "A gold crown and VVIP badge instead. A buzz interrupts mid-reply; the crown costs no attention, and aging VIP chats still pick up SLA badges.",
    tradeoff: "Team leads lost some numbers too: CSAT, closed chats and the concurrency column were cut. If nobody acts on a metric, it goes.",
  },
];

function Lead({ text }: { text: string }) {
  const i = text.indexOf(". ");
  if (i === -1) return <>{text}</>;
  return (
    <>
      <strong>{text.slice(0, i + 1)}</strong> {text.slice(i + 2)}
    </>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="ds-section">
      <h2 className="ds-section__label">{label}</h2>
      <div className="ds-section__body">{children}</div>
    </section>
  );
}

function Shot({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="ds-figure">
      <img src={asset(src)} alt={alt} loading="lazy" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export function CaseStudy() {
  useEffect(() => {
    document.title = "Pulse · Rana Ebrahim";
  }, []);

  return (
    <div className="page case ds-case">
      <Dots />
      <Nav />
      <main>
        <header className="ds-hero">
          <Link className="ds-back" to="/projects">
            <span aria-hidden="true">←</span> Work
          </Link>
          <h1 className="ds-hero__title">
            Removing
            <br />
            the detours
          </h1>
          <p className="ds-hero__lede">
            Agents built workarounds: extra tabs, personal notes, paraphrase tools. Team leads
            could see problems but couldn’t act on them. I redesigned Pulse so the detours
            aren’t needed.
          </p>
          <dl className="ds-meta">
            <div>
              <dt>Client</dt>
              <dd>noon</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>Solo product designer</dd>
            </div>
            <div>
              <dt>With</dt>
              <dd>A PM and engineering</dd>
            </div>
            <div>
              <dt>Timeline</dt>
              <dd>12 months</dd>
            </div>
            <div>
              <dt>Platform</dt>
              <dd>Web · Arabic RTL + English</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Shipped, in daily use</dd>
            </div>
          </dl>
        </header>

        <figure className="ds-figure ds-figure--hero">
          <BrowserFrame
            label="Pulse / Workspace"
            src="/pulse/workspace.webp"
            alt="Pulse workspace with an AI summary, the chat, and conversation details"
          />
          <figcaption>The redesigned workspace: summary, chat and customer details on one screen.</figcaption>
        </figure>

        <div className="ds-stats">
          <div>
            <p>20%</p>
            <span>lower average handling time in the first 6 months (per PM)</span>
          </div>
          <div>
            <p>200+</p>
            <span>agents across noon marketplaces use it daily</span>
          </div>
          <div>
            <p>2</p>
            <span>languages, Arabic right to left and English</span>
          </div>
          <div>
            <p>12</p>
            <span>months, 8 to design and ship and 4 iterating</span>
          </div>
        </div>

        <Section label="Context">
          <p>
            Pulse is noon’s internal support platform: agent chat, a live dashboard for team
            leads and a QA Center. I was the only product designer, working with a PM.
          </p>
          {problems.map((item) => (
            <p key={item}>
              <Lead text={item} />
            </p>
          ))}
          <div className="ds-pair">
            <Shot src="/pulse/mvp-inbox.webp" alt="The earlier inbox, with a flat side panel of equal fields" />
            <Shot src="/pulse/mvp-dashboard.webp" alt="The earlier realtime dashboard, refreshed by hand" />
          </div>
          <p className="ds-caption">Before: the MVP inbox and the hand-refreshed dashboard.</p>
        </Section>

        <Section label="Who uses it">
          <div className="ds-personas">
            {personas.map((p) => (
              <article className="ds-persona" key={p.role}>
                <p className="ds-persona__role">{p.role}</p>
                <p className="ds-persona__where">{p.where}</p>
                <p className="ds-persona__k ds-persona__k--asks">Asks</p>
                <p className="ds-persona__q">{p.asks}</p>
                <p className="ds-persona__k">Constraint</p>
                <p className="ds-persona__v">{p.constraint}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section label="Research">
          <p>
            Multiple interview rounds with agents and team leads, including group interviews,
            two focus groups in Arabic and English, a team lead workflow session, all
            synthesized in Dovetail.
          </p>
          <div className="ds-findings">
            <div>
              <p>4 of 6</p>
              <span>agents had no order or complaint history in the chat</span>
            </div>
            <div>
              <p>4 of 6</p>
              <span>kept canned replies in their own notebooks</span>
            </div>
          </div>
          <p className="ds-caption">From one round of 6 agent interviews.</p>
          {insights.map((item) => (
            <p key={item}>
              <Lead text={item} />
            </p>
          ))}
          <blockquote className="ds-quote">
            <p>
              “When a chat starts, I need to immediately see if the customer has previous
              complaints and their status.”
            </p>
            <footer>L1 agent, research interview</footer>
          </blockquote>
        </Section>

        <blockquote className="ds-statement">
          Agents shouldn’t have
          <br />
          to leave the chat.
        </blockquote>

        <Section label="Process">
          <ol className="ds-steps">
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
          <p className="ds-trade">
            <b>Cut a Must</b>
            Canned replies started as a Must. Once the chat screen showed what agents needed,
            they had no reason to keep saved replies elsewhere, and we wanted them learning the
            AI replies instead of falling back on old habits. So we never built them.
          </p>
          <Shot
            src="/pulse/process.webp"
            alt="Benchmark notes on Zendesk, beside the live agent workspace"
            caption="Benchmarks gave options. Research decided which fit our agents."
          />
        </Section>

        <Section label="What I designed">
          <ol className="ds-modules">
            {modules.map((m) => (
              <li key={m.title}>
                <div>
                  <h3>{m.title}</h3>
                  <p>{m.body}</p>
                  <Shot src={m.src} alt={m.alt} />
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section label="Constraints and decisions">
          <dl className="ds-decisions">
            {decisions.map((d) => (
              <div key={d.constraint}>
                <dt>{d.constraint}</dt>
                <dd>
                  {d.decision}
                  <span className="ds-trade">
                    <b>Trade-off</b>
                    {d.tradeoff}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section label="Craft">
          <p>
            Failed send with Try again, a return-details card, right-to-left Arabic bubbles,
            empty and skeleton states. The screens agents see on a bad day got the same care.
          </p>
          <figure className="ds-figure">
            <BrowserFrame
              label="Loading state"
              src="/pulse/loading.webp"
              alt="Skeleton loading state of the Pulse workspace"
            />
          </figure>
          <Shot
            src="/pulse/craft.webp"
            alt="States for the summary, composer, alerts, chat list, and message bubbles"
          />
        </Section>

        <Section label="Outcome">
          <p>
            <strong>
              Average handling time dropped 20% in the first 6 months after agents onboarded,
              with no other workflow changes (per PM).
            </strong>
          </p>
          <p>
            AI is now the default path for agents, and every alert on the team lead dashboard
            ends in one action.
          </p>
          <p className="ds-trade">
            <b>Next time</b>
            That 20% is one number for the whole redesign. I would track tab switching and how
            often agents edit AI drafts, to see which decisions did the work.
          </p>
        </Section>

      </main>
      <Footer next={{ name: "Echo", to: "/work/echo" }} />
    </div>
  );
}
