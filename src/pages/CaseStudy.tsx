import { useEffect, type ReactNode } from "react";
import { Compare, DetourMap, Piece, PulsePrototype, Stage, VipQueue } from "../components/PulseVisuals";
import { Dots, Footer, Nav } from "../components/Chrome";

const problems = [
  { title: "Data without hierarchy", body: "The side panel listed 20+ fields at the same weight. “Is VIP: No” looked like everything else." },
  { title: "Detours", body: "Agents left for Zoho, an internal order-tracking tool and personal notes: slower replies, repeated questions, SLA risk." },
  { title: "A passive dashboard", body: "Team leads saw numbers on a screen they refreshed by hand, with no way to act on them." },
  { title: "AI bypassed", body: "AI replies were the business’s main bet, and agents weren’t using them." },
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
    pain: "Can’t see a customer’s complaint history without leaving the chat, while handling up to 3 chats in Arabic and English.",
  },
  {
    role: "Team lead",
    where: "On the dashboard",
    asks: "Where are breaches coming from, and who has room to take more?",
    pain: "Can’t see SLA risk or rebalance workload across active agents in real time.",
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

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="ds-section">
      <h2 className="ds-section__label">{label}</h2>
      <div className="ds-section__body">{children}</div>
    </section>
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
          <p className="ds-hero__eyebrow">Case study · noon</p>
          <h1 className="ds-hero__title">
            Removing
            <br />
            the detours
          </h1>
          <p className="ds-hero__lede">
            <strong>Agents built workarounds: extra tabs, personal notes, paraphrase tools.</strong>{" "}
            Team leads could see problems but couldn’t act on them. I redesigned Pulse so the
            detours aren’t needed.
          </p>
          <dl className="ds-meta">
            <div>
              <dt>Company</dt>
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
              <dd>Shipped</dd>
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
            <span>lower average handling time in the first 6 months</span>
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
          <ul className="ds-problems">
            {problems.map((p) => (
              <li key={p.title}>
                <b>{p.title}</b>
                <span>{p.body}</span>
              </li>
            ))}
          </ul>
          <DetourMap />
        </Section>

        <Section label="Who uses it">
          <div className="ds-personas">
            {personas.map((p) => (
              <article className="ds-persona" key={p.role}>
                <p className="ds-persona__role">{p.role}</p>
                <p className="ds-persona__where">{p.where}</p>
                <p className="ds-persona__k ds-persona__k--asks">Asks</p>
                <p className="ds-persona__q">{p.asks}</p>
                <p className="ds-persona__k">Pain point</p>
                <p className="ds-persona__v">{p.pain}</p>
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
              <b>6 of 6 agents</b>
              <span>kept canned replies in their own notebooks. The workarounds held what the UI should have.</span>
            </li>
            <li>
              <b>AI felt like effort</b>
              <span>Fixing a long, robotic draft took longer than pasting a saved reply, so agents skipped it.</span>
            </li>
            <li>
              <b>Team leads manage workload, live</b>
              <span>They need to see where breaches come from as they happen, to rebalance work across active agents and keep SLAs.</span>
            </li>
          </ul>
          <p className="ds-caption">Counts come from one round of 6 agent interviews.</p>
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
          <div className="ds-branch">
            <header className="ds-branch__head">
              <span>01</span>
              <h3>The agent chat workspace</h3>
              <p>Everything an agent needs for the chat in front of them, without leaving it.</p>
            </header>

            <div className="ds-comp">
              <h4>Conversation details panel</h4>
              <p>Customer, context and conversation, grouped in the order agents check them, with status as badges instead of more text.</p>
              <Compare
                tall
                items={[
                  { label: "Before", src: "/pulse/c/before-panel.webp", alt: "The MVP side panel: every field at the same weight. Personal data hidden." },
                  { label: "After", src: "/pulse/c/after-panel.webp", alt: "The redesigned panel: customer, context and conversation groups, with status as badges" },
                ]}
                caption="Before: 20+ fields at the same weight. After: grouped, with live timers and badges. Personal data hidden."
              />
              <Stage caption="Interaction history: the customer’s past tickets and their status, answering “has this customer complained before?” without leaving the chat.">
                <Piece src="/pulse/c/history.webp" alt="Interaction history card: a past ticket, its summary and status" w={340} />
              </Stage>
            </div>

            <div className="ds-comp">
              <h4>AI summary</h4>
              <p>Opens every chat, so the agent knows the problem before reading the thread. Short by default, expandable, with a loading state.</p>
              <Stage className="pv-stage--col">
                <Piece src="/pulse/c/sum-loading.webp" alt="AI summary, loading" w={460} />
                <Piece src="/pulse/c/sum-collapsed.webp" alt="AI summary, short" w={460} />
                <Piece src="/pulse/c/sum-expanded.webp" alt="AI summary, expanded" w={460} />
              </Stage>
            </div>

            <div className="ds-comp">
              <h4>Composer and AI replies</h4>
              <p>AI drafts the reply in the composer and the agent edits before sending. AI Replies stays a per-chat toggle in the chat menu.</p>
              <Stage className="pv-stage--ai">
                <div className="pv-col">
                  <Piece src="/pulse/c/ai-suggestion.webp" alt="AI suggestion" w={420} />
                  <Piece src="/pulse/c/comp-generating.webp" alt="Composer while the AI reply is generating" w={420} />
                  <Piece src="/pulse/c/comp-editing.webp" alt="Composer while editing an AI reply" w={420} />
                  <Piece src="/pulse/c/comp-empty.webp" alt="Composer, empty" w={420} />
                </div>
                <Piece className="pv-float pv-surface" src="/pulse/c/menu.webp" alt="Chat menu with AI Replies turned on" w={150} />
              </Stage>
            </div>

            <div className="ds-comp">
              <h4>Messages</h4>
              <p>Arabic reads right to left, AI-drafted replies are marked, and a failed send says so with Try again.</p>
              <Stage className="pv-stage--col">
                <Piece className="pv-surface" src="/pulse/c/bubble-ar.webp" alt="Arabic message, right to left" w={460} />
                <Piece className="pv-surface" src="/pulse/c/bubble-ai.webp" alt="AI-drafted reply" w={460} />
                <Piece className="pv-surface" src="/pulse/c/bubble-failed.webp" alt="Failed send with Try again" w={460} />
              </Stage>
            </div>

            <div className="ds-comp">
              <h4>VIP signals</h4>
              <p>A gold crown and VVIP badge follow the customer, in the list and in the details panel. When a VIP chat drifts down the list and gets close to breaching its SLA, it moves back to the top.</p>
              <Stage className="pv-stage--vip">
                <VipQueue />
                <Piece src="/pulse/c/panel-vip.webp" alt="Details panel for a VVIP customer, with the crown and VVIP badge" w={260} />
              </Stage>
            </div>

            <p className="ds-branch__note">
              Agents read this screen for whole shifts, so I tested several text and background
              combinations before settling the palette. The final colours pass WCAG AA contrast.
            </p>
          </div>

          <div className="ds-branch">
            <header className="ds-branch__head">
              <span>02</span>
              <h3>The team lead realtime dashboard</h3>
              <p>Where breaches come from, and who has room to take more, as it happens.</p>
            </header>

            <div className="ds-comp">
              <h4>From refresh to real time</h4>
              <p>
                v1 (shipped) made the screen live: queue counts, a breach banner that names the
                breaching chats, and each agent’s load. v2 (proposed, from the team lead workflow
                session) puts the action next to the signal: View or Assign on every alert, an
                agents overview, and an agent drawer that ends in Message Agent. v2 stayed a
                proposal because of engineering constraints.
              </p>
              <Compare
                items={[
                  { label: "Before", src: "/pulse/c/dash-before.webp", alt: "The MVP dashboard, refreshed by hand. Agent emails and chat codes hidden." },
                  { label: "v1 · shipped", src: "/pulse/c/dash-v1.webp", alt: "Dashboard v1: breach banner, live counts, chats and agents" },
                  { label: "v2 · proposed", src: "/pulse/c/dash-v2.webp", alt: "Dashboard v2: agents overview, notifications center and thresholds" },
                ]}
              />
            </div>

            <div className="ds-comp">
              <h4>Try the proposed v2</h4>
              <PulsePrototype />
            </div>
          </div>
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


        <Section label="Outcome">
          <p className="ds-outcome__big">
            <b>20%</b> lower average handling time in the first 6 months, with no other workflow
            changes.
          </p>
          <p className="ds-outcome__line">
            AI is the default path for agents, and team leads see breaches as they happen.
          </p>
        </Section>

      </main>
      <Footer next={{ name: "Echo", to: "/work/echo" }} />
    </div>
  );
}
