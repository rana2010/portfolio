import { useEffect, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

type Phase = "in" | "ready" | "out";

export function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    document.title = "Rana Ebrahim";
    const ready = window.setTimeout(() => setPhase("ready"), 900);
    return () => window.clearTimeout(ready);
  }, []);

  function enter(event: MouseEvent) {
    event.preventDefault();
    if (phase === "out") return;
    setPhase("out");
    window.setTimeout(() => navigate("/home"), 520);
  }

  return (
    <main className={`splash splash-${phase}`}>
      <a className="splash-card" href="/home" onClick={enter} aria-label="Enter portfolio">
        <span className="splash-corners">
          <span>Rana Ebrahim</span>
          <span>Portfolio</span>
        </span>
        <span className="splash-body">
          <p className="splash-line">
            Hola, I’m Rana.
            <br />
            I love to create experiences
            <br />
            and make an impact.
          </p>
          <span className="splash-enter">DM to collaborate</span>
        </span>
        <span className="splash-split" aria-hidden="true">
          Rana
        </span>
      </a>
    </main>
  );
}
