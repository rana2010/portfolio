import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { asset } from "../asset";
import { DotField } from "./DotField";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle() {
          setTheme((current) => (current === "light" ? "dark" : "light"));
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <g fill="currentColor">
        <circle cx="9" cy="9" r="3.35" />
        <rect x="8.2" y="0.7" width="1.6" height="2.5" rx="0.8" />
        <rect x="8.2" y="14.8" width="1.6" height="2.5" rx="0.8" />
        <rect x="0.7" y="8.2" width="2.5" height="1.6" rx="0.8" />
        <rect x="14.8" y="8.2" width="2.5" height="1.6" rx="0.8" />
        <rect x="3.15" y="2.05" width="1.6" height="2.5" rx="0.8" transform="rotate(-45 3.95 3.3)" />
        <rect x="13.25" y="2.05" width="1.6" height="2.5" rx="0.8" transform="rotate(45 14.05 3.3)" />
        <rect x="3.15" y="13.45" width="1.6" height="2.5" rx="0.8" transform="rotate(45 3.95 14.7)" />
        <rect x="13.25" y="13.45" width="1.6" height="2.5" rx="0.8" transform="rotate(-45 14.05 14.7)" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.2 1.6a7 7 0 1 0 6.2 9.4 5.6 5.6 0 0 1-6.2-9.4Z"
      />
    </svg>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("ThemeProvider is missing");
  return value;
}

export function Nav() {
  const { theme, toggle } = useTheme();
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
    <header className={scrolled ? "nav scrolled" : "nav"}>
      <div className="nav-glass" aria-hidden="true" />
      <div className="nav-bar">
        <NavLink className="pill" to="/projects">
          Projects
        </NavLink>
        <Link className="wordmark" to="/home">
          Rana
        </Link>
        <NavLink className="pill" to="/handcrafted">
          Handcrafted
        </NavLink>
      </div>
      <button
        className="theme-toggle"
        type="button"
        onClick={toggle}
        aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      >
        {theme === "light" ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
    <Link className="chat-mark" to="/" aria-label="Talk to Rana">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="10" r="6" fill="currentColor" />
        <path fill="currentColor" d="M8.1 14.7 5.4 19.6 12.2 15.5Z" />
      </svg>
    </Link>
    </>
  );
}

export function Footer({ giant = false }: { giant?: boolean }) {
  return (
    <footer className={giant ? "footer footer-giant" : "footer"}>
      <div className="footer-line">
        <p className="footer-name">Rana</p>
        <div className="footer-links">
          <div>
            <p className="footer-label">Say hi!</p>
            <a href="mailto:ranaebrahim@aucegypt.edu">ranaebrahim@aucegypt.edu</a>
          </div>
          <div>
            <p className="footer-label">Let’s connect</p>
            <a href="https://www.linkedin.com/in/rana-ebrahim-875614175/" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Dots() {
  const { theme } = useTheme();
  const light = theme !== "dark";

  return (
    <DotField
      className="dots"
      dotRadius={1.1}
      dotSpacing={26}
      pattern="grid"
      gradientFrom={light ? "#8f8e86" : "#d8d7d1"}
      gradientTo={light ? "#6d6c66" : "#f4f4f2"}
      gradientAngle={180}
      cursorRadius={110}
      bulgeStrength={0.36}
      twist={0}
      glowColor={light ? "#121211" : "#f4f4f2"}
      glowRadius={64}
      glowIntensity={0.16}
      baseOpacity={light ? 0.38 : 0.22}
      waveAmplitude={0}
      sparkle={false}
      speed={0}
      interactive
      holdToZoom={false}
      intro={false}
      lightMode={light}
    />
  );
}

export function BrowserFrame({
  label,
  tall = false,
  src,
  alt = "",
}: {
  label: string;
  tall?: boolean;
  src?: string;
  alt?: string;
}) {
  return (
    <div className={tall ? "browser browser-tall" : "browser"}>
      <div className="browser-bar">
        <span className="traffic" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="browser-label">{label}</span>
      </div>
      <div className={src ? "browser-view has-shot" : "browser-view"}>
        {src ? <img src={asset(src)} alt={alt} /> : null}
      </div>
    </div>
  );
}
