import {
  BLANK_PROFILE,
  INITIAL_PROFILES,
  DEFAULT_PROFILE_ID,
  SCHEMA_VERSION,
} from "./config.js";

const STORAGE_KEY = "estate_templates_state_v1";

let state = {
  activeProfileId: DEFAULT_PROFILE_ID,
  profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES)),
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

function getPathValue(obj, path) {
  return path
    .split(".")
    .reduce(
      (current, part) => (current == null ? undefined : current[part]),
      obj
    );
}

// Merges `source` onto a fresh clone of `target` field by field, so a stored
// draft missing newer fields falls back to the shipped default rather than
// leaving them undefined. Arrays are replaced wholesale (no per-element
// merge) since they represent ordered lists (children, witnesses), not maps.
function deepMerge(target, source) {
  if (Array.isArray(source)) {
    return source.slice();
  }
  if (source && typeof source === "object") {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      const targetValue =
        target && typeof target === "object" ? target[key] : undefined;
      if (
        source[key] &&
        typeof source[key] === "object" &&
        targetValue &&
        typeof targetValue === "object"
      ) {
        result[key] = deepMerge(targetValue, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  return source;
}

function normalizeProfile(profileId, stored) {
  const merged = deepMerge(BLANK_PROFILE, stored || {});
  merged.id = profileId; // the key is the identity; a stale stored id is not
  return merged;
}

export function saveStateToLocalStorage() {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const data = {
      schemaVersion: SCHEMA_VERSION,
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

// Merges stored profiles over a fresh clone of BLANK_PROFILE, keyed by
// whatever profile ids are actually stored (an open set: imported ids are
// not shipped ids). This is what makes adding a field to config.js safe: a
// v1 draft missing e.g. `witnesses` gets the shipped default rather than an
// undefined that renders as an invented fallback.
export function loadStateFromLocalStorage() {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.profiles) {
      return false;
    }

    const storedIds = Object.keys(parsed.profiles);
    if (storedIds.length === 0) return false;

    const mergedProfiles = {};
    for (const profileId of storedIds) {
      mergedProfiles[profileId] = normalizeProfile(
        profileId,
        parsed.profiles[profileId]
      );
    }
    state.profiles = mergedProfiles;

    state.activeProfileId =
      parsed.activeProfileId in mergedProfiles
        ? parsed.activeProfileId
        : storedIds[0];

    if (typeof parsed.highlightVariables === "boolean") {
      state.highlightVariables = parsed.highlightVariables;
    }
    if (parsed.zoom) {
      state.zoom = parsed.zoom;
    }
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      console.info(
        `Migrated stored profiles from schema v${parsed.schemaVersion ?? 1} to v${SCHEMA_VERSION}.`
      );
    }
    return true;
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

export function addListItem(path, defaultItem) {
  const active = getActiveProfile();
  if (!active) return;

  const list = getPathValue(active, path);
  if (!Array.isArray(list)) return;

  list.push(defaultItem);
  saveStateToLocalStorage();
  notify("listChange", { path });
}

export function removeListItem(path, index) {
  const active = getActiveProfile();
  if (!active) return;

  const list = getPathValue(active, path);
  if (!Array.isArray(list)) return;

  list.splice(index, 1);
  saveStateToLocalStorage();
  notify("listChange", { path });
}

export function updateActiveProfile(updates = {}) {
  const active = getActiveProfile();
  if (!active) return;

  Object.assign(active, updates);
  saveStateToLocalStorage();
  notify("profileUpdate", { profile: active });
}

export function resetProfiles() {
  state.profiles = JSON.parse(JSON.stringify(INITIAL_PROFILES));
  if (!state.profiles[state.activeProfileId]) {
    state.activeProfileId = DEFAULT_PROFILE_ID;
  }
  saveStateToLocalStorage();
  notify("reset", { activeProfileId: state.activeProfileId });
}

export function resetActiveProfile() {
  const active = state.profiles[state.activeProfileId];
  if (active) {
    state.profiles[state.activeProfileId] = {
      id: active.id,
      label: active.label,
      ...JSON.parse(JSON.stringify(BLANK_PROFILE)),
    };
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

// Validates shape (each entry must carry testator.name, the shape produced
// by exportStateAsJson) rather than sniffing hardcoded profile ids.
// Unrecognized ids are accepted: import is how a profile id beyond the two
// shipped ones enters state, since there is no profile-create UI.
export function importStateFromJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        success: false,
        error: "Invalid JSON: expected an object of profiles.",
      };
    }

    const mergedProfiles = { ...state.profiles };
    let importedCount = 0;

    for (const [profileId, profile] of Object.entries(parsed)) {
      if (!profile || typeof profile !== "object" || !profile.testator?.name) {
        return {
          success: false,
          error: `Profile "${profileId}" is missing a required testator.name field.`,
        };
      }
      mergedProfiles[profileId] = normalizeProfile(profileId, profile);
      importedCount++;
    }

    if (importedCount === 0) {
      return {
        success: false,
        error: "JSON must contain at least one profile keyed by profile id.",
      };
    }

    state.profiles = mergedProfiles;
    saveStateToLocalStorage();
    notify("import", { activeProfileId: state.activeProfileId });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
