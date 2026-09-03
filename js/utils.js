export function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getPronouns(gender) {
  const g = String(gender || "")
    .toLowerCase()
    .trim();
  if (g === "female" || g === "f" || g === "woman" || g === "she") {
    return {
      subjective: "she",
      subjectiveCap: "She",
      objective: "her",
      objectiveCap: "Her",
      possessive: "her",
      possessiveCap: "Her",
      possessivePronoun: "hers",
      possessivePronounCap: "Hers",
      reflexive: "herself",
    };
  }
  if (g === "male" || g === "m" || g === "man" || g === "he") {
    return {
      subjective: "he",
      subjectiveCap: "He",
      objective: "him",
      objectiveCap: "Him",
      possessive: "his",
      possessiveCap: "His",
      possessivePronoun: "his",
      possessivePronounCap: "His",
      reflexive: "himself",
    };
  }
  return {
    subjective: "they",
    subjectiveCap: "They",
    objective: "them",
    objectiveCap: "Them",
    possessive: "their",
    possessiveCap: "Their",
    possessivePronoun: "theirs",
    possessivePronounCap: "Theirs",
    reflexive: "themselves",
  };
}

export function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function wrapVar(value, highlight = true) {
  const escaped = escapeHtml(value);
  if (highlight) {
    return `<mark class="dynamic-var">${escaped}</mark>`;
  }
  return escaped;
}

export function fillIn(value, chars = 10, highlight = true) {
  if (value === null || value === undefined || value === "") {
    return `<span class="fill-in" style="width: ${chars}ch"></span>`;
  }
  return wrapVar(value, highlight);
}

export function escapeCssString(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

export function announceA11y(message) {
  if (typeof document === "undefined") return;
  const region = document.getElementById("a11y-status");
  if (region) {
    region.textContent = "";
    setTimeout(() => {
      region.textContent = message;
    }, 50);
  }
}
