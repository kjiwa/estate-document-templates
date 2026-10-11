import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rolldownOptions: {
      input: { site: "index.html", app: "app/index.html" },
    },
  },
  plugins: [preact()],
  preview: {
    host: "127.0.0.1",
    port: 8080,
  },
});
