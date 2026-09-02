import {
  getState,
  getActiveProfile,
  getActiveProfileId,
  setActiveProfileId,
  updateField,
  addListItem,
  removeListItem,
  resetProfiles,
  resetActiveProfile,
  toggleHighlightVariables,
  setZoom,
  exportStateAsJson,
  importStateFromJson,
  subscribe,
  loadStateFromLocalStorage,
} from "./state.js";
import { generateStandaloneHtml, generateAttorneyMemo } from "./export.js";
import { getTemplate } from "./templates/registry.js";
import { renderGuidance } from "./guidance.js";
import { analyzeProfile } from "./review.js";
import { announceA11y, escapeHtml, escapeCssString } from "./utils.js";

export function getActiveProfileData() {
  return getActiveProfile();
}

function profileDisplayName(profile) {
  return (
    profile?.testator?.name?.trim() || profile?.label || "Untitled profile"
  );
}

export function setActiveProfile(profileId) {
  setActiveProfileId(profileId);
  const profile = getActiveProfile();
  if (profile) {
    announceA11y(`Profile changed to ${profileDisplayName(profile)}`);
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

function renderReviewPanel() {
  const list = document.getElementById("review-list");
  if (!list) return;

  const profile = getActiveProfile();
  const advisories = profile ? analyzeProfile(profile) : [];

  if (advisories.length === 0) {
    list.innerHTML = `<li class="review-empty">No advisories at this time.</li>`;
    return;
  }

  list.innerHTML = advisories
    .map(
      (advisory) =>
        `<li class="review-item review-${escapeHtml(advisory.severity)}"><strong>${escapeHtml(advisory.title)}.</strong> ${escapeHtml(advisory.message)}</li>`
    )
    .join("");
}

function renderChildrenFields() {
  const profile = getActiveProfile();
  const container = document.getElementById("children-fields");
  if (!profile || !container) return;

  const children = profile.children || [];
  container.innerHTML = children
    .map(
      (child, index) => `
        <div class="repeatable-row">
          <input
            type="text"
            class="form-input"
            data-child-index="${index}"
            value="${escapeHtml(child)}"
            aria-label="Child ${index + 1} name"
          />
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            data-remove-child="${index}"
            aria-label="Remove child ${index + 1}"
          >
            Remove
          </button>
        </div>
      `
    )
    .join("");

  container.querySelectorAll("[data-child-index]").forEach((input) => {
    input.addEventListener("input", (e) => {
      const index = Number(e.target.dataset.childIndex);
      updateField(`children.${index}`, e.target.value);
    });
  });

  container.querySelectorAll("[data-remove-child]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = Number(e.currentTarget.dataset.removeChild);
      removeListItem("children", index);
      renderChildrenFields();
    });
  });
}

function renderProfileIdentity() {
  const activeId = getActiveProfileId();

  const select = document.getElementById("select-profile");
  if (select) {
    select.innerHTML = Object.values(getState().profiles)
      .map(
        (profile) =>
          `<option value="${escapeHtml(profile.id)}">${escapeHtml(profileDisplayName(profile))}</option>`
      )
      .join("");
    select.value = activeId;
  }

  const activeProfileName = document.getElementById("active-profile-name");
  if (activeProfileName) {
    activeProfileName.textContent = profileDisplayName(getActiveProfile());
  }
}

export function syncFormInputs() {
  const profile = getActiveProfile();
  if (!profile) return;

  renderProfileIdentity();

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && el.value !== (val ?? "")) {
      el.value = val ?? "";
    }
  };

  const setChecked = (id, checked) => {
    const el = document.getElementById(id);
    if (el) el.checked = Boolean(checked);
  };

  setVal("input-testator-name", profile.testator?.name);
  setVal("select-testator-gender", profile.testator?.gender);
  setVal("input-county", profile.testator?.county);
  setVal("input-state", profile.testator?.state);
  setVal("input-city", profile.city);

  setVal("input-spouse-name", profile.spouse?.name);
  setVal("select-spouse-gender", profile.spouse?.gender);

  setVal("input-guardian-primary", profile.guardians?.primary);
  setVal("input-guardian-alt", profile.guardians?.alternate);
  setVal("input-conservator-primary", profile.conservators?.primary);
  setVal("input-conservator-alt", profile.conservators?.alternate);

  setVal("input-remains-agent", profile.remains?.agent);
  setVal("input-remains-alt", profile.remains?.alternate);
  setVal("input-remains-preference", profile.remains?.preference);

  setVal("select-spousal-gift", profile.spousalGift);
  setChecked("checkbox-cpa-exists", profile.communityPropertyAgreement?.exists);
  setVal("input-cpa-date", profile.communityPropertyAgreement?.date);

  setVal(
    "input-ultimate-beneficiary-relationship",
    profile.ultimateBeneficiary?.relationship
  );
  setVal("input-ultimate-beneficiary-name", profile.ultimateBeneficiary?.name);
  setVal(
    "select-ultimate-beneficiary-gender",
    profile.ultimateBeneficiary?.gender
  );

  setVal("input-survivorship-days", profile.survivorshipDays);

  setVal("input-pr-primary", profile.personalRepresentatives?.primary);
  setVal("input-pr-alt", profile.personalRepresentatives?.alternate);
  setVal("input-trustee-primary", profile.trustees?.primary);
  setVal("input-trustee-alt", profile.trustees?.alternate);

  setVal("input-witness-0-name", profile.witnesses?.[0]?.name);
  setVal("input-witness-0-address", profile.witnesses?.[0]?.address);
  setVal("input-witness-0-citystatezip", profile.witnesses?.[0]?.cityStateZip);
  setVal("input-witness-1-name", profile.witnesses?.[1]?.name);
  setVal("input-witness-1-address", profile.witnesses?.[1]?.address);
  setVal("input-witness-1-citystatezip", profile.witnesses?.[1]?.cityStateZip);

  setVal("input-notary-name", profile.notary?.name);
  setVal("input-notary-expires", profile.notary?.commissionExpires);

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

  renderChildrenFields();
}

const ZOOM_BUTTON_IDS = ["zoom-75", "zoom-100", "zoom-fit"];
const ZOOM_LEVEL_BY_ID = {
  "zoom-75": "75",
  "zoom-100": "100",
  "zoom-fit": "fit",
};
const ZOOM_ID_BY_LEVEL = { 75: "zoom-75", 100: "zoom-100", fit: "zoom-fit" };
const ZOOM_FACTOR_BY_LEVEL = { 75: 0.75, 100: 1 };

// "Fit" cannot be a hardcoded ratio (a 0.9 that fits nothing): the natural,
// unzoomed sheet width is recovered from its current rendered width divided
// by whatever zoom factor is already applied, then scaled to the container.
function computeFitFactor(container) {
  const sheet = container.querySelector(".paged-sheet");
  if (!sheet) return 1;

  const currentFactor =
    parseFloat(getComputedStyle(container).getPropertyValue("--zoom")) || 1;
  const rect = sheet.getBoundingClientRect();
  const naturalWidth = rect.width / currentFactor;
  const availableWidth = container.clientWidth;
  if (!naturalWidth || !availableWidth) return 1;

  return Math.min(1, availableWidth / naturalWidth);
}

function applyZoomFactor(container, factor) {
  container.style.setProperty("--zoom", factor);
}

function applyStateZoom(container) {
  const level = getState().zoom || "100";
  const factor =
    level === "fit"
      ? computeFitFactor(container)
      : (ZOOM_FACTOR_BY_LEVEL[level] ?? 1);
  applyZoomFactor(container, factor);
}

function initZoom() {
  const container = document.getElementById("sheet-container");
  if (!container) return;

  const setChecked = (activeId) => {
    ZOOM_BUTTON_IDS.forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const isActive = id === activeId;
      btn.setAttribute("aria-checked", isActive ? "true" : "false");
      btn.tabIndex = isActive ? 0 : -1;
    });
  };

  const activate = (id) => {
    const level = ZOOM_LEVEL_BY_ID[id];
    setZoom(level);
    container.setAttribute("data-zoom", level);
    applyStateZoom(container);
    setChecked(id);
    document.getElementById(id)?.focus();
  };

  ZOOM_BUTTON_IDS.forEach((id, index) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener("click", () => activate(id));
    btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const delta = e.key === "ArrowRight" ? 1 : -1;
      const nextIndex =
        (index + delta + ZOOM_BUTTON_IDS.length) % ZOOM_BUTTON_IDS.length;
      activate(ZOOM_BUTTON_IDS[nextIndex]);
    });
  });

  setChecked(ZOOM_ID_BY_LEVEL[getState().zoom] || "zoom-100");
  applyStateZoom(container);

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(() => applyStateZoom(container)).observe(container);
  }
}

function initProfileControls() {
  const profileSelect = document.getElementById("select-profile");
  if (profileSelect) {
    profileSelect.addEventListener("change", (e) => {
      setActiveProfile(e.target.value);
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
  "input-guardian-primary": "guardians.primary",
  "input-guardian-alt": "guardians.alternate",
  "input-conservator-primary": "conservators.primary",
  "input-conservator-alt": "conservators.alternate",
  "input-remains-agent": "remains.agent",
  "input-remains-alt": "remains.alternate",
  "input-remains-preference": "remains.preference",
  "select-spousal-gift": "spousalGift",
  "input-cpa-date": "communityPropertyAgreement.date",
  "input-ultimate-beneficiary-relationship": "ultimateBeneficiary.relationship",
  "input-ultimate-beneficiary-name": "ultimateBeneficiary.name",
  "select-ultimate-beneficiary-gender": "ultimateBeneficiary.gender",
  "input-survivorship-days": "survivorshipDays",
  "input-pr-primary": "personalRepresentatives.primary",
  "input-pr-alt": "personalRepresentatives.alternate",
  "input-trustee-primary": "trustees.primary",
  "input-trustee-alt": "trustees.alternate",
  "input-witness-0-name": "witnesses.0.name",
  "input-witness-0-address": "witnesses.0.address",
  "input-witness-0-citystatezip": "witnesses.0.cityStateZip",
  "input-witness-1-name": "witnesses.1.name",
  "input-witness-1-address": "witnesses.1.address",
  "input-witness-1-citystatezip": "witnesses.1.cityStateZip",
  "input-notary-name": "notary.name",
  "input-notary-expires": "notary.commissionExpires",
  "input-date-day": "executionDate.day",
  "input-date-month": "executionDate.month",
  "input-date-year": "executionDate.year",
};

const CHECKBOX_BINDINGS = {
  "checkbox-cpa-exists": "communityPropertyAgreement.exists",
};

function initFormListeners() {
  Object.entries(FIELD_BINDINGS).forEach(([id, path]) => {
    const el = document.getElementById(id);
    if (!el) return;

    const eventName = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(eventName, (e) => {
      const value =
        el.type === "number" ? Number(e.target.value) : e.target.value;
      updateField(path, value);
    });
  });

  Object.entries(CHECKBOX_BINDINGS).forEach(([id, path]) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("change", (e) => {
      updateField(path, e.target.checked);
    });
  });

  const addChildBtn = document.getElementById("btn-add-child");
  if (addChildBtn) {
    addChildBtn.addEventListener("click", () => {
      addListItem("children", "");
      renderChildrenFields();
    });
  }
}

function initGuidance() {
  document.querySelectorAll("[data-guidance-id]").forEach((el) => {
    el.innerHTML = renderGuidance(el.dataset.guidanceId);
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

function showImportError(message) {
  const el = document.getElementById("import-error");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

function clearImportError() {
  const el = document.getElementById("import-error");
  if (!el) return;
  el.textContent = "";
  el.hidden = true;
}

function safeFileNameFor(profile) {
  return (profile?.testator?.name || "will").toLowerCase().replace(/\s+/g, "-");
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
          clearImportError();
          syncFormInputs();
          announceA11y("Profile JSON data imported successfully");
        } else {
          showImportError(`Import failed: ${result.error}`);
          announceA11y(`Import failed: ${result.error}`);
        }
        importJsonInput.value = "";
      };
      reader.readAsText(file);
    });
  }

  const exportHtmlBtn = document.getElementById("btn-export-html");
  if (exportHtmlBtn) {
    exportHtmlBtn.addEventListener("click", async () => {
      const html = await generateStandaloneHtml("will");
      const profile = getActiveProfile();
      triggerDownload(
        html,
        `last-will-${safeFileNameFor(profile)}.html`,
        "text/html"
      );
      announceA11y("Standalone HTML document exported successfully");
    });
  }

  const exportMemoBtn = document.getElementById("btn-export-memo");
  if (exportMemoBtn) {
    exportMemoBtn.addEventListener("click", () => {
      const profile = getActiveProfile();
      if (!profile) return;
      const memo = generateAttorneyMemo(profile);
      triggerDownload(
        memo,
        `attorney-memo-${safeFileNameFor(profile)}.txt`,
        "text/plain"
      );
      announceA11y("Attorney memo exported successfully");
    });
  }
}

function updatePrintPageRules() {
  const profile = getActiveProfile();
  if (!profile) return;

  const label = `Last Will and Testament — ${profile.testator?.name || ""}`;
  let styleEl = document.getElementById("print-page-rules");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "print-page-rules";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `:root { --print-doc-label: "${escapeCssString(label)}"; }`;
}

function initPrintControls() {
  document
    .getElementById("btn-print")
    ?.addEventListener("click", () => window.print());
  window.addEventListener("beforeprint", updatePrintPageRules);
}

function init() {
  const hadStoredState = loadStateFromLocalStorage();

  if (
    !hadStoredState &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 900px)").matches
  ) {
    setZoom("fit");
  }

  subscribe((currentState, eventType) => {
    renderDocument();
    renderReviewPanel();
    if (eventType === "fieldUpdate") {
      renderProfileIdentity();
    } else {
      syncFormInputs();
    }
  });

  initZoom();
  initProfileControls();
  initFormListeners();
  initDataManagementControls();
  initGuidance();
  initPrintControls();

  syncFormInputs();
  renderDocument();
  renderReviewPanel();
  updatePrintPageRules();

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
