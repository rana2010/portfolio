import { useEffect, useLayoutEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Chat } from "./pages/Chat";
import { Home } from "./pages/Home";
import { Projects } from "./pages/Projects";
import { CaseStudy } from "./pages/CaseStudy";
import { Echo } from "./pages/Echo";
import { Analyst } from "./pages/Analyst";
import { Handcrafted } from "./pages/Handcrafted";
import { ThemeProvider, useTapRing } from "./components/Chrome";
import { EditProvider } from "./components/EditContext";

type GoatCounter = { count: (vars?: { path?: string }) => void };

// Count each page view in this single-page app (GoatCounter only counts the first load on its own).
function countView(path: string) {
  let tries = 0;
  const send = () => {
    const gc = (window as Window & { goatcounter?: GoatCounter }).goatcounter;
    if (gc?.count) gc.count({ path });
    else if (tries++ < 20) window.setTimeout(send, 250);
  };
  send();
}

// Gentle reveal as things scroll into view (desktop and touch). Skipped for reduced motion.
const REVEAL =
  ".ds-section, .ds-stats > div, .ds-hero-compare, .work-list li, .home-about__body > *, .gallery__item, " +
  ".ds-problems li, .ds-finds li, .ds-persona, .ds-dgrid article, .ds-comp, .moscow-grid li, .site-footer__big";

function useReveal(key: string) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let io: IntersectionObserver | null = null;
    const t = window.setTimeout(() => {
      const items = Array.from(document.querySelectorAll<HTMLElement>(REVEAL));
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("rv-in");
            io?.unobserve(e.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
      );
      items.forEach((el) => {
        if (el.classList.contains("rv")) return;
        const sibs = el.parentElement ? Array.from(el.parentElement.children) : [];
        const i = Math.min(sibs.indexOf(el), 5);
        el.style.setProperty("--rv-delay", `${Math.max(i, 0) * 70}ms`);
        el.classList.add("rv");
        io!.observe(el);
      });
    }, 60);
    return () => {
      window.clearTimeout(t);
      io?.disconnect();
    };
  }, [key]);
}

export function App() {
  const { pathname, search } = useLocation();

  useTapRing();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useReveal(pathname);

  useEffect(() => {
    countView(pathname);
  }, [pathname, search]);

  return (
    <EditProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/handcrafted" element={<Handcrafted />} />
          <Route path="/work/pulse" element={<CaseStudy />} />
          <Route path="/work/echo" element={<Echo />} />
          <Route path="/work/analyst" element={<Analyst />} />
        </Routes>
      </ThemeProvider>
    </EditProvider>
  );
}
