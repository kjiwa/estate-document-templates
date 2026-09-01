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
      spouseTitle: "Wife",
    };
  }
  if (g === "nonbinary" || g === "nb" || g === "they") {
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
      spouseTitle: "Spouse",
    };
  }
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
    spouseTitle: "Husband",
  };
}

export function wrapVar(value, highlight = true) {
  const escaped = escapeHtml(value);
  if (highlight) {
    return `<mark class="dynamic-var">${escaped}</mark>`;
  }
  return escaped;
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
