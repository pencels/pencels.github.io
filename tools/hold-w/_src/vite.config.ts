import { IndexHtmlTransformContext, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { promises as fs } from "fs";
import { stringify } from "querystring";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  server: {
    host: true,
  },
  build: {
    outDir: "..",
  },
  plugins: [
    react(),
    {
      name: "Cleaning assets folder",
      apply: "build",
      async buildStart() {
        return fs.rm("../assets", {
          recursive: true,
          force: true,
        });
      },
    },
    {
      name: "Add front matter to index.html",
      apply: "build",
      transformIndexHtml(html) {
        return "---\n---\n\n" + html;
      },
    },
  ],
});
