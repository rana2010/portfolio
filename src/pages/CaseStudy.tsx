import { useEffect, type ReactNode } from "react";
import { Compare, Piece, PulsePrototype, Stage } from "../components/PulseVisuals";
import { Link } from "react-router-dom";
import { Dots, Footer, Nav } from "../components/Chrome";

const problems = [
  "Data without hierarchy. The MVP’s side panel listed 20+ equal fields, and “Is VIP: No” looked like the rest.",
  "Detours. Agents left for Zoho, an internal order-tracking tool and personal notes: slower replies, repeated questions, SLA risk.",
  "Passive dashboard. TLs saw numbers on a manually refreshed screen, with no way to act.",
  "AI bypassed. AI replies were the business’s main bet, and agents weren’t using them.",
];

const steps = [
  {
    n: "01",
    title: "Research → MoSCoW",
    body: "Every research finding became a card, sorted into Must, Should, Could and Won’t. The board is below.",
  },
  {
    n: "02",
    title: "Benchmarking",
    body: "Zendesk, Tidio, Intercom, Front and more gave options. Research decided which fit our agents.",
  },
  {
    n: "03",
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
    src: "/pulse/m-panel.webp",
    alt: "Conversation details in focus: customer, VIP, order, and live timers",
  },
  {
    title: "AI summary and replies",
    body: "A summary at the top of every chat, AI replies drafted in the composer, and a Generating state while it writes.",
    src: "/pulse/m-ai.webp",
    alt: "The chat menu with AI Replies turned on, under an AI summary",
  },
  {
    title: "VIP signals",
    body: "A gold crown and VVIP badge that follow the customer: in the chat list, in the chat and in the details panel.",
    src: "/pulse/m-vip.webp",
    alt: "A VIP badge on the customer, seen while choosing the chat",
  },
  {
    title: "Team lead dashboard",
    body: "Team leads asked one question: which chat is breaching, and who do I contact? v1 (shipped) answers the first half with a live breach banner, queue counts and each agent’s load. v2 (proposed, from the team lead workflow session) answers the second: every alert carries View or Assign, and an agent drawer ends in Message Agent. v2 stayed a proposal because of engineering constraints.",
    src: "/pulse/m-dash.webp",
    alt: "Team lead dashboard with a breach signal and Message Agent",
    before: { src: "/pulse/mvp-dashboard.webp", alt: "The earlier realtime dashboard, refreshed by hand" },
  },
];

const decisions = [
  {
    constraint: "Context and saved replies lived outside the chat.",
    decision: "Bring them in: a side panel with live timers and history, and AI replies in the composer.",
    tradeoff: "No in-chat notes, so agents lean on AI replies, not their own scripts.",
  },
  {
    constraint: "Fixing an AI draft took longer than pasting a saved reply.",
    decision: "AI by default: a summary opens every chat, and drafts stay editable before sending.",
    tradeoff: "Turn off AI per chat, with a confirm step, instead of a global toggle.",
  },
  {
    constraint: "A stakeholder asked for a buzzing alert on VIP chats.",
    decision:
      "A crown and VVIP badge instead. Agents juggle up to 3 chats mid-sentence; a buzz breaks the reply they are writing and adds stress. The crown is there when they pick the next chat, the moment it matters.",
    tradeoff: "A quieter signal. Aging VIP chats still escalate with SLA badges.",
  },
  {
    constraint: "Team leads saw numbers they couldn’t act on.",
    decision: "Put the action next to the signal: live breaches in v1; View, Assign and Message Agent proposed in v2.",
    tradeoff: "CSAT, closed chats and concurrency were cut from v1: none helped act on this screen.",
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

function moduleVisual(title: string) {
  if (title === "Conversation details panel") {
    return (
      <Stage>
        <Piece src="/pulse/c/after-panel.webp" alt="Conversation details panel" w={300} />
      </Stage>
    );
  }
  if (title === "AI summary and replies") {
    return (
      <Stage className="pv-stage--ai">
        <div className="pv-col">
          <Piece src="/pulse/c/sum-collapsed.webp" alt="AI summary card" w={420} />
          <Piece src="/pulse/c/ai-suggestion.webp" alt="AI suggestion" w={420} />
          <Piece src="/pulse/c/comp-editing.webp" alt="Composer while editing an AI reply" w={420} />
        </div>
        <Piece className="pv-float pv-surface" src="/pulse/c/menu.webp" alt="Chat menu with AI Replies turned on" w={150} />
      </Stage>
    );
  }
  if (title === "VIP signals") {
    return (
      <Stage className="pv-stage--vip">
        <Piece src="/pulse/c/panel-vip.webp" alt="Details panel for a VVIP customer" w={260} />
        <div className="pv-col">
          <Piece className="pv-badge pv-surface" src="/pulse/c/vvip.webp" alt="VVIP badge" w={116} />
          <Piece className="pv-surface" src="/pulse/c/bubble-vip.webp" alt="A message from a VVIP customer" w={400} />
        </div>
      </Stage>
    );
  }
  if (title === "Team lead dashboard") {
    return (
      <>
        <Compare
          items={[
            { label: "Before", src: "/pulse/c/dash-before.webp", alt: "The MVP dashboard, refreshed by hand. Agent emails and chat codes hidden." },
            { label: "v1 · shipped", src: "/pulse/c/dash-v1.webp", alt: "Dashboard v1: breach banner, live counts, chats and agents" },
            { label: "v2 · proposed", src: "/pulse/c/dash-v2.webp", alt: "Dashboard v2: agents overview, notifications center and thresholds" },
          ]}
          caption="Before: refreshed by hand. v1 (shipped): live counts and a breach banner. v2 (proposed): an agents overview, a notifications center with View and Assign, and thresholds, shaped by the team lead workflow session."
        />
      </>
    );
  }
  return null;
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

        <div className="ds-hero-compare">
          <Compare
            items={[
              { label: "Before", src: "/pulse/c/home-before.webp", alt: "The MVP agent inbox, light and flat. Personal data hidden." },
              { label: "After", src: "/pulse/workspace.webp", alt: "Pulse workspace with an AI summary, the chat, and conversation details" },
            ]}
            caption="The agent workspace, before and after: summary, chat and customer details on one screen. Personal data hidden."
          />
        </div>

        <div className="ds-stats">
          <p className="ds-stats__label">Results</p>
          <div>
            <p>20%</p>
            <span>lower average handling time in the first 6 months (per PM)</span>
          </div>
          <div>
            <p>200+</p>
            <span>agents across noon marketplaces use it daily</span>
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
          <Compare
            tall
            items={[
              { label: "Before", src: "/pulse/c/before-panel.webp", alt: "The MVP side panel: every field at the same weight. Personal data hidden." },
              { label: "After", src: "/pulse/c/after-panel.webp", alt: "The redesigned panel: customer, context and conversation groups, with status as badges" },
            ]}
            caption="The side panel. Before: 20+ fields at the same weight. After: grouped by what agents check first, with status as badges. Personal data hidden."
          />
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
          <ul className="ds-finds">
            <li>
              <b>4 of 6 agents</b>
              <span>had no order or complaint history in the chat, so they left it to look.</span>
            </li>
            <li>
              <b>Hidden in plain sight</b>
              <span>Agents opened other tools for details already on the chat screen. It was there, just not findable.</span>
            </li>
            <li>
              <b>4 of 6 agents</b>
              <span>kept canned replies in their own notebooks. The workarounds held what the UI should have.</span>
            </li>
            <li>
              <b>AI felt like effort</b>
              <span>Fixing a long, robotic draft took longer than pasting a saved reply, so agents skipped it.</span>
            </li>
            <li>
              <b>Team leads manage people</b>
              <span>On a breach, they contact the agent, not the chat.</span>
            </li>
          </ul>
          <p className="ds-caption">“4 of 6” comes from one round of 6 agent interviews.</p>
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
        </Section>

        <Section label="What I designed">
          <ol className="ds-modules">
            {modules.map((m) => (
              <li key={m.title}>
                <div>
                  <h3>{m.title}</h3>
                  <p>{m.body}</p>
                  {moduleVisual(m.title)}
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section label="Try it">
          <PulsePrototype />
        </Section>

        <Section label="Constraints and decisions">
          <div className="ds-dgrid">
            {decisions.map((d, i) => (
              <article key={d.constraint}>
                <span className="ds-dgrid__n">0{i + 1}</span>
                <h3>{d.constraint}</h3>
                <p>{d.decision}</p>
                <p className="ds-dgrid__trade">
                  <b>Trade-off</b> {d.tradeoff}
                </p>
              </article>
            ))}
          </div>
        </Section>

        <Section label="Craft">
          <p>
            Bad days got the same care: failed sends, Arabic right to left, loading states, and a
            palette tested for long shifts that passes WCAG AA contrast.
          </p>
          <div className="pv-craft">
            <Stage className="pv-stage--col" caption="Bubbles: Arabic right to left, an AI reply, a failed send">
              <Piece className="pv-surface" src="/pulse/c/bubble-ar.webp" alt="Arabic message, right to left" w={330} />
              <Piece className="pv-surface" src="/pulse/c/bubble-ai.webp" alt="AI-drafted reply" w={330} />
              <Piece className="pv-surface" src="/pulse/c/bubble-failed.webp" alt="Failed send with Try again" w={330} />
            </Stage>
            <Stage className="pv-stage--col" caption="AI summary: loading, short, expanded">
              <Piece src="/pulse/c/sum-loading.webp" alt="AI summary loading" w={330} />
              <Piece src="/pulse/c/sum-collapsed.webp" alt="AI summary, short" w={330} />
              <Piece src="/pulse/c/sum-expanded.webp" alt="AI summary, expanded" w={330} />
            </Stage>
            <Stage className="pv-stage--col" caption="Composer: empty, generating, editing a draft">
              <Piece src="/pulse/c/comp-empty.webp" alt="Composer, empty" w={330} />
              <Piece src="/pulse/c/comp-generating.webp" alt="Composer, generating a reply" w={330} />
              <Piece src="/pulse/c/comp-editing.webp" alt="Composer, editing an AI draft" w={330} />
            </Stage>
          </div>
        </Section>

        <Section label="Outcome">
          <ul className="ds-outcome">
            <li><b>20%</b><span>lower average handling time in the first 6 months, with no other workflow changes (per PM)</span></li>
            <li><b>AI first</b><span>AI is the default path for agents</span></li>
            <li><b>Live</b><span>team leads see breaches as they happen, not on refresh</span></li>
          </ul>
          <p className="ds-trade">
            <b>Next time</b>
            Track tab switching and AI-draft edits, to see which decision did the work.
          </p>
        </Section>

      </main>
      <Footer next={{ name: "Echo", to: "/work/echo" }} />
    </div>
  );
}
