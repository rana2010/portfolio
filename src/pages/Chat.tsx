import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { asset } from "../asset";

const SUGGESTIONS = [
  "What do you design?",
  "Where do you work?",
  "Tell me about Echo",
  "What have you made by hand?",
  "How can I reach you?",
];

type Message = { from: "rae" | "you"; text: string };

function reply(question: string) {
  const q = question.toLowerCase();
  if (/echo|zoho|crm/.test(q)) {
    return "Echo is Noon’s internal CRM. Rana owned the design, and it was built to replace Zoho.";
  }
  if (/pulse|shopping|e-?commerce/.test(q)) {
    return "Pulse is product design for one of the Middle East’s largest online shopping platforms.";
  }
  if (/analyst|vibe/.test(q)) {
    return "AI Analyst is a chatbot for customer support analytics. It was vibe coded, and you can try the prototype in the projects.";
  }
  if (/hand|queen|craft|draw|ink|wheel|map/.test(q)) {
    return "In the era of AI, Rana has been reminiscing about design and craft by hand. Queen Falling is an ink and calligraphy collage from 2021. There is also a paper color wheel and a film sheet she calls Egypt’s deciphered make.";
  }
  if (/noon|fawry|promolink|work|job|career|role/.test(q)) {
    return "Rana is a Product Designer II at noon, 2025 to present. Before that she was a Junior Product Designer at Fawry, and a UX Designer at Promolinks International.";
  }
  if (/stack|figma|react|code|tool|cursor|claude/.test(q)) {
    return "She designs in Figma and prototypes in React. The stack also includes Tailwind CSS, shadcn/ui, Cursor, Claude, ChatGPT, and GitHub.";
  }
  if (/reach|contact|email|collaborat|hire|linkedin|behance|dm/.test(q)) {
    return "Write to ranaebrahim@aucegypt.edu. LinkedIn and Behance are in the footer.";
  }
  if (/design|who|about|rana|hello|hey|hi\b/.test(q)) {
    return "Rana makes research-based design decisions. She maps the flows, runs user interviews, and ships working prototypes in code. She loves to create experiences and make an impact.";
  }
  return "I can tell you about Rana’s work, Echo, Pulse, the handcrafted pieces, and how to reach her. Or write her at ranaebrahim@aucegypt.edu.";
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    document.title = "Rana Ebrahim";
  }, []);

  function ask(text: string) {
    const question = text.trim();
    if (!question) return;
    setMessages((current) => [
      ...current,
      { from: "you", text: question },
      { from: "rae", text: reply(question) },
    ]);
    setDraft("");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    ask(draft);
  }

  return (
    <div className="page chat-page">
      <main className="chat">
        <Link className="chat-exit" to="/home">
          Go to portfolio
        </Link>
        <div className="chat-stage">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <img className="chat-avatar" src={asset("/images/rana.webp")} alt="" />
              <p className="chat-name">Rae</p>
              <h1>Hey, try out my chatbot.</h1>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((item) => (
                  <button key={item} type="button" onClick={() => ask(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ol className="chat-log">
              {messages.map((message, index) => (
                <li key={index} className={message.from === "you" ? "chat-msg is-you" : "chat-msg"}>
                  {message.from === "rae" ? <img src={asset("/images/rana.webp")} alt="" /> : null}
                  <p>{message.text}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
        <form className="chat-form" onSubmit={onSubmit}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask me something"
            aria-label="Ask Rae"
          />
          <button type="submit">Ask</button>
        </form>
      </main>
    </div>
  );
}
