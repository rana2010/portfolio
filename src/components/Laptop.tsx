import type { ReactNode } from "react";

/* The laptop frame used for live demos (same look as the Pulse prototype): lid with camera, screen, base. */
export function Laptop({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="pv-device laptop" role="group" aria-label={label}>
      <div className="pv-device__lid">
        <span className="pv-device__cam" aria-hidden="true" />
        <div className="laptop__screen">{children}</div>
      </div>
      <div className="pv-device__base" aria-hidden="true" />
    </div>
  );
}
