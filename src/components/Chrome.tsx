import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
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
      <circle cx="9" cy="9" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M9 1.4v1.8M9 14.8v1.8M1.4 9h1.8M14.8 9h1.8M3.4 3.4l1.3 1.3M13.3 13.3l1.3 1.3M14.6 3.4l-1.3 1.3M4.7 13.3l-1.3 1.3" />
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

  return (
    <header className="nav">
      <div className="nav-bar">
        <div className="nav-pills">
          <NavLink className="pill" to="/projects">
            Projects
          </NavLink>
          <NavLink className="pill" to="/handcrafted">
            Handcrafted
          </NavLink>
        </div>
        <Link className="wordmark" to="/home">
          Rana
        </Link>
        <button
          className="theme-toggle"
          type="button"
          onClick={toggle}
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
        >
          {theme === "light" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}

export function Footer({ giant = false }: { giant?: boolean }) {
  return (
    <footer className={giant ? "footer footer-giant" : "footer"}>
      <div className="footer-row">
        <nav className="footer-links" aria-label="Contact">
          <span>LinkedIn</span>
          <span>Behance</span>
          <span>Resume</span>
        </nav>
        <a className="footer-mail" href="mailto:ranaebrahim@aucegypt.edu">
          ranaebrahim@aucegypt.edu
        </a>
      </div>
      {giant ? <p className="footer-name">Rana Ebrahim</p> : null}
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
      gradientFrom={light ? "#b9b8b1" : "#d8d7d1"}
      gradientTo={light ? "#8f8e86" : "#f4f4f2"}
      gradientAngle={180}
      cursorRadius={110}
      bulgeStrength={0.36}
      twist={0}
      glowColor={light ? "#121211" : "#f4f4f2"}
      glowRadius={64}
      glowIntensity={0.16}
      baseOpacity={light ? 0.26 : 0.22}
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
        {src ? <img src={src} alt={alt} /> : null}
      </div>
    </div>
  );
}
