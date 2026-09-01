import {
  getState,
  getActiveProfile,
  getActiveProfileId,
  setActiveProfileId,
  updateField,
  resetProfiles,
  resetActiveProfile,
  toggleHighlightVariables,
  setZoom,
  exportStateAsJson,
  importStateFromJson,
  generateStandaloneHtml,
  subscribe,
  loadStateFromLocalStorage,
} from "./state.js";
import { getTemplate } from "./templates/registry.js";
import { announceA11y } from "./utils.js";

export function getActiveProfileData() {
  return getActiveProfile();
}

export function setActiveProfile(profileId) {
  setActiveProfileId(profileId);
  const profile = getActiveProfile();
  if (profile) {
    announceA11y(
      `Profile changed to ${profile.label || profile.testator?.name}`
    );
  }
}

export function renderDocument() {
  const sheet = document.getElementById("document-sheet");
  if (!sheet) return;

  const state = getState();
  const profile = getActiveProfile();
  if (!profile) return;

  const template = getTemplate("will");
  if (template && typeof template.render === "function") {
    sheet.innerHTML = template.render(profile, {
      highlightVariables: state.highlightVariables,
    });
    sheet.setAttribute(
      "data-highlights",
      state.highlightVariables ? "true" : "false"
    );
  }
}

export function syncFormInputs() {
  const profile = getActiveProfile();
  if (!profile) return;

  const activeId = getActiveProfileId();

  const profileSelect = document.getElementById("select-profile");
  if (profileSelect) profileSelect.value = activeId;

  const toggleBtn = document.getElementById("btn-toggle-profile");
  if (toggleBtn) {
    toggleBtn.textContent = `Profile: ${profile.testator?.name || "Active"}`;
    toggleBtn.setAttribute(
      "aria-pressed",
      activeId === "profile-2" ? "true" : "false"
    );
  }

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && el.value !== (val || "")) {
      el.value = val || "";
    }
  };

  setVal("input-testator-name", profile.testator?.name);
  setVal("select-testator-gender", profile.testator?.gender);
  setVal("input-county", profile.testator?.county);
  setVal("input-state", profile.testator?.state);
  setVal("input-city", profile.city);

  setVal("input-spouse-name", profile.spouse?.name);
  setVal("select-spouse-gender", profile.spouse?.gender);
  setVal("input-children", profile.children);
  setVal("input-guardian", profile.guardians?.primary);
  setVal("input-guardian-alt", profile.guardians?.alternate);

  setVal("input-tertiary-beneficiary", profile.tertiaryBeneficiary);

  setVal("input-pr-primary", profile.personalRepresentatives?.primary);
  setVal("input-pr-alt", profile.personalRepresentatives?.alternate);
  setVal("input-trustee-primary", profile.trustees?.primary);
  setVal("input-trustee-alt", profile.trustees?.alternate);

  setVal("input-date-day", profile.executionDate?.day);
  setVal("input-date-month", profile.executionDate?.month);
  setVal("input-date-year", profile.executionDate?.year);

  const highlightBtn = document.getElementById("btn-toggle-highlights");
  if (highlightBtn) {
    const state = getState();
    highlightBtn.textContent = state.highlightVariables
      ? "Highlights: ON"
      : "Highlights: OFF";
    highlightBtn.setAttribute(
      "aria-pressed",
      state.highlightVariables ? "true" : "false"
    );
  }
}

function initZoom() {
  const container = document.getElementById("sheet-container");
  if (!container) return;

  const zoomButtons = {
    "zoom-75": "75",
    "zoom-100": "100",
    "zoom-fit": "fit",
  };

  Object.keys(zoomButtons).forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        const level = zoomButtons[id];
        setZoom(level);
        container.setAttribute("data-zoom", level);
      });
    }
  });
}

function initProfileControls() {
  const profileSelect = document.getElementById("select-profile");
  if (profileSelect) {
    profileSelect.addEventListener("change", (e) => {
      setActiveProfile(e.target.value);
    });
  }

  const toggleBtn = document.getElementById("btn-toggle-profile");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const activeId = getActiveProfileId();
      const nextId = activeId === "profile-1" ? "profile-2" : "profile-1";
      setActiveProfile(nextId);
    });
  }

  const highlightBtn = document.getElementById("btn-toggle-highlights");
  if (highlightBtn) {
    highlightBtn.addEventListener("click", () => {
      const isHighlighted = toggleHighlightVariables();
      highlightBtn.textContent = isHighlighted
        ? "Highlights: ON"
        : "Highlights: OFF";
      highlightBtn.setAttribute(
        "aria-pressed",
        isHighlighted ? "true" : "false"
      );
      announceA11y(`Dynamic highlights turned ${isHighlighted ? "on" : "off"}`);
    });
  }
}

const FIELD_BINDINGS = {
  "input-testator-name": "testator.name",
  "select-testator-gender": "testator.gender",
  "input-county": "testator.county",
  "input-state": "testator.state",
  "input-city": "city",
  "input-spouse-name": "spouse.name",
  "select-spouse-gender": "spouse.gender",
  "input-children": "children",
  "input-guardian": "guardians.primary",
  "input-guardian-alt": "guardians.alternate",
  "input-tertiary-beneficiary": "tertiaryBeneficiary",
  "input-pr-primary": "personalRepresentatives.primary",
  "input-pr-alt": "personalRepresentatives.alternate",
  "input-trustee-primary": "trustees.primary",
  "input-trustee-alt": "trustees.alternate",
  "input-date-day": "executionDate.day",
  "input-date-month": "executionDate.month",
  "input-date-year": "executionDate.year",
};

function initFormListeners() {
  Object.entries(FIELD_BINDINGS).forEach(([id, path]) => {
    const el = document.getElementById(id);
    if (el) {
      const eventName = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(eventName, (e) => {
        updateField(path, e.target.value);
      });
    }
  });
}

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function initDataManagementControls() {
  const resetProfileBtn = document.getElementById("btn-reset-profile");
  if (resetProfileBtn) {
    resetProfileBtn.addEventListener("click", () => {
      resetActiveProfile();
      syncFormInputs();
      announceA11y("Active profile reset to default values");
    });
  }

  const resetAllBtn = document.getElementById("btn-reset-all");
  if (resetAllBtn) {
    resetAllBtn.addEventListener("click", () => {
      resetProfiles();
      syncFormInputs();
      announceA11y("All profiles reset to default values");
    });
  }

  const exportJsonBtn = document.getElementById("btn-export-json");
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener("click", () => {
      const json = exportStateAsJson();
      triggerDownload(json, "estate-profiles.json", "application/json");
      announceA11y("Profile JSON data exported successfully");
    });
  }

  const importJsonBtn = document.getElementById("btn-import-json");
  const importJsonInput = document.getElementById("input-import-json");
  if (importJsonBtn && importJsonInput) {
    importJsonBtn.addEventListener("click", () => {
      importJsonInput.click();
    });

    importJsonInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const text = loadEvt.target.result;
        const result = importStateFromJson(text);
        if (result.success) {
          syncFormInputs();
          announceA11y("Profile JSON data imported successfully");
        } else {
          announceA11y(`Import failed: ${result.error}`);
          alert(`Import failed: ${result.error}`);
        }
        importJsonInput.value = "";
      };
      reader.readAsText(file);
    });
  }

  const exportHtmlBtn = document.getElementById("btn-export-html");
  if (exportHtmlBtn) {
    exportHtmlBtn.addEventListener("click", () => {
      const html = generateStandaloneHtml("will");
      const profile = getActiveProfile();
      const safeName = (profile?.testator?.name || "will")
        .toLowerCase()
        .replace(/\s+/g, "-");
      triggerDownload(html, `last-will-${safeName}.html`, "text/html");
      announceA11y("Standalone HTML document exported successfully");
    });
  }
}

function init() {
  loadStateFromLocalStorage();

  subscribe((currentState, eventType) => {
    renderDocument();
    if (eventType !== "fieldUpdate") {
      syncFormInputs();
    }
  });

  initZoom();
  initProfileControls();
  initFormListeners();
  initDataManagementControls();

  syncFormInputs();
  renderDocument();

  const container = document.getElementById("sheet-container");
  if (container) {
    container.setAttribute("data-zoom", getState().zoom || "100");
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
