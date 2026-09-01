import { PROFILES, DEFAULT_PROFILE_ID } from "./config.js";
import { getTemplate } from "./templates/registry.js";

const STORAGE_KEY = "estate_templates_state_v1";

let state = {
  activeProfileId: DEFAULT_PROFILE_ID,
  profiles: JSON.parse(JSON.stringify(PROFILES)),
  highlightVariables: true,
  zoom: "100",
};

const listeners = new Set();

export function getState() {
  return state;
}

export function getActiveProfile() {
  return state.profiles[state.activeProfileId];
}

export function getActiveProfileId() {
  return state.activeProfileId;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(eventType, payload) {
  listeners.forEach((listener) => {
    try {
      listener(state, eventType, payload);
    } catch (err) {
      console.error("State listener error:", err);
    }
  });
}

export function saveStateToLocalStorage() {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const data = {
      activeProfileId: state.activeProfileId,
      profiles: state.profiles,
      highlightVariables: state.highlightVariables,
      zoom: state.zoom,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("Failed to persist state to localStorage:", err);
  }
}

export function loadStateFromLocalStorage() {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.profiles && parsed.activeProfileId) {
      state.activeProfileId =
        parsed.activeProfileId in parsed.profiles
          ? parsed.activeProfileId
          : DEFAULT_PROFILE_ID;
      state.profiles = parsed.profiles;
      if (typeof parsed.highlightVariables === "boolean") {
        state.highlightVariables = parsed.highlightVariables;
      }
      if (parsed.zoom) {
        state.zoom = parsed.zoom;
      }
      return true;
    }
  } catch (err) {
    console.warn("Failed to load state from localStorage:", err);
  }
  return false;
}

export function setActiveProfileId(profileId) {
  if (state.profiles[profileId]) {
    state.activeProfileId = profileId;
    saveStateToLocalStorage();
    notify("profileChange", { activeProfileId: profileId });
  }
}

export function updateField(path, value) {
  const active = getActiveProfile();
  if (!active) return;

  const parts = path.split(".");
  let current = active;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== "object") {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;

  saveStateToLocalStorage();
  notify("fieldUpdate", { path, value });
}

export function updateActiveProfile(updates = {}) {
  const active = getActiveProfile();
  if (!active) return;

  Object.assign(active, updates);
  saveStateToLocalStorage();
  notify("profileUpdate", { profile: active });
}

export function resetProfiles() {
  state.profiles = JSON.parse(JSON.stringify(PROFILES));
  saveStateToLocalStorage();
  notify("reset", { activeProfileId: state.activeProfileId });
}

export function resetActiveProfile() {
  if (PROFILES[state.activeProfileId]) {
    state.profiles[state.activeProfileId] = JSON.parse(
      JSON.stringify(PROFILES[state.activeProfileId]),
    );
    saveStateToLocalStorage();
    notify("resetActive", { activeProfileId: state.activeProfileId });
  }
}

export function toggleHighlightVariables() {
  state.highlightVariables = !state.highlightVariables;
  saveStateToLocalStorage();
  notify("highlightToggle", { highlightVariables: state.highlightVariables });
  return state.highlightVariables;
}

export function setHighlightVariables(enabled) {
  state.highlightVariables = Boolean(enabled);
  saveStateToLocalStorage();
  notify("highlightToggle", { highlightVariables: state.highlightVariables });
}

export function setZoom(zoomLevel) {
  state.zoom = zoomLevel;
  saveStateToLocalStorage();
  notify("zoomChange", { zoom: zoomLevel });
}

export function exportStateAsJson() {
  return JSON.stringify(state.profiles, null, 2);
}

export function importStateFromJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid JSON structure");
    }

    if (parsed.profile-1 || parsed.profile-2) {
      state.profiles = {
        ...JSON.parse(JSON.stringify(PROFILES)),
        ...parsed,
      };
    } else if (parsed.testator && parsed.testator.name) {
      state.profiles[state.activeProfileId] = parsed;
    } else {
      throw new Error("JSON missing profile schema structure");
    }

    saveStateToLocalStorage();
    notify("import", { activeProfileId: state.activeProfileId });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function generateStandaloneHtml(templateId = "will") {
  const template = getTemplate(templateId);
  const profile = getActiveProfile();
  if (!template || !profile) return "";

  const renderedBody = template.render(profile, { highlightVariables: false });
  const title = `Last Will and Testament - ${profile.testator?.name || "Document"}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @page { size: letter portrait; margin: 0.85in 0.8in 0.85in 0.8in; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Times New Roman", Times, Georgia, serif; font-size: 11pt; line-height: 1.6; color: #111827; background-color: #f1f5f9; padding: 2rem 1rem; }
    .paged-sheet { max-width: 8.5in; margin: 0 auto; background: #ffffff; padding: 0.85in 0.8in; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .doc-title { font-size: 14pt; font-weight: bold; text-align: center; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.5rem; }
    .doc-subtitle { font-size: 12pt; font-weight: bold; text-align: center; margin-bottom: 1.5rem; }
    .doc-preamble, .clause { text-align: justify; margin-bottom: 1rem; orphans: 3; widows: 3; }
    .article-header { font-size: 12pt; font-weight: bold; text-align: center; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1.5rem; margin-bottom: 0.75rem; break-after: avoid; }
    .powers-list { margin-left: 2rem; margin-bottom: 1rem; }
    .powers-list li { margin-bottom: 0.75rem; text-align: justify; }
    .testimonium, .sig-block-principal, .witness-block, .notary-block { break-inside: avoid; page-break-inside: avoid; }
    .testimonium { margin-top: 1.5rem; margin-bottom: 1rem; text-align: justify; }
    .sig-block-principal { margin-top: 1.5rem; margin-bottom: 2rem; display: flex; justify-content: flex-end; }
    .sig-lines-principal { width: 50%; }
    .sig-line { border-top: 1px solid #111827; margin-top: 3rem; padding-top: 0.25rem; font-size: 10.5pt; }
    .sig-caption { font-size: 10pt; color: #374151; }
    .witness-block { margin-top: 1.5rem; border-top: 1px solid #111827; padding-top: 1.5rem; }
    .witness-declaration { text-align: justify; margin-bottom: 1.5rem; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
    .sig-column { display: flex; flex-direction: column; gap: 0.75rem; }
    .sig-field-line { border-bottom: 1px solid #111827; height: 1.5rem; }
    .sig-field-label { font-size: 9pt; color: #4b5563; }
    .notary-block { margin-top: 2rem; border: 1px solid #111827; padding: 1rem; }
    .notary-heading { font-weight: bold; text-align: center; margin-bottom: 0.75rem; }
    .notary-venue { font-weight: bold; margin-bottom: 0.75rem; }
    .notary-body { text-align: justify; margin-bottom: 1rem; }
    .notary-sig-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem; }
    .notary-seal-box { border: 1px dashed #111827; height: 120px; display: flex; align-items: center; justify-content: center; font-size: 9pt; color: #4b5563; text-transform: uppercase; }
    @media print {
      body { background: transparent; padding: 0; }
      .paged-sheet { box-shadow: none; padding: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <article class="paged-sheet">
    ${renderedBody}
  </article>
</body>
</html>`;
}
