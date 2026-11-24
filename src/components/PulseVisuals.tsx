import { useEffect, useRef, useState, type ReactNode } from "react";
import { asset } from "../asset";

const reduce = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Before / after (or v1 / v2) toggle ---------- */
type CompareItem = { label: string; src: string; alt: string };

export function Compare({
  items,
  caption,
  tall = false,
}: {
  items: CompareItem[];
  caption?: string;
  tall?: boolean;
}) {
  const [active, setActive] = useState(items.length - 1);
  return (
    <figure className={tall ? "pv-compare pv-compare--tall" : "pv-compare"}>
      <div className="pv-tabs" role="tablist" aria-label="Compare versions">
        {items.map((item, i) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={active === i ? "is-on" : undefined}
            onClick={() => setActive(i)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="pv-compare__stage">
        {items.map((item, i) => (
          <img
            key={item.src}
            src={asset(item.src)}
            alt={item.alt}
            loading="lazy"
            className={active === i ? "is-on" : undefined}
            aria-hidden={active !== i}
          />
        ))}
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

/* ---------- Floating components on a dark stage ---------- */
export function Stage({ children, caption, className }: { children: ReactNode; caption?: string; className?: string }) {
  return (
    <figure className={className ? `pv-stage ${className}` : "pv-stage"}>
      <div className="pv-stage__inner">{children}</div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export function Piece({ src, alt, w, className }: { src: string; alt: string; w: number; className?: string }) {
  return (
    <img
      className={className ? `pv-piece ${className}` : "pv-piece"}
      src={asset(src)}
      alt={alt}
      loading="lazy"
      style={{ width: `${w}px` }}
    />
  );
}

/* ---------- Animated loading skeleton of the team lead dashboard ---------- */
export function DashboardSkeleton() {
  return (
    <div className="pv-skel" aria-label="Dashboard loading" role="img">
      <div className="pv-skel__rail">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="pv-skel__main">
        <div className="pv-skel__head">
          <div>
            <b style={{ width: "22%" }} />
            <b style={{ width: "38%", height: 8 }} />
          </div>
          <div className="pv-skel__btns">
            <b />
            <b />
            <b />
          </div>
        </div>
        <div className="pv-skel__cards">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <b style={{ width: "45%" }} />
              <b style={{ width: "22%", height: 22 }} />
            </div>
          ))}
        </div>
        <div className="pv-skel__tables">
          {[0, 1].map((t) => (
            <div key={t}>
              <b style={{ width: "30%" }} />
              {[0, 1, 2, 3, 4, 5].map((r) => (
                <b key={r} className="pv-skel__row" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Clickable prototype: agent inbox -> loading -> team lead dashboard ---------- */
type View = "agent" | "loading" | "tl";

const ICONS: Record<string, ReactNode> = {
  inbox: (
    <>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </>
  ),
  chart: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m7 15 3-3 3 2 4-5" />
    </>
  ),
  team: (
    <>
      <rect x="9" y="2" width="6" height="5" rx="1" />
      <rect x="2" y="17" width="6" height="5" rx="1" />
      <rect x="16" y="17" width="6" height="5" rx="1" />
      <path d="M12 7v5M5 17v-3h14v3" />
    </>
  ),
  qa: (
    <>
      <path d="M12 2.5 14.6 4l3 .2.9 2.9 2 2.3-1 2.8 1 2.8-2 2.3-.9 2.9-3 .2L12 21.5 9.4 20l-3-.2-.9-2.9-2-2.3 1-2.8-1-2.8 2-2.3.9-2.9 3-.2z" />
      <path d="m8.5 12 2.5 2.5 4.5-4.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

export function PulsePrototype() {
  const [view, setView] = useState<View>("agent");
  const [drawer, setDrawer] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  function go(next: "agent" | "tl") {
    setDrawer(false);
    if (timer.current) window.clearTimeout(timer.current);
    if (next === "tl" && view === "agent") {
      setView("loading");
      timer.current = window.setTimeout(() => setView("tl"), reduce() ? 300 : 1400);
    } else {
      setView(next);
    }
  }

  const onDash = view !== "agent";

  return (
    <figure className="pv-proto">
      <ol className="pv-steps" aria-live="polite">
        <li className={view === "agent" ? "is-on" : "is-done"}>
          <span>1</span>Open the dashboard from the sidebar
        </li>
        <li className={view === "tl" && !drawer ? "is-on" : drawer ? "is-done" : undefined}>
          <span>2</span>Click an agent in the Agents table
        </li>
        <li className={drawer ? "is-on" : undefined}>
          <span>3</span>See their load and message them
        </li>
      </ol>
      <div className="pv-device">
        <div className="pv-device__lid">
          <span className="pv-device__cam" aria-hidden="true" />
          <div className="pv-proto__screen">
            <img className={view === "agent" ? "is-on" : undefined} src={asset("/pulse/c/home.webp")} alt="Agent inbox" />
            <img className={view === "tl" ? "is-on" : undefined} src={asset("/pulse/c/dash-v2.webp")} alt="Team lead realtime dashboard, proposed v2" />
            <div className={view === "loading" ? "pv-proto__loading is-on" : "pv-proto__loading"} aria-hidden={view !== "loading"}>
              <DashboardSkeleton />
            </div>

            <nav className="pv-rail" aria-label="Pulse navigation">
              <img className="pv-rail__logo" src={asset("/pulse/c/rail-logo.webp")} alt="" />
              <button type="button" className={!onDash ? "pv-rail__btn is-on" : "pv-rail__btn"} onClick={() => go("agent")} aria-label="Inbox" aria-current={!onDash}>
                <Icon name="inbox" />
              </button>
              <button type="button" className={onDash ? "pv-rail__btn is-on" : "pv-rail__btn"} onClick={() => go("tl")} aria-label="Realtime dashboard" aria-current={onDash}>
                <Icon name="chart" />
                {view === "agent" ? <span className="pv-pulse" aria-hidden="true" /> : null}
              </button>
              <span className="pv-rail__btn is-idle" aria-hidden="true">
                <Icon name="team" />
              </span>
              <span className="pv-rail__btn is-idle" aria-hidden="true">
                <Icon name="qa" />
              </span>
              <span className="pv-rail__gap" />
              <span className="pv-rail__btn is-idle" aria-hidden="true">
                <Icon name="search" />
              </span>
              <span className="pv-rail__btn is-idle" aria-hidden="true">
                <Icon name="settings" />
              </span>
              <img className="pv-rail__avatar" src={asset("/pulse/c/rail-avatar.webp")} alt="" />
            </nav>

            {view === "tl" ? (
              <button type="button" className="pv-hot pv-hot--agents" onClick={() => setDrawer(true)} aria-label="Open an agent’s actions">
                {!drawer ? <span className="pv-pulse pv-pulse--box" aria-hidden="true" /> : null}
              </button>
            ) : null}

            <div className={drawer ? "pv-proto__drawer is-on" : "pv-proto__drawer"} aria-hidden={!drawer}>
              <img src={asset("/pulse/c/slider.webp")} alt="Agent actions: capacity, active chats, alerts and Message Agent" />
              <button type="button" className="pv-hot pv-hot--close" onClick={() => setDrawer(false)} aria-label="Close" tabIndex={drawer ? 0 : -1} />
            </div>
          </div>
        </div>
        <div className="pv-device__base" aria-hidden="true" />
      </div>
      <figcaption>Prototype of the proposed v2, built in code from the Figma screens.</figcaption>
    </figure>
  );
}
