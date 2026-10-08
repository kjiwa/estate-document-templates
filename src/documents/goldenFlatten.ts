// Shared by the golden tests: reduces rendered markup to its whitespace-
// collapsed [tag, class, text] sequence, since raw HTML whitespace differs
// between template literals and JSX by construction.

export function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// Block-level elements always create a visual gap in a rendered document,
// whether or not the source markup placed a literal whitespace character at
// that tag boundary. Inline elements never do, so their adjacency is left
// exactly as authored: `<strong>Name</strong>, Testator` stays glued.
const BLOCK_TAGS = new Set([
  "div",
  "p",
  "h1",
  "h2",
  "h3",
  "ol",
  "ul",
  "li",
  "details",
  "summary",
  "blockquote",
]);

export function extractText(node: Node): string {
  if (node.nodeType !== 1 /* ELEMENT_NODE */) return node.textContent || "";
  const el = node as Element;
  const inner = Array.from(el.childNodes)
    .map((child) => extractText(child))
    .join("");
  return BLOCK_TAGS.has(el.tagName.toLowerCase()) ? ` ${inner} ` : inner;
}

export function flatten(root: Element): [string, string, string][] {
  const result: [string, string, string][] = [];
  function walk(node: Element) {
    result.push([
      node.tagName.toLowerCase(),
      node.getAttribute("class") || "",
      collapse(extractText(node)),
    ]);
    for (const child of Array.from(node.children)) {
      walk(child as Element);
    }
  }
  for (const child of Array.from(root.children)) {
    walk(child as Element);
  }
  return result;
}
