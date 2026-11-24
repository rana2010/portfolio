import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Chat } from "./pages/Chat";
import { Home } from "./pages/Home";
import { Projects } from "./pages/Projects";
import { CaseStudy } from "./pages/CaseStudy";
import { Echo } from "./pages/Echo";
import { Analyst } from "./pages/Analyst";
import { Handcrafted } from "./pages/Handcrafted";
import { ThemeProvider } from "./components/Chrome";
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

export function App() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
