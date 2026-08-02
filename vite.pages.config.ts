import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repositoryName = "august-care-prototype";

export default defineConfig({
  root: "github-pages",
  base: `/${repositoryName}/`,
  publicDir: "../public",
  define: {
    "process.env.NEXT_PUBLIC_BASE_PATH": JSON.stringify(`/${repositoryName}`),
  },
  plugins: [react()],
  build: {
    outDir: "../github-pages-dist",
    emptyOutDir: true,
  },
});
