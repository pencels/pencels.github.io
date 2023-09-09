import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { rm } from "fs/promises";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    outDir: "..",
  },
  plugins: [
    react(),
    {
      name: "Cleaning assets folder",
      async buildStart() {
        return rm("../assets", {
          recursive: true,
          force: true,
        });
      },
    },
  ],
});
