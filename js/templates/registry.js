import { renderWill } from "./will.js";

const templates = new Map();

export function registerTemplate(id, definition) {
  if (!id || typeof id !== "string") {
    throw new Error("Template id must be a non-empty string");
  }
  if (!definition || typeof definition.render !== "function") {
    throw new Error("Template definition must provide a render function");
  }
  templates.set(id, definition);
}

export function getTemplate(id) {
  return templates.get(id) || null;
}

export function listTemplates() {
  return Array.from(templates.values());
}

registerTemplate("will", {
  id: "will",
  name: "Washington State Last Will and Testament",
  version: "1.0.0",
  statute: "RCW 11.12",
  render: renderWill,
});
