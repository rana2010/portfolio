import { useEffect, useState } from "react";

export function CairoTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(t);
  }, []);
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const h = parts.find((p) => p.type === "hour")?.value ?? "";
  const m = parts.find((p) => p.type === "minute")?.value ?? "";
  return (
    <span className="site-nav__time" aria-label={`Cairo time ${h}:${m}`}>
      Cairo, EG{" "}
      <b>
        {h}
        <i>:</i>
        {m}
      </b>
    </span>
  );
}
