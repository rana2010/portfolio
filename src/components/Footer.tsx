import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CairoTime } from "./CairoTime";

const EMAIL = "ranaebrahim@aucegypt.edu";

/* "Email" copies the address; falls back to opening the mail app. */
function CopyEmail() {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);
  return (
    <a
      className={`u-link copy-email${copied ? " is-copied" : ""}`}
      href={`mailto:${EMAIL}`}
      onClick={(e) => {
        if (!navigator.clipboard) return;
        e.preventDefault();
        navigator.clipboard.writeText(EMAIL).then(
          () => setCopied(true),
          () => (window.location.href = `mailto:${EMAIL}`),
        );
      }}
      title={EMAIL}
      aria-label={`Copy my email, ${EMAIL}`}
    >
      {copied ? "Email copied ✓" : "Email"}
    </a>
  );
}

export function Footer({
  next,
}: {
  giant?: boolean;
  next?: { name: string; to: string };
}) {
  const base = (
    <div className="site-footer__base">
      <p>© 2026 Rana Ebrahim</p>
      <p className="site-footer__time">
        Local time in <CairoTime />
      </p>
    </div>
  );

  if (next) {
    return (
      <footer className="site-footer site-footer--case">
        <Link className="ds-next" to={next.to} viewTransition>
          <span className="ds-next__label">Next</span>
          <span className="ds-next__title">{next.name}</span>
        </Link>
        {base}
      </footer>
    );
  }

  return (
    <footer className="site-footer site-footer--hi" id="contact">
      <p className="site-footer__label">Let’s connect</p>
      <p className="hi__big">
        Say <em>hi!</em>
      </p>
      <div className="site-footer__links">
        <CopyEmail />
        <a className="u-link" href="https://www.linkedin.com/in/rana-ebrahimm/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
      {base}
    </footer>
  );
}
