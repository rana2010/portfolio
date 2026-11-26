import { useState } from "react";
import { asset } from "../asset";
import { Laptop } from "./Laptop";

/* Click-through prototype of the final Create Ticket flow, built from Rana's own screens. Each step has one
   hotspot on the real button (positions in % of the screen): Next, then Submit with a field missing. */
const STEPS = [
  { src: "/images/echo/echo-final-step1.webp", alt: "Step 1: department and layout", hint: "Choose the department and layout, then press Next", spot: { left: 93.6, top: 88.6, w: 5, h: 6.8 } },
  { src: "/images/echo/echo-final-step2.webp", alt: "Step 2: the fields for this ticket", hint: "Only this ticket's fields appear. Press Submit", spot: { left: 92.6, top: 92.6, w: 5.9, h: 4.6 } },
  { src: "/images/echo/echo-final-required.webp", alt: "A missed required field, flagged", hint: "A missed field is flagged. Press Submit to start again", spot: { left: 92.6, top: 86.2, w: 5.9, h: 4.6 } },
];

export function EchoFlow() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  return (
    <figure className="pv-proto echo-flow">
      <ol className="pv-steps" aria-live="polite">
        {STEPS.map((st, i) => (
          <li key={st.src} className={i === step ? "is-on" : i < step ? "is-done" : undefined}>
            <span>{i + 1}</span>
            {st.hint}
          </li>
        ))}
      </ol>
      <Laptop label="Create Ticket, click-through prototype">
        <div className="echo-flow__screen">
          {STEPS.map((st, i) => (
            <img key={st.src} className={i === step ? "is-on" : undefined} src={asset(st.src)} alt={i === step ? st.alt : ""} />
          ))}
          <button
            type="button"
            className="echo-flow__spot"
            style={{ left: `${s.spot.left}%`, top: `${s.spot.top}%`, width: `${s.spot.w}%`, height: `${s.spot.h}%` }}
            aria-label={step === 0 ? "Next" : "Submit"}
            onClick={() => setStep((step + 1) % STEPS.length)}
          />
        </div>
      </Laptop>
    </figure>
  );
}
