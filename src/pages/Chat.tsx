import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { asset } from "../asset";
import { DotField } from "../components/DotField";

const LINKEDIN = "https://www.linkedin.com/in/rana-ebrahim-875614175/";
const EMAIL = "mailto:ranaebrahim@aucegypt.edu";
const STORAGE = "chat-answers";
const canEdit = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

const OLD_GREETING =
  "Hey! I’m Rana—well, my v1 pocket version while I finish building out my full chat assistant for December. Ask me about my work, how I design, or why we should work together!";

const DEFAULTS: Record<string, string> = {
  greeting:
    "Hey! I’m Rana—well, an mvp version at least. while I finish building out my full chat assistant for December. Ask me about my work, my creative process, or why we should work together!",
  hire: "Aside from being genuinely fun to have around, I bring experience owning consumer and enterprise products end to end. I like to dig deep in user behavior and what can make their journey better while also achieving business needs. and YESS I use AI \" gracefully\"",
  projects:
    "Well I had an opportunity to work in multiple projects in noon. My biggest one that's used by users everyday now is Pulse. Pulse is a AI-supported CS chat tool, my main role was to design an interface for a better workflow for customer support agents, and through numerous rounds of research I was able to do that. I also owned other projects like echo, AI analyst checkout my projects tab for more information. ",
  design:
    "I start with understanding the problem. The first brief call with the pm is very valubele in my process. then I go on with benchmarking to understand where the market is at and then I dig deeper into user behavior through user research and based on that i start wire framing and creating designs. all done through collaboration and discussions with PMs.",
  chat: "Heeey would love to. skip this bot and message me on linkedin or contact me via email <3",
  relocate:
    "Yes! I’m currently based in Cairo and completely open to relocating, especially to Europe or joining remote product teams.",
  open: "I’m actively interviewing right now and open to full-time product design roles or select remote teams. Message me on LinkedIn or email and let’s talk!",
};

const FIELDS = [
  ["greeting", "Greeting"],
  ["hire", "Why hire me?"],
  ["projects", "Tell me about your projects"],
  ["design", "How do you design?"],
  ["chat", "Let’s chat"],
  ["relocate", "Relocation"],
  ["open", "Availability"],
] as const;

const CHIPS = [
  { id: "hire", label: "Why hire me?" },
  { id: "projects", label: "Tell me about your projects" },
  { id: "design", label: "How do you design?" },
  { id: "chat", label: "Let’s chat" },
] as const;

type Message = { id: number; from: "rana" | "you"; text: string; at: number };

function loadAnswers() {
  try {
    const raw = localStorage.getItem(STORAGE);
    const stored = raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Record<string, string>) } : { ...DEFAULTS };
    if (!stored.greeting || stored.greeting === OLD_GREETING) stored.greeting = DEFAULTS.greeting;
    return stored;
  } catch {
    return { ...DEFAULTS };
  }
}

function formatTime(at: number) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(at);
}

function withLinks(text: string) {
  const parts = text.split(/(linkedin|email)/gi);
  return parts.map((part, index) => {
    if (/^linkedin$/i.test(part)) {
      return (
        <a key={index} href={LINKEDIN} target="_blank" rel="noreferrer">
          {part}
        </a>
      );
    }
    if (/^email$/i.test(part)) {
      return (
        <a key={index} href={EMAIL}>
          {part}
        </a>
      );
    }
    return part;
  });
}

function answerFor(question: string, answers: Record<string, string>) {
  const q = question.toLowerCase();
  if (/relocat|visa|move|spain|madrid|europe|remote|location|cairo/.test(q)) return answers.relocate;
  if (/availab|start|notice|hire|open/.test(q)) return answers.open;
  return answers.chat;
}

export function Chat() {
  const [answers, setAnswers] = useState(loadAnswers);
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 1, from: "rana", at: Date.now(), text: loadAnswers().greeting },
  ]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [editing, setEditing] = useState(false);
  const logRef = useRef<HTMLOListElement>(null);
  const waitRef = useRef<number | null>(null);

  useEffect(() => {
    document.title = "Rana Ebrahim";
    return () => {
      if (waitRef.current) window.clearTimeout(waitRef.current);
    };
  }, []);

  useEffect(() => {
    setMessages((current) =>
      current.map((message) =>
        message.id === 1 && message.from === "rana" ? { ...message, text: answers.greeting } : message,
      ),
    );
  }, [answers.greeting]);

  useEffect(() => {
    const log = logRef.current;
    if (!log || editing) return;
    log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
  }, [messages, typing, editing]);

  function save(id: string, value: string) {
    setAnswers((current) => {
      const next = { ...current, [id]: value };
      localStorage.setItem(STORAGE, JSON.stringify(next));
      return next;
    });
  }

  function ask(text: string, preset?: string) {
    const question = text.trim();
    if (!question || typing || editing) return;
    const at = Date.now();
    const answer = preset ?? answerFor(question, answers);
    setMessages((current) => [...current, { id: at, from: "you", text: question, at }]);
    setDraft("");
    setTyping(true);
    waitRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, { id: at + 1, from: "rana", at: Date.now(), text: answer }]);
      setTyping(false);
    }, 350);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    ask(draft);
  }

  let stage: ReactNode = (
    <ol className="chat-log" ref={logRef} aria-busy={typing}>
      {messages.map((message) => (
        <li key={message.id} className={message.from === "you" ? "chat-msg is-you" : "chat-msg"}>
          {message.from === "rana" ? <img src={asset("/images/rana.webp")} alt="" /> : null}
          <div className="chat-body">
            <p>{message.from === "rana" ? withLinks(message.text) : message.text}</p>
            <time dateTime={new Date(message.at).toISOString()}>{formatTime(message.at)}</time>
          </div>
        </li>
      ))}
      {typing ? (
        <li className="chat-msg is-typing">
          <img src={asset("/images/rana.webp")} alt="" />
          <div className="chat-body">
            <p className="chat-typing" aria-label="Rana is typing">
              <i />
              <i />
              <i />
            </p>
          </div>
        </li>
      ) : null}
    </ol>
  );

  if (editing) {
    stage = (
      <form className="chat-editor">
        {FIELDS.map(([id, label]) => (
          <label key={id}>
            {label}
            <textarea value={answers[id]} onChange={(event) => save(id, event.target.value)} />
          </label>
        ))}
      </form>
    );
  }

  return (
    <div className="page chat-page">
      <DotField
        className="dots"
        dotRadius={1.1}
        dotSpacing={28}
        pattern="grid"
        gradientFrom="#d8d7d1"
        gradientTo="#f4f4f2"
        gradientAngle={180}
        cursorRadius={90}
        bulgeStrength={0.16}
        twist={0}
        glowColor="#f4f4f2"
        glowRadius={48}
        glowIntensity={0.05}
        baseOpacity={0.1}
        waveAmplitude={0}
        sparkle={false}
        speed={0}
        interactive
        holdToZoom={false}
        intro={false}
        lightMode={false}
      />
      <main className="chat">
        <div className="chat-head">
          <div className="chat-tools">
            <p className="chat-beta">my bot.v1</p>
            {canEdit ? (
              <button
                type="button"
                className={editing ? "chat-edit is-on" : "chat-edit"}
                aria-pressed={editing}
                onClick={() => setEditing((current) => !current)}
              >
                {editing ? "Done" : "Edit"}
              </button>
            ) : null}
          </div>
          <Link className="chat-exit" to="/home">
            <span>Go to portfolio</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="chat-stage">{stage}</div>
        {editing ? null : (
          <div className="chat-suggestions is-docked">
            {CHIPS.map((chip) => (
              <button key={chip.id} type="button" onClick={() => ask(chip.label, answers[chip.id])}>
                {chip.label}
              </button>
            ))}
          </div>
        )}
        {editing ? null : (
          <form className="chat-form" onSubmit={onSubmit}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask me something"
              aria-label="Ask Rana"
              disabled={typing}
            />
            <button type="submit" disabled={typing}>
              Ask
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
