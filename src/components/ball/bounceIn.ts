/* The chat button behaves like a basketball: it drops in from above and to the left, bounces a few
   times (each bounce lower, set by real gravity and restitution), rolls into its corner and stops.
   Each landing ripples along the floor and a shadow follows it. Returns a cleanup function. */
export function bounceIn(el: HTMLElement, onSettled: () => void, onDone: () => void) {
  const G = 2600; // px/s²
  const E = 0.64; // restitution: how much speed survives each bounce
  const SLOW = 0.86; // horizontal speed kept on each bounce
  const R = 24; // ball radius, for the spin
  const H = Math.round(window.innerHeight * 0.8);
  const W = Math.min(440, Math.round(window.innerWidth * 0.55));
  const ROLL = 36;

  // vertical motion: fall from H, then bounces until they get small
  const segs: number[] = []; // airborne durations
  let v = Math.sqrt(2 * G * H);
  segs.push(v / G); // first fall
  v *= E;
  while (v > 380) {
    segs.push((2 * v) / G);
    v *= E;
  }
  // horizontal: travel W - ROLL in the air, then roll the last bit
  let k = 0;
  segs.forEach((t, i) => (k += t * Math.pow(SLOW, i)));
  const vx0 = (W - ROLL) / k;
  const vRoll = vx0 * Math.pow(SLOW, segs.length);
  const rollT = (2 * ROLL) / vRoll;

  const impacts: { t: number; x: number }[] = [];
  const pos = (ms: number) => {
    let t = ms / 1000;
    let x = -W;
    const y0 = -H;
    let up = Math.sqrt(2 * G * H) * E;
    for (let i = 0; i < segs.length; i++) {
      const vx = vx0 * Math.pow(SLOW, i);
      if (t <= segs[i]) {
        const y = i === 0 ? y0 + 0.5 * G * t * t : -(up * t - 0.5 * G * t * t);
        return { x: x + vx * t, y: Math.min(0, y), sinceHit: i === 0 ? 9 : 0 };
      }
      t -= segs[i];
      x += vx * segs[i];
      if (i > 0) up *= E;
    }
    // rolling
    const tt = Math.min(t, rollT);
    const a = vRoll / rollT;
    return { x: x + vRoll * tt - 0.5 * a * tt * tt, y: 0, sinceHit: 9 };
  };
  let acc = 0;
  segs.forEach((t) => {
    acc += t;
    impacts.push({ t: acc * 1000, x: pos(acc * 1000 - 1).x });
  });
  const total = (acc + rollT) * 1000 + 120;

  const STEP = 1000 / 60;
  const ball: Keyframe[] = [];
  const spins: number[] = [];
  const shade: Keyframe[] = [];
  for (let ms = 0; ms <= total; ms += STEP) {
    const p = pos(ms);
    const hit = impacts.find((h) => ms >= h.t && ms - h.t < 90);
    const sq = hit ? 1 - (ms - hit.t) / 90 : 0;
    const str = hit ? Math.min(1, 1 - impacts.indexOf(hit) * 0.25) : 0;
    const sx = 1 + 0.16 * sq * str;
    const sy = 1 - 0.18 * sq * str;
    const spin = (p.x + W) / R; // radians rolled
    ball.push({ offset: ms / total, transform: `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})` });
    const kk = Math.max(0, 1 - Math.min(1, -p.y / 220));
    shade.push({ offset: ms / total, transform: `translate(calc(-50% + ${p.x.toFixed(1)}px), -50%) scale(${(0.45 + kk * 0.55).toFixed(3)})`, opacity: (kk * 0.9).toFixed(3) });
    spins.push(spin);
  }
  // land upright: scale the spin so it finishes on a whole number of turns
  const end = spins[spins.length - 1] || 1;
  const turns = Math.max(1, Math.round(end / (2 * Math.PI)));
  const fit = (turns * 2 * Math.PI) / end;
  for (let i = 0; i < spins.length; i++) spins[i] *= fit;
  spins[spins.length - 1] = turns * 2 * Math.PI;
  ball[ball.length - 1].offset = 1;
  shade[shade.length - 1].offset = 1;

  const r = el.getBoundingClientRect(); // resting spot, measured before any transform
  const floor = window.innerHeight - 3; // the very bottom edge of the screen
  el.style.opacity = "1";
  const icon = el.querySelector<SVGElement>(".chat-mark__icon");
  const a1 = el.animate(ball, { duration: total, fill: "both" });
  const a3 = icon
    ? icon.animate(
        ball.map((b, i) => ({ offset: b.offset, transform: `rotate(${spins[i].toFixed(3)}rad)` })),
        { duration: total, fill: "both" },
      )
    : null;

  const shadow = document.createElement("span");
  shadow.className = "chat-shadow";
  shadow.style.left = `${r.left + r.width / 2}px`;
  shadow.style.top = `${floor}px`;
  document.body.appendChild(shadow);
  const a2 = shadow.animate(shade, { duration: total, fill: "both" });

  const timers: number[] = [];
  impacts.forEach((h, i) => {
    timers.push(
      window.setTimeout(() => {
        const ring = document.createElement("span");
        ring.className = "floor-ripple";
        ring.style.left = `${r.left + r.width / 2 + h.x}px`;
        ring.style.top = `${floor}px`;
        ring.style.setProperty("--k", String(Math.max(0.35, 1 - i * 0.25)));
        window.dispatchEvent(new CustomEvent("dot-ripple", { detail: { x: r.left + r.width / 2 + h.x, y: floor, k: Math.max(0.35, 1 - i * 0.25) } }));
        document.body.appendChild(ring);
        window.setTimeout(() => ring.remove(), 900);
      }, h.t),
    );
  });
  timers.push(window.setTimeout(onSettled, total + 60));
  timers.push(window.setTimeout(onDone, total + 5200));
  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    a1.cancel();
    a2.cancel();
    a3?.cancel();
    shadow.remove();
    el.style.opacity = "";
  };
}
