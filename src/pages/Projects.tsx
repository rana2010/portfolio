import { useEffect } from "react";
import { Dots, Footer, Nav } from "../components/Chrome";
import { WorkList } from "../components/WorkList";

export function Projects() {
  useEffect(() => {
    document.title = "Projects · Rana Ebrahim";
  }, []);

  return (
    <div className="page" id="top">
      <Dots />
      <Nav />
      <main className="projects">
        <h1>
          Selected
          <br />
          work
        </h1>
        <WorkList heading="Case studies" />
      </main>
      <Footer />
    </div>
  );
}
