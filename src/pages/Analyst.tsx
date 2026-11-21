import { useEffect, useState } from "react";
import { Dots, Nav } from "../components/Chrome";
import { AnalystPrototype } from "./AnalystPrototype";

const SNIPPET_PATH = "src/components/Step1Discovery.jsx";
const SNIPPET_URL =
  "https://github.com/rana2010/AI-Analyst/blob/main/src/components/Step1Discovery.jsx";

const SNIPPET = `export default function Step1Discovery({ prompt, onPromptChange, onStart, suggestions = [] }) {
  const [showSuggestions, setShowSuggestions] = useState(true);

  return (
    <div className="mx-auto flex min-h-[62vh] w-full max-w-xl flex-col items-center justify-center px-2 text-center">
      <NoonEmblem size="hero" className="mb-5" />

      <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[28px]">
        How can I help you today?
      </h1>

      <div className="mt-6 w-full">
        <Composer
          mode="hero"
          value={prompt}
          onChange={onPromptChange}
          onSubmit={onStart}
          placeholder="Ask the analyst anything…"
          buttonLabel="Start"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-6 w-full text-left">
          <div className="mb-2.5 flex items-center justify-between px-0.5">
            <span className="text-[13px] text-ink-muted">Get started</span>
            <button
              type="button"
              onClick={() => setShowSuggestions(false)}
              aria-label="Dismiss suggestions"
              className="grid h-6 w-6 place-items-center rounded-md text-ink-faint"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {suggestions.map((s) => (
              <button key={s.label} type="button" onClick={() => onPromptChange(s.prompt)}>
                <SuggestionIcon type={s.icon} />
                <span className="mt-3 text-[13px] leading-[1.35] text-ink">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
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
    document.title = "AI Analyst · Rana Ebrahim";
  }, []);

  return (
    <div className="page">
      <Dots />
      <Nav />
      <main className="projects analyst">
        <header className="analyst-head">
          <h1>AI Analyst</h1>
          <p>
            A chatbot for customer support analytics. Ask a question, approve the agents, and read
            the brief.
          </p>
        </header>

        <section className="stage" aria-label="AI Analyst prototype">
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
      </main>
    </div>
  );
}
