import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MoonIcon, SunIcon, useTheme } from "./theme";
import { playBall } from "./ball/playBall";
import { asset } from "../asset";

export function Nav() {
  const { theme, toggle } = useTheme();
  // the ball: home page only. It waits out of sight until the end of the page (see playBall).
  const ball = useRef<HTMLSpanElement>(null);
  const { pathname } = useLocation();
  const onHome = pathname === "/" || pathname === "/home";
  useEffect(() => {
    if (!ball.current || !onHome) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return playBall(ball.current);
  }, [onHome]);
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
        <Link className="site-nav__name" to="/" viewTransition aria-label="Rana Ebrahim, home">
          {/* Rana's own signature, drawn in the text colour (the PNG is only used as a mask) */}
          <span className="site-nav__sig" style={{ "--sig": `url(${asset("/signature.png?v=6")})` } as CSSProperties} />
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
      {onHome && <span ref={ball} className="ball" aria-hidden="true" />}
    </>
  );
}
