import { useEffect, useState } from "react";

const SUGGESTIONS = [
  {
    label: "Summarize support",
    prompt: "Summarize seller support conversations and surface the top operational friction points.",
  },
  {
    label: "Find friction",
    prompt: "Find the contact drivers causing repeat tickets and recommend macros to reduce them.",
  },
  {
    label: "Weekly digest",
    prompt: "Build a weekly digest of unresolved fulfillment and returns escalations by owner.",
  },
  {
    label: "Onboarding review",
    prompt: "Analyze new seller onboarding tickets and explain where the journey breaks down.",
  },
];

const AGENTS = [
  {
    name: "Planning agent",
    role: "Scope & sampling",
    thoughts: [
      "Reading the objective and deciding what evidence belongs in the report.",
      "Turning the request into a checkpointed plan with assumptions you can approve.",
      "Shaping the output so it includes owners, timing, and clear next actions.",
    ],
    proposal: [
      "Target: seller support tickets, help-center chat, and escalation notes.",
      "Lens: payment, catalog, fulfillment, returns, ads, and onboarding.",
      "Compare high-volume sellers with first-45-day sellers.",
    ],
  },
  {
    name: "SQL agent",
    role: "Query strategy",
    thoughts: [
      "Drafting the query shape for ticket volume, resolution time, and escalations.",
      "Choosing metrics that feed both the charts and a written narrative.",
      "Flagging fields that need human review before extraction.",
    ],
    proposal: [
      "Aggregate by contact driver, queue, market, and seller tenure.",
      "Join escalation events to resolution timestamps.",
      "Return only the fields needed for analysis and traceability.",
    ],
  },
  {
    name: "Theme agent",
    role: "Pattern extraction",
    thoughts: [
      "Grouping repeated seller pain points into measurable themes.",
      "Separating sentiment from urgency so noise does not dominate.",
      "Comparing top themes against recent macro usage and repeat contacts.",
    ],
    proposal: [
      "Payment reconciliation is the highest-friction theme.",
      "Catalog rejections concentrate among newer sellers.",
      "Fulfillment issues create repeat contacts when ownership is unclear.",
    ],
  },
  {
    name: "Report agent",
    role: "Synthesis",
    thoughts: [
      "Converting metrics and themes into a written article.",
      "Ranking recommendations by operational impact and clarity.",
      "Preparing the analytics checkpoint before the report is written.",
    ],
    proposal: [
      "Executive summary, evidence, interpretation, and actions.",
      "Charts shown first so reviewers can validate the signal.",
      "Save the report to history for follow-up questions.",
    ],
  },
];

const METRICS = [
  { label: "Conversations", value: "18,420", trend: "+12% vs. prior period" },
  { label: "Avg. resolution", value: "9.4h", trend: "2.1h above target" },
  { label: "Escalation share", value: "14.8%", trend: "-3.2 pts after triage" },
  { label: "Seller sentiment", value: "71", trend: "Healthy, volatile" },
];

const DRIVERS = [
  { label: "Payments", value: 32 },
  { label: "Catalog", value: 27 },
  { label: "Fulfillment", value: 21 },
  { label: "Returns", value: 13 },
  { label: "Ads", value: 7 },
];

type Report = {
  id: string;
  tag: string;
  title: string;
  meta: string;
  sections: { heading: string; paragraphs: string[] }[];
  recommendations: string[];
};

const LIVE_REPORT: Report = {
  id: "rpt-live",
  tag: "New",
  title: "Seller support intelligence brief",
  meta: "Jun 12, 2026 · Confidence 94%",
  sections: [
    {
      heading: "Executive summary",
      paragraphs: [
        "Treat the current seller-support pattern as an operational clarity problem, not only a queue-volume problem. The highest-frequency conversations cluster around payment reconciliation, catalog rejection loops, and fulfillment ownership.",
        "These topics create repeat contacts because sellers can see the issue but not the next owner, next action, or expected timing.",
      ],
    },
    {
      heading: "What changed in the last four weeks",
      paragraphs: [
        "Payment-related conversations are the clearest signal — the largest share of contacts and the strongest repeat-contact behavior around invoice adjustments and payout timing.",
        "Fulfillment and returns create a different friction: sellers know something is delayed but not whether support, warehouse, or courier owns the next step.",
      ],
    },
    {
      heading: "Suggested narrative for leadership",
      paragraphs: [
        "Friction is driven by uncertainty after an issue is already known. The seller needs a precise answer that explains what happened, who owns the next step, and when the next update arrives.",
      ],
    },
  ],
  recommendations: [
    "Publish a payment-status card with payout ETA, adjustment reason, and finance owner.",
    "Add catalog rejection examples to the first response for new sellers.",
    "Create a weekly digest for unresolved fulfillment and returns escalations.",
    "Track repeat-contact reduction by theme as the main success metric.",
  ],
};

const HISTORY: Report[] = [
  {
    id: "rpt-042",
    tag: "Payments",
    title: "Payment dispute and payout clarity",
    meta: "Jun 10, 2026 · Confidence 92%",
    sections: [
      {
        heading: "Executive summary",
        paragraphs: [
          "Repeat contacts around payouts spike after invoice adjustments. Sellers can see a changed amount but cannot see why it changed or when the corrected payout lands.",
          "A single seller-visible status explanation removes most of the avoidable follow-up volume in this theme.",
        ],
      },
    ],
    recommendations: [
      "Add payout status explanations with reason and expected date.",
      "Create a macro for invoice adjustment disputes.",
      "Route high-risk sellers to finance support directly.",
    ],
  },
  {
    id: "rpt-039",
    tag: "Onboarding",
    title: "New seller onboarding friction",
    meta: "Jun 03, 2026 · Confidence 90%",
    sections: [
      {
        heading: "Executive summary",
        paragraphs: [
          "New sellers repeat catalog questions because rejection reasons are visible but the fix is not specific. The same SKU is resubmitted several times.",
          "First responses that include a concrete example fix sharply reduce resubmission loops.",
        ],
      },
    ],
    recommendations: [
      "Add catalog rejection examples to first responses.",
      "Prompt sellers about missing attributes before submission.",
      "Improve first-response article links for onboarding.",
    ],
  },
  {
    id: "rpt-034",
    tag: "Fulfillment",
    title: "Fulfillment escalation trend",
    meta: "May 27, 2026 · Confidence 88%",
    sections: [
      {
        heading: "Executive summary",
        paragraphs: [
          "Escalations rose when sellers could not tell whether support, warehouse, or courier owned the next step. The delay was visible; the owner was not.",
          "Exposing the owner and an ETA band in replies reduces escalation pressure.",
        ],
      },
    ],
    recommendations: [
      "Expose the owner field in replies.",
      "Add ETA bands to fulfillment updates.",
      "Review the warehouse handoff queue weekly.",
    ],
  },
];

const STEPS = [
  { label: "Discovery", caption: "Set objective" },
  { label: "Thinking", caption: "Agent pipeline" },
  { label: "Analytics", caption: "Validate signal" },
  { label: "Report", caption: "Final brief" },
];

function answer(question: string, title: string) {
  const q = question.toLowerCase();
  if (q.includes("payment") || q.includes("payout")) {
    return `For “${title}”, split payment questions into invoice adjustment, payout ETA, and reconciliation proof. The highest-impact follow-up is a seller-visible status explanation.`;
  }
  if (q.includes("catalog") || q.includes("sku")) {
    return `For “${title}”, catalog friction is most actionable when the answer includes the rejected attribute, an example fix, and the queue that owns re-review.`;
  }
  if (q.includes("owner") || q.includes("action")) {
    return `For “${title}”, assign one owner per recommendation and track repeat-contact rate, escalation share, and time-to-next-action.`;
  }
  return `For “${title}”, segment by seller tenure and contact driver, then compare repeat-contact reduction after the recommended macro launches.`;
}

export function AnalystPrototype() {
  const [step, setStep] = useState(1);
  const [agentIndex, setAgentIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [prompt, setPrompt] = useState(
    "Summarize seller support conversations, identify operational friction, and produce a leadership-ready report.",
  );
  const [objective, setObjective] = useState("");
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [question, setQuestion] = useState("");
  const [replies, setReplies] = useState<{ q: string; a: string }[]>([]);

  const agent = AGENTS[agentIndex];

  useEffect(() => {
    if (step !== 2) return undefined;
    setShown(0);
    const timers = agent.thoughts.map((_, index) => window.setTimeout(() => setShown(index + 1), 480 * (index + 1)));
    return () => timers.forEach(clearTimeout);
  }, [step, agentIndex, agent.thoughts]);

  function go(next: number) {
    setHistoryId(null);
    setStep(next);
    setCompleted((current) => Math.max(current, next === 4 ? 4 : next - 1));
  }

  function begin(text: string) {
    const value = text.trim();
    if (!value) return;
    setObjective(value);
    setAgentIndex(0);
    setReplies([]);
    setQuestion("");
    setSaved(false);
    setCompleted(1);
    setHistoryId(null);
    setStep(2);
  }

  function approve() {
    if (agentIndex < AGENTS.length - 1) {
      setAgentIndex((current) => current + 1);
      return;
    }
    go(3);
  }

  function writeBrief() {
    setSaved(true);
    go(4);
  }

  function openHistory(id: string) {
    setHistoryId(id);
    setReplies([]);
    setQuestion("");
    setStep(4);
  }

  function reset() {
    setHistoryId(null);
    setObjective("");
    setAgentIndex(0);
    setSaved(false);
    setReplies([]);
    setStep(1);
    setCompleted(0);
  }

  const past = HISTORY.find((item) => item.id === historyId);
  const report = past ?? LIVE_REPORT;
  const ready = shown >= agent.thoughts.length;

  function ask(event: React.FormEvent) {
    event.preventDefault();
    const text = question.trim();
    if (!text) return;
    setReplies((current) => [...current, { q: text, a: answer(text, report.title) }]);
    setQuestion("");
  }

  return (
    <div className="proto">
      <aside className="proto-side">
        <p className="proto-mark">
          <i />
          Tech Care
        </p>
        <button type="button" className={step === 1 && !historyId ? "is-on" : undefined} onClick={reset}>
          New chat
        </button>
        <p className="proto-kicker">History</p>
        {HISTORY.map((item) => (
          <button
            key={item.id}
            type="button"
            className={historyId === item.id ? "is-on" : undefined}
            onClick={() => openHistory(item.id)}
          >
            <span>{item.tag}</span>
            {item.title}
          </button>
        ))}
        {saved && (
          <button type="button" className={!historyId && step === 4 ? "is-on" : undefined} onClick={() => setHistoryId(null)}>
            <span>New</span>
            Seller support intelligence brief
          </button>
        )}
      </aside>

      <div className="proto-main">
        {step > 1 && !historyId && (
          <div className="proto-rail" aria-label="Flow">
            {STEPS.map((item, index) => {
              const n = index + 1;
              const open = n <= Math.max(completed + 1, step);
              const done = completed >= n && n !== step;
              return (
                <button key={item.label} type="button" className={n === step ? "is-on" : undefined} disabled={!open} onClick={() => open && setStep(n)}>
                  <b>{done ? "✓" : n}</b>
                  <span>
                    {item.label}
                    <em>{item.caption}</em>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && !historyId && (
          <div className="proto-ask">
            <h2>How can I help you today?</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                begin(prompt);
              }}
            >
              <input value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="Ask the analyst" />
              <button type="submit">Start</button>
            </form>
            <div className="proto-chips">
              {SUGGESTIONS.map((item) => (
                <button key={item.label} type="button" onClick={() => setPrompt(item.prompt)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && !historyId && (
          <div className="proto-flow">
            <p className="proto-objective">
              Agent {agentIndex + 1} of {AGENTS.length} · {agent.role}
            </p>
            <h3>{agent.name}</h3>
            <p className="proto-objective">{objective}</p>
            <ol>
              {agent.thoughts.slice(0, shown).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
            {ready && (
              <>
                <ul className="proto-recs">
                  {agent.proposal.map((line) => (
                    <li key={line} contentEditable suppressContentEditableWarning>
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="proto-objective">
                  {agentIndex < AGENTS.length - 1
                    ? "Approve to continue to the next agent."
                    : "Approve to open the analytics checkpoint."}
                </p>
                <div className="proto-actions">
                  <button type="button" onClick={approve}>
                    {agentIndex < AGENTS.length - 1 ? "Approve & continue" : "Approve & view analytics"}
                  </button>
                  <button type="button" className="ghost" onClick={reset}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && !historyId && (
          <div className="proto-flow">
            <p className="proto-objective">Analytics checkpoint</p>
            <div className="proto-metrics">
              {METRICS.map((metric) => (
                <p key={metric.label}>
                  <strong>{metric.value}</strong>
                  {metric.label}
                  <em>{metric.trend}</em>
                </p>
              ))}
            </div>
            <ul className="proto-bars">
              {DRIVERS.map((driver) => (
                <li key={driver.label}>
                  <span>{driver.label}</span>
                  <i>
                    <b style={{ width: `${driver.value * 3}%` }} />
                  </i>
                  <em>{driver.value}%</em>
                </li>
              ))}
            </ul>
            <p className="proto-objective">Review the checkpoint, then generate the report.</p>
            <div className="proto-actions">
              <button type="button" className="ghost" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="button" onClick={writeBrief}>
                Generate report
              </button>
            </div>
          </div>
        )}

        {(step === 4 || historyId) && (
          <div className="proto-flow">
            <p className="proto-objective">{report.meta}</p>
            <h3>{report.title}</h3>
            {report.sections.map((section) => (
              <div key={section.heading}>
                <h3>{section.heading}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ))}
            <p className="proto-objective">Recommendations</p>
            <ul className="proto-recs">
              {report.recommendations.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <form className="proto-follow" onSubmit={ask}>
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a follow-up about this report…"
                aria-label="Follow-up question"
              />
              <button type="submit">Ask</button>
            </form>
            {replies.map((reply) => (
              <div className="proto-reply" key={reply.q}>
                <p>{reply.q}</p>
                <p>{reply.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
