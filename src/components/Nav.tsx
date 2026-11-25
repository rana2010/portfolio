import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MoonIcon, SunIcon, useTheme } from "./theme";
import { bounceIn } from "./ball/bounceIn";
import { playBall } from "./ball/playBall";

let droppedThisLoad = false;

export function Nav() {
  const { theme, toggle } = useTheme();
  // plays on every full page load (including refresh), not on in-site navigation
  const [chat, setChat] = useState<"wait" | "drop" | "idle">(() => (droppedThisLoad ? "idle" : "wait"));
  useEffect(() => {
    if (chat !== "wait") return;
    const t = window.setTimeout(() => {
      droppedThisLoad = true;
      setChat("drop");
    }, 4000);
    return () => window.clearTimeout(t);
  }, [chat]);
  const mark = useRef<HTMLAnchorElement>(null);
  const [tip, setTip] = useState(false);
  useEffect(() => {
    if (chat !== "drop") return;
    const el = mark.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTip(true);
      const t = window.setTimeout(() => {
        setTip(false);
        setChat("idle");
      }, 5000);
      return () => window.clearTimeout(t);
    }
    return bounceIn(el, () => setTip(true), () => {
      setTip(false);
      setChat("idle");
    });
  }, [chat]);
  // the end-of-page ball routine plays on the home page only
  const { pathname } = useLocation();
  const onHome = pathname === "/" || pathname === "/home";
  useEffect(() => {
    if (chat !== "idle" || !mark.current || !onHome) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return playBall(mark.current);
  }, [chat, onHome]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={scrolled ? "site-nav is-scrolled" : "site-nav"}>
        <Link className="site-nav__name" to="/" viewTransition>
          Rana Ebrahim
        </Link>
        <nav className="site-nav__links" aria-label="Main">
          <Link
            to={{ pathname: "/", hash: "work" }}
            viewTransition
            onClick={(e) => {
              const onHome = window.location.pathname.replace(/\/+$/, "").match(/\/(portfolio)?(\/home)?$/);
              const list = document.getElementById("work");
              if (onHome && list) {
                e.preventDefault();
                list.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", "#work");
              }
            }}
          >
            Work
          </Link>
          <NavLink to="/handcrafted" viewTransition>Handcrafted</NavLink>
          <button
            className="site-nav__theme"
            type="button"
            onClick={toggle}
            aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          >
            {theme === "light" ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>
      </header>
      <Link ref={mark} className={`chat-mark is-${chat}${tip ? " tip-on" : ""}`} to="/chat" aria-label="Ask me about my work: my AI bot">
        <svg className="chat-mark__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path className="chat-mark__star" d="M11 2.5c.7 5.1 2.4 6.8 7.5 7.5-5.1.7-6.8 2.4-7.5 7.5-.7-5.1-2.4-6.8-7.5-7.5 5.1-.7 6.8-2.4 7.5-7.5Z" />
          <path className="chat-mark__star chat-mark__star--sm" d="M18.5 15.5c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z" />
        </svg>
        <span className="chat-mark__tip" aria-hidden="true">Ask me about my work</span>
      </Link>
    </>
  );
}
