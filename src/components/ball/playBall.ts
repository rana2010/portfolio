/* End-of-page play on the home page, like a basketball. At the bottom of the page the chat ball waits 2s,
   makes low hops along the footer line until it is close to "Say hi!", jumps onto the words and bounces
   on them twice, drops to the bottom-left floor, then bounces back alternating floor and footer line,
   settles in the bottom-right corner and shows "Wanna know more?". Two rounds, then it dissolves into the
   nearest background dots. Every flight is a true parabola under one gravity; bounce heights follow a
   coefficient of restitution. Scroll up at any point and it hops home. Returns a cleanup function. */
export function playBall(el: HTMLElement) {
  const G = 2600; // gravity, px/s²
  const E = 0.62; // restitution: speed kept per bounce (height kept = E²)
  const R = Math.max(18, el.offsetWidth / 2 || 24); // the real button radius
  const icon = el.querySelector<SVGElement>(".chat-mark__icon");
  const tip = el.querySelector<HTMLElement>(".chat-mark__tip");
  const tipText = tip?.textContent ?? "";

  type V = { x: number; y: number };
  type Hit = "floor" | "line" | "say" | null;
  // one flight: from a to b, peaking `apex` px above the higher end; gDown > G = pushed down (dribble)
  type Arc = { a: V; b: V; Y: number; tUp: number; tDown: number; gDown: number; hit: Hit };
  const arc = (a: V, b: V, apex: number, hit: Hit, gDown = G): Arc => {
    const Y = Math.min(a.y, b.y) - apex;
    const tUp = Math.sqrt((2 * (a.y - Y)) / G);
    const tDown = Math.sqrt((2 * (b.y - Y)) / gDown);
    return { a, b, Y, tUp, tDown, gDown, hit };
  };

  let origin: V = { x: 0, y: 0 };
  let pos: V = { x: 0, y: 0 };
  let vy = 0;
  let spin = 0;
  let squash = 0;
  let arcs: Arc[] = [];
  let ai = 0;
  let t0 = 0;
  let raf = 0;
  let lastNow = 0;
  let done: () => void = () => {};
  let wait = 0;
  let playing = false;
  let gone = false;
  let round = 0;
  const ROUNDS = 2;

  // home = where CSS parks the button (fixed, right/bottom). Read from the stylesheet, never from the
  // moving element, so it is right even mid-flight.
  const homeCentre = () => {
    const cs = getComputedStyle(el);
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    return { x: window.innerWidth - parseFloat(cs.right) - w / 2, y: window.innerHeight - parseFloat(cs.bottom) - h / 2 };
  };

  // the words of "Say hi!" (not the whole line box): where the ball can actually land
  const sayBox = () => {
    const el2 = document.querySelector<HTMLElement>(".hi__big");
    if (!el2) return null;
    const range = document.createRange();
    range.selectNodeContents(el2);
    const r = range.getBoundingClientRect();
    if (!r.width || r.top < 70 || r.bottom > origin.y) return null;
    return { left: r.left + 4, right: r.right - 10, top: r.top + r.height * 0.16 - R, width: r.width };
  };

  // part 1: from the bottom-right corner, low hops along the footer line until close to "Say hi!",
  // a jump up onto the words, a second bounce on them, then a drop to the bottom-left floor
  const planOver = (): Arc[] => {
    origin = homeCentre();
    const W = window.innerWidth;
    const floor = origin.y;
    const leftX = W - origin.x;
    const list: Arc[] = [];
    let p: V = { ...pos };
    const say = sayBox();
    const lineR = document.querySelector<HTMLElement>(".site-footer__base")?.getBoundingClientRect();
    const hasLine = lineR && lineR.top < floor - 10 && lineR.top > 80;

    if (hasLine && lineR) {
      const ly = lineR.top - R;
      // up onto the line
      const first = { x: Math.min(lineR.right - R, p.x - 90), y: ly };
      list.push(arc(p, first, 60, "line"));
      p = first;
      // low, even hops leftwards until just past the end of "Say hi!"
      const stopX = say ? say.right + 150 : W * 0.45;
      const HOP = 42;
      const stepX = 150;
      let guard = 0;
      while (p.x - stepX > stopX && guard++ < 20) {
        const q = { x: p.x - stepX, y: ly };
        list.push(arc(p, q, HOP, "line"));
        p = q;
      }
    }

    if (say) {
      // jump up onto the near end of the words
      const land1 = { x: say.right - say.width * 0.15, y: say.top };
      list.push(arc(p, land1, 90, "say"));
      // one more bounce on the words (lower: height × E²), moving left
      const drop = land1.y - (Math.min(p.y, land1.y) - 90);
      const h2 = Math.max(40, drop * E * E);
      const land2 = { x: say.left + say.width * 0.4, y: say.top };
      list.push(arc(land1, land2, h2, "say"));
      // off the left end and down to the floor
      const h3 = Math.max(24, h2 * E * E);
      const down = { x: Math.max(leftX, say.left - R), y: floor };
      list.push(arc(land2, down, h3, "floor"));
      p = down;
    } else {
      const down = { x: leftX + 40, y: floor };
      list.push(arc(p, down, 160, "floor"));
      p = down;
    }

    return list;
  };

  // part 2: no stop. From the drop it bounces back to its corner, alternating one bounce on the floor
  // and one on the footer line, at an easy pace; near the corner the bounces die out (height × E²).
  const planBack = (dropH: number): Arc[] => {
    origin = homeCentre();
    const floor = origin.y;
    const list: Arc[] = [];
    let p: V = { ...pos };
    const lineR = document.querySelector<HTMLElement>(".site-footer__base")?.getBoundingClientRect();
    const ly = lineR && lineR.top < floor - 10 && lineR.top > 80 ? lineR.top - R : null;
    const lineLeft = lineR ? lineR.left + R : 0;
    const lineRight = lineR ? lineR.right - R : 0;
    const VX = 190; // px/s: relaxed
    const H = Math.min(120, Math.max(90, dropH * E * E)); // apex above the higher end of each hop
    const flight = (a: V, b: V, h: number) => {
      const Y = Math.min(a.y, b.y) - h;
      return Math.sqrt((2 * (a.y - Y)) / G) + Math.sqrt((2 * (b.y - Y)) / G);
    };
    // the dying bounces at the end, on the floor
    const tail: number[] = [];
    for (let h = H * E * E; h > 6; h *= E * E) tail.push(h);
    const tailDist = tail.reduce((d, h) => d + VX * 2 * Math.sqrt((2 * h) / G), 0);
    let onLine: boolean = false;
    let guard = 0;
    while (guard++ < 40) {
      const left = origin.x - p.x;
      if (left <= tailDist + 40) break;
      // next surface: alternate line / floor (the line only where it exists under the ball)
      const wantLine: boolean = !onLine && ly !== null;
      const y = wantLine ? (ly as number) : floor;
      const est = VX * flight(p, { x: p.x + 100, y }, H);
      let qx = p.x + Math.min(est, left - tailDist);
      if (wantLine) qx = Math.max(lineLeft, Math.min(lineRight, qx));
      const q = { x: qx, y };
      list.push(arc(p, q, H, wantLine ? "line" : "floor"));
      p = q;
      onLine = wantLine;
    }
    // finish on the floor and let it settle into the corner
    if (onLine) {
      const q = { x: p.x + Math.min(VX * flight(p, { x: p.x, y: floor }, H * 0.8), (origin.x - p.x) * 0.5), y: floor };
      list.push(arc(p, q, H * 0.8, "floor"));
      p = q;
    }
    const totalTail = tail.reduce((a, h) => a + 2 * Math.sqrt((2 * h) / G), 0) || 1;
    const rest = origin.x - p.x;
    tail.forEach((h, k) => {
      const q = { x: k === tail.length - 1 ? origin.x : p.x + (rest * 2 * Math.sqrt((2 * h) / G)) / totalTail, y: floor };
      list.push(arc(p, q, h, "floor"));
      p = q;
    });
    if (Math.abs(p.x - origin.x) > 0.5) list.push(arc(p, { x: origin.x, y: floor }, 3, "floor"));
    return list;
  };

  const ripple = (k: number) =>
    window.dispatchEvent(new CustomEvent("dot-ripple", { detail: { x: pos.x, y: pos.y + R, k } }));
  const dipSay = () =>
    document.querySelector(".hi__big")?.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(4px)" }, { transform: "translateY(0)" }],
      { duration: 300, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );

  const render = () => {
    const stretch = Math.min(0.05, Math.abs(vy) / 30000);
    const sx = 1 + 0.1 * squash - stretch * 0.5;
    const sy = 1 - 0.12 * squash + stretch;
    const lift = (1 - sy) * R; // keep the bottom on the surface while squashed
    el.style.transform = `translate(${(pos.x - origin.x).toFixed(1)}px, ${(pos.y - origin.y + lift).toFixed(1)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
    if (icon) icon.style.transform = `rotate(${spin.toFixed(3)}rad)`;
  };

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;
    squash = Math.max(0, squash - dt * 8);
    const a = arcs[ai];
    if (!a) {
      render();
      return;
    }
    const t = (now - t0) / 1000;
    const T = a.tUp + a.tDown;
    const tt = Math.min(t, T);
    const x = a.a.x + (a.b.x - a.a.x) * (tt / T);
    const y = tt < a.tUp ? a.Y + 0.5 * G * (a.tUp - tt) ** 2 : a.Y + 0.5 * a.gDown * (tt - a.tUp) ** 2;
    vy = tt < a.tUp ? -G * (a.tUp - tt) : a.gDown * (tt - a.tUp);
    spin += (x - pos.x) / R;
    pos = { x, y };
    if (t >= T) {
      const impact = a.gDown * a.tDown;
      squash = Math.min(1, impact / 1500);
      if (a.hit) ripple(Math.min(0.9, 0.2 + impact / 2600));
      if (a.hit === "say") dipSay();
      ai += 1;
      t0 = now - (t - T) * 1000; // carry the leftover time into the next arc
      if (ai >= arcs.length) {
        vy = 0;
        render();
        squash = 0;
        vy = 0;
        render(); // rest perfectly round, never squashed
        const d = done;
        d(); // may start the next plan, which schedules its own frame
        return;
      }
    }
    render();
    raf = requestAnimationFrame(frame);
  };
  const run = (list: Arc[], then: () => void) => {
    arcs = list;
    ai = 0;
    t0 = lastNow = performance.now();
    done = then;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  };

  const showTip = (on: boolean) => {
    if (tip) tip.textContent = on ? "Wanna know more?" : tipText;
    el.classList.toggle("play-tip", on);
  };
  // subtle exit into the dots: the ball quietly shrinks and blurs while it comes apart into
  // dot-sized specks. Each speck drifts a short way to the nearest background dot, warms to the accent
  // for a moment, then fades into that dot. No swell, no flash: everything eases out.
  const vanish = () => {
    gone = true;
    el.style.pointerEvents = "none";
    const cs = getComputedStyle(document.documentElement);
    const accent = cs.getPropertyValue("--signal").trim() || "#f97316";
    const ink = getComputedStyle(el).backgroundColor;
    const STEP = 28.2; // background grid pitch (dotRadius 1.1 × 2 + dotSpacing 26)
    const W = window.innerWidth;
    const H = window.innerHeight;
    const snap = (v: number, c: number) => c + Math.round((v - c) / STEP) * STEP;
    const cx = pos.x;
    const cy = pos.y;
    const base = el.style.transform || "none";
    el.animate(
      [
        { transform: base, opacity: 1, filter: "blur(0px)" },
        { transform: `${base} scale(0.2)`, opacity: 0, filter: "blur(4px)" },
      ],
      { duration: 1000, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
    );
    icon?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" });
    // the nearest grid dots around the ball, closest first
    const spots: { x: number; y: number; d: number }[] = [];
    for (let gx = -3; gx <= 3; gx++)
      for (let gy = -3; gy <= 2; gy++) {
        const x = snap(cx, W / 2) + gx * STEP;
        const y = snap(cy, H / 2) + gy * STEP;
        if (y > H - 4 || x < 4 || x > W - 4) continue;
        spots.push({ x, y, d: Math.hypot(x - cx, y - cy) });
      }
    spots.sort((a, b) => a.d - b.d);
    spots.slice(0, 16).forEach((t, k) => {
      const sp = document.createElement("span");
      sp.className = "ball-speck";
      // start somewhere inside the ball
      const a = Math.random() * Math.PI * 2;
      const r0 = Math.random() * R * 0.7;
      const sx = cx + Math.cos(a) * r0;
      const sy = cy + Math.sin(a) * r0;
      sp.style.left = `${sx}px`;
      sp.style.top = `${sy}px`;
      document.body.appendChild(sp);
      const to = `translate(calc(-50% + ${(t.x - sx).toFixed(1)}px), calc(-50% + ${(t.y - sy).toFixed(1)}px))`;
      sp.animate(
        [
          { transform: "translate(-50%, -50%)", opacity: 0, backgroundColor: ink },
          { transform: "translate(-50%, -50%)", opacity: 0.9, backgroundColor: ink, offset: 0.15 },
          { transform: to, opacity: 0.85, backgroundColor: accent, offset: 0.6 },
          { transform: to, opacity: 0, backgroundColor: accent },
        ],
        { duration: 1900, delay: 150 + k * 35, easing: "cubic-bezier(0.25, 0.8, 0.25, 1)", fill: "forwards" },
      );
      window.setTimeout(() => sp.remove(), 2800);
    });
    window.setTimeout(() => window.dispatchEvent(new CustomEvent("dot-ripple", { detail: { x: cx, y: cy, k: 0.45 } })), 500);
  };
  const startRound = () => {
    if (!playing) return;
    origin = homeCentre();
    pos = { ...origin };
    const over = planOver();
    const lastDrop = over.length ? over[over.length - 1].b.y - over[over.length - 1].Y : 200;
    run(over, () => {
      // no stop: it bounces straight back, slow and relaxed
      if (!playing) return;
      run(planBack(lastDrop), () => {
        round += 1;
        showTip(true);
        wait = window.setTimeout(() => {
          showTip(false);
          if (round >= ROUNDS) vanish();
          else wait = window.setTimeout(startRound, 2000);
        }, 3500);
      });
    });
  };
  const goHome = () => {
    origin = homeCentre();
    const list = Math.hypot(pos.x - origin.x, pos.y - origin.y) < 1 ? [] : [arc(pos, { ...origin }, 60, "floor")];
    const finish = () => {
      el.style.transform = "";
      el.classList.remove("is-playing");
      if (icon) icon.style.transform = "";
    };
    if (!list.length) return finish();
    run(list, finish);
  };

  const atBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  const onScroll = () => {
    const bottom = atBottom();
    if (bottom && !playing && !gone) {
      playing = true;
      el.classList.add("is-playing");
      window.clearTimeout(wait);
      if (!arcs[ai]) pos = homeCentre();
      wait = window.setTimeout(startRound, 2000);
    } else if (!bottom && playing) {
      playing = false;
      window.clearTimeout(wait);
      showTip(false);
      if (gone) {
        el.getAnimations().forEach((a) => a.cancel());
        icon?.getAnimations().forEach((a) => a.cancel());
        el.style.transform = "";
        el.style.pointerEvents = "";
        el.classList.remove("is-playing");
        el.animate([{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "scale(1)" }], { duration: 500, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
        return;
      }
      goHome();
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.clearTimeout(wait);
    if (raf) cancelAnimationFrame(raf);
    el.getAnimations().forEach((a) => a.cancel());
    el.style.transform = "";
    el.style.pointerEvents = "";
    icon?.getAnimations().forEach((a) => a.cancel());
    el.classList.remove("is-playing", "play-tip", "tip-left");
    if (tip) tip.textContent = tipText;
    if (icon) icon.style.transform = "";
  };
}
