import { useEffect, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

type Phase = "in" | "ready" | "out";

export function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    document.title = "Rana Ebrahim";
    const ready = window.setTimeout(() => setPhase("ready"), 1500);
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
      <div className="splash-glow" aria-hidden="true" />
      <div className="splash-top">
        <p>Product Design</p>
        <a href="/home" onClick={enter}>
          Portfolio
        </a>
      </div>
      <a className="splash-name" href="/home" onClick={enter} aria-label="Enter portfolio">
        <span className="mask">
          <span>Rana</span>
        </span>
        <sup>®</sup>
        <span className="mask">
          <span>Ebrahim</span>
        </span>
        <span className="splash-rule" aria-hidden="true" />
      </a>
    </main>
  );
}
