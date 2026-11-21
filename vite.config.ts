import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  base: pages ? "/portfolio/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
    host: "127.0.0.1",
  },
});
