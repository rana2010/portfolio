import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./styles.css";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

const stored = localStorage.getItem("theme");
if (stored === "dark" || stored === "light") {
  document.documentElement.dataset.theme = stored;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
