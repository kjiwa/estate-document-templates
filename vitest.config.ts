import { defineConfig } from "vitest/config";

// No jsdom/happy-dom: preact-render-to-string renders to strings without a
// DOM, and tests that need one parse HTML directly with linkedom.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
