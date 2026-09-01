import { PROFILES, DEFAULT_PROFILE_ID } from "./config.js";
import { getTemplate } from "./templates/registry.js";
import { announceA11y } from "./utils.js";

let activeProfileId = DEFAULT_PROFILE_ID;
let activeProfile = JSON.parse(JSON.stringify(PROFILES[activeProfileId]));

export function getActiveProfile() {
  return activeProfile;
}

export function setActiveProfile(profileId) {
  if (PROFILES[profileId]) {
    activeProfileId = profileId;
    activeProfile = JSON.parse(JSON.stringify(PROFILES[profileId]));
    renderDocument();
    syncFormInputs();
    announceA11y(`Profile changed to ${activeProfile.label}`);
  }
}

export function renderDocument() {
  const sheet = document.getElementById("document-sheet");
  if (!sheet) return;

  const template = getTemplate("will");
  if (template && typeof template.render === "function") {
    sheet.innerHTML = template.render(activeProfile, {
      highlightVariables: true,
    });
  }
}

export function syncFormInputs() {
  const profileSelect = document.getElementById("select-profile");
  if (profileSelect) profileSelect.value = activeProfileId;

  const toggleBtn = document.getElementById("btn-toggle-profile");
  if (toggleBtn) {
    toggleBtn.textContent = `Profile: ${activeProfile.testator.name}`;
  }

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
  };

  setVal("input-testator-name", activeProfile.testator?.name);
  setVal("input-county", activeProfile.testator?.county);
  setVal("input-state", activeProfile.testator?.state);
  setVal("input-spouse-name", activeProfile.spouse?.name);
  setVal("input-children", activeProfile.children);
  setVal("input-guardian", activeProfile.guardians?.primary);
  setVal("input-guardian-alt", activeProfile.guardians?.alternate);
  setVal("input-pr-primary", activeProfile.personalRepresentatives?.primary);
  setVal("input-pr-alt", activeProfile.personalRepresentatives?.alternate);
  setVal("input-trustee-primary", activeProfile.trustees?.primary);
  setVal("input-trustee-alt", activeProfile.trustees?.alternate);
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
        container.setAttribute("data-zoom", zoomButtons[id]);
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
      const nextId = activeProfileId === "profile-1" ? "profile-2" : "profile-1";
      setActiveProfile(nextId);
    });
  }
}

function initFormListeners() {
  const form = document.getElementById("document-form");
  if (!form) return;

  const updateFromForm = () => {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : "";
    };

    activeProfile.testator.name = getVal("input-testator-name");
    activeProfile.testator.county = getVal("input-county");
    activeProfile.testator.state = getVal("input-state");
    activeProfile.spouse.name = getVal("input-spouse-name");
    activeProfile.children = getVal("input-children");
    activeProfile.guardians.primary = getVal("input-guardian");
    activeProfile.guardians.alternate = getVal("input-guardian-alt");
    activeProfile.personalRepresentatives.primary = getVal("input-pr-primary");
    activeProfile.personalRepresentatives.alternate = getVal("input-pr-alt");
    activeProfile.trustees.primary = getVal("input-trustee-primary");
    activeProfile.trustees.alternate = getVal("input-trustee-alt");

    renderDocument();
  };

  form.addEventListener("input", updateFromForm);
}

function init() {
  initZoom();
  initProfileControls();
  initFormListeners();
  renderDocument();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
