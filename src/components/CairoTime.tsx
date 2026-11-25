import { useEffect, useState } from "react";

/* "Cairo 4:22 PM", live. */
export function CairoTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(t);
  }, []);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Cairo", hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const [h, m, ampm] = [get("hour"), get("minute"), get("dayPeriod")];
  return (
    <span className="site-nav__time" aria-label={`Cairo ${h}:${m} ${ampm}`}>
      Cairo{" "}
      <b>
        {h}
        <i>:</i>
        {m} {ampm}
      </b>
    </span>
  );
}
