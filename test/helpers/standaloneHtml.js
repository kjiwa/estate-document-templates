// @ts-check
// Loads src/export/standaloneHtml.ts through Vite's SSR module graph (no
// bundling, no extra dependency) so the print spec can exercise the real
// standalone-export code path from a plain Node test process, without a
// browser to `import()` it from.
async function generateStandaloneHtml(plan, documentId = "will") {
  const { createServer } = await import("vite");
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    const [exportMod, registryMod] = await Promise.all([
      server.ssrLoadModule("/src/export/standaloneHtml.ts"),
      server.ssrLoadModule("/src/documents/registry.ts"),
    ]);
    const document = registryMod.DOCUMENTS.find((d) => d.id === documentId);
    return exportMod.generateStandaloneHtml(plan, document);
  } finally {
    await server.close();
  }
}

module.exports = { generateStandaloneHtml };
