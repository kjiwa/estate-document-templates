// `Section.guidance` keys `GUIDANCE` (per section, not per field) — content
// only, never rendered into the document body or the standalone export.
import { GUIDANCE } from "../documents/will/guidance";

interface FieldGuidanceProps {
  guidanceId?: string;
}

export function FieldGuidance({ guidanceId }: FieldGuidanceProps) {
  const entry = guidanceId ? GUIDANCE[guidanceId] : undefined;
  if (!entry) return null;

  return (
    <div class="field-guidance">
      <p>{entry.whatItDoes}</p>
      <details>
        <summary>{entry.title} — what this means</summary>
        {entry.options.length > 0 ? (
          <>
            <p>
              <strong>Options:</strong>
            </p>
            <ul>
              {entry.options.map((option) => (
                <li key={option}>{option}</li>
              ))}
            </ul>
          </>
        ) : null}
        <p>
          <strong>Typical:</strong> {entry.typical}
        </p>
        <p>
          <strong>Impact:</strong> {entry.impact}
        </p>
        {entry.statutes.length > 0 ? (
          <p>
            <strong>Statutes:</strong> {entry.statutes.join(", ")}
          </p>
        ) : null}
      </details>
    </div>
  );
}
