export interface Pronouns {
  subjective: string;
  subjectiveCap: string;
  objective: string;
  objectiveCap: string;
  possessive: string;
  possessiveCap: string;
  possessivePronoun: string;
  possessivePronounCap: string;
  reflexive: string;
}

export function getPronouns(gender: string | undefined | null): Pronouns {
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
