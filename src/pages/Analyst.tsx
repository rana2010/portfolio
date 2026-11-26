import { useEffect, useState } from "react";
import { Dots, Footer, Nav } from "../components/Chrome";
import { AnalystPrototype } from "./AnalystPrototype";
import { Laptop } from "../components/Laptop";

const SNIPPET_PATH = "src/components/Step1Discovery.jsx";
const SNIPPET_URL =
  "https://github.com/rana2010/AI-Analyst/blob/main/src/components/Step1Discovery.jsx";

const SNIPPET = `export default function Step1Discovery({ prompt, onPromptChange, onStart }) {
  return (
    <div className="mx-auto flex min-h-[62vh] max-w-xl flex-col items-center justify-center">
      <NoonEmblem size="hero" className="mb-5" />
      <h1 className="text-[28px] font-semibold tracking-tight">
        How can I help you today?
      </h1>
      <Composer
        mode="hero"
        value={prompt}
        onChange={onPromptChange}
        onSubmit={onStart}
        placeholder="Ask the analyst anything…"
      />
    </div>
  );
}`;

type Token = { kind: string; text: string };

function tokenize(line: string): Token[] {
  const re =
    /(\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|export|default|function|return|const|from|if|new)\b|<\/?[A-Za-z][\w.]*)/g;
  const tokens: Token[] = [];
  let last = 0;
  for (const match of line.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push({ kind: "plain", text: line.slice(last, index) });
    const text = match[0];
    const kind = text.startsWith("//")
      ? "comment"
      : text.startsWith('"') || text.startsWith("'") || text.startsWith("`")
        ? "string"
        : text.startsWith("<")
          ? "tag"
          : "keyword";
    tokens.push({ kind, text });
    last = index + text.length;
  }
  if (last < line.length) tokens.push({ kind: "plain", text: line.slice(last) });
  return tokens;
}

export function Analyst() {
  const [mode, setMode] = useState<"preview" | "code">("preview");

  useEffect(() => {
    document.title = "CS Analytics Bot · Rana Ebrahim";
  }, []);

  return (
    <div className="page case analyst">
      <Dots />
      <Nav />
      <main>
        <header className="case-hero">
          <p className="case-kicker">noon · internal tool</p>
          <h1 className="case-title">CS Analytics Bot</h1>
          <p className="case-summary">AI analyst used for product discovery.</p>
          <ul className="tags">
            <li>Vibe coding</li>
            <li>Conversational UI</li>
            <li>Product discovery</li>
          </ul>
          <dl className="glance">
            <div><dt>Role</dt><dd>Designer and builder</dd></div>
            <div><dt>Built with</dt><dd>Cursor, Claude</dd></div>
            <div><dt>Time</dt><dd>One week</dd></div>
            <div><dt>Used by</dt><dd>Leadership, CS team</dd></div>
          </dl>
        </header>
        <section className="case-block">
          <h2>The question</h2>
          <p className="statement">Why do customers contact support again after they have already filed a complaint?</p>
          <p className="support">
            To help noon raise customer satisfaction, I vibe-coded a chatbot that answers questions about support
            data in plain words: ask, approve the agents, read the brief.
          </p>
        </section>
        <section className="case-block">
          <h2>Try it, or read the code</h2>
        <Laptop label="CS Analytics Bot, interactive">
        <section className="stage" aria-label="CS Analytics Bot prototype">
          <div className="stage-bar">
            <div className="seg" role="tablist" aria-label="View">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "preview"}
                className={mode === "preview" ? "is-on" : undefined}
                onClick={() => setMode("preview")}
              >
                Preview
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "code"}
                className={mode === "code" ? "is-on" : undefined}
                onClick={() => setMode("code")}
              >
                Code
              </button>
            </div>
            <div className="stage-actions">
              <a href={SNIPPET_URL} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </div>

          {mode === "preview" ? (
            <div className="stage-preview" role="tabpanel">
              <AnalystPrototype />
            </div>
          ) : (
            <div className="stage-code" role="tabpanel">
              <div className="code-file">
                <span>JS</span>
                {SNIPPET_PATH}
              </div>
              <pre>
                {SNIPPET.split("\n").map((line, index) => (
                  <div key={index}>
                    <span className="ln">{index + 1}</span>
                    <code>
                      {tokenize(line).map((token, tokenIndex) => (
                        <span key={tokenIndex} className={token.kind}>
                          {token.text}
                        </span>
                      ))}
                    </code>
                  </div>
                ))}
              </pre>
            </div>
          )}
        </section>
        </Laptop>
        </section>
      </main>
      <Footer next={{ name: "Pulse", to: "/work/pulse" }} />
    </div>
  );
}
