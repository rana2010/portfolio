import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

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
          const next: Theme = theme === "light" ? "dark" : "light";
          const root = document.documentElement;
          const apply = () => {
            flushSync(() => setTheme(next));
            root.dataset.theme = next;
          };
          const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
          if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            root.classList.add("vt-theme");
            doc.startViewTransition(apply).finished.finally(() => root.classList.remove("vt-theme"));
          } else {
            apply();
          }
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}



export function SunIcon() {
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

export function MoonIcon() {
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
