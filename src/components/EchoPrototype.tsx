import { useState } from "react";

/* A small working version of Echo's final ticket flow: pick a department and a layout, press Next, and only
   the fields that layout needs appear. Submit with a required field empty and it is outlined, with a toast. */

const LAYOUTS = {
  Refund: [
    { id: "name", label: "Contact name", required: true, hint: "Ahmed Galal" },
    { id: "order", label: "Order link", required: true, hint: "https://noon.com/…" },
    { id: "amount", label: "Refund amount", required: false, hint: "0.00" },
  ],
  "Late delivery": [
    { id: "name", label: "Contact name", required: true, hint: "Ahmed Galal" },
    { id: "tracking", label: "Tracking link", required: true, hint: "https://…" },
    { id: "due", label: "Due date", required: false, hint: "Select date" },
  ],
} as const;
type Layout = keyof typeof LAYOUTS;
const SECTIONS = ["Basic information", "Customer details", "Ticket details"];

export function EchoPrototype() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dept, setDept] = useState("");
  const [layout, setLayout] = useState<Layout | "">("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [missing, setMissing] = useState<string[]>([]);
  const fields = layout ? LAYOUTS[layout] : [];

  const next = () => {
    const empty = [!dept && "dept", !layout && "layout"].filter(Boolean) as string[];
    setMissing(empty);
    if (!empty.length) setStep(2);
  };
  const submit = () => {
    const empty = fields.filter((f) => f.required && !values[f.id]?.trim()).map((f) => f.id);
    setMissing(empty);
    if (!empty.length) setStep(3);
  };
  const reset = () => {
    setStep(1);
    setDept("");
    setLayout("");
    setValues({});
    setMissing([]);
  };
  const clear = (id: string) => setMissing((m) => m.filter((x) => x !== id)); // fixed fields stop being flagged
  const bad = (id: string) => (missing.includes(id) ? " is-missing" : "");

  return (
    <div className="echo-proto" aria-label="Interactive Echo ticket form">
      <aside className="echo-proto__sections">
        <span>Sections</span>
        {SECTIONS.map((s, i) => (
          <b key={s} className={(step === 1 ? i === 0 : i > 0) ? "is-on" : undefined}>
            {s}
          </b>
        ))}
      </aside>
      <div className="echo-proto__form">
        <p className="echo-proto__subject">Create ticket</p>
        {step === 3 ? (
          <div className="echo-proto__done">
            <p>Ticket created ✓</p>
            <button type="button" onClick={reset}>
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="echo-proto__grid">
              <label className={bad("dept")}>
                Department *
                <select value={dept} onChange={(e) => (setDept(e.target.value), clear("dept"))} disabled={step === 2}>
                  <option value="">Select department</option>
                  <option>Customer support</option>
                  <option>Logistics</option>
                </select>
              </label>
              <label className={bad("layout")}>
                Layout *
                <select value={layout} onChange={(e) => (setLayout(e.target.value as Layout), clear("layout"))} disabled={step === 2}>
                  <option value="">Select layout</option>
                  {Object.keys(LAYOUTS).map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </label>
              {step === 2 &&
                fields.map((f) => (
                  <label key={f.id} className={`echo-proto__in${bad(f.id)}`}>
                    {f.label} {f.required ? "*" : <em>(optional)</em>}
                    <input
                      placeholder={f.hint}
                      value={values[f.id] ?? ""}
                      onChange={(e) => (setValues({ ...values, [f.id]: e.target.value }), clear(f.id))}
                    />
                  </label>
                ))}
            </div>
            {missing.length > 0 && <p className="echo-proto__toast">Please complete the required fields</p>}
            <div className="echo-proto__actions">
              {step === 2 && (
                <button type="button" onClick={reset}>
                  Back
                </button>
              )}
              <button type="button" className="is-primary" onClick={step === 1 ? next : submit}>
                {step === 1 ? "Next" : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
