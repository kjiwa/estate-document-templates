// @ts-check
// Loads src/export/standaloneHtml.ts through Vite's SSR module graph (no
// bundling, no extra dependency) so the print spec can exercise the real
// standalone-export code path from a plain Node test process, without a
// browser to `import()` it from.
async function generateStandaloneHtml(plan) {
  const { createServer } = await import("vite");
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    const mod = await server.ssrLoadModule("/src/export/standaloneHtml.ts");
    return mod.generateStandaloneHtml(plan);
  } finally {
    await server.close();
  }
}

module.exports = { generateStandaloneHtml };
