import {
  presentation,
  setPresentation,
  type Presentation,
} from "../ui/presentation";

const OPTIONS: { value: Presentation; label: string }[] = [
  { value: "reading", label: "Reading" },
  { value: "paper", label: "Paper" },
];

export function PresentationToggle() {
  return (
    <div class="presentation-toggle" role="group" aria-label="Presentation">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          class={option.value === presentation.value ? "active" : ""}
          aria-pressed={option.value === presentation.value}
          onClick={() => setPresentation(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
