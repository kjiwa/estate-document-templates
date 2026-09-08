// `Section.guidance` keys the active document's `DocumentDefinition.guidance`
// (per section, not per field) — content only, never rendered into the
// document body or the standalone export.
import { DOCUMENTS } from "../documents/registry";
import { activeDocumentId } from "../store/index";

interface FieldGuidanceProps {
  guidanceId?: string | readonly string[];
}

export function FieldGuidance({ guidanceId }: FieldGuidanceProps) {
  const document = DOCUMENTS.find((d) => d.id === activeDocumentId.value);
  const ids = guidanceId
    ? Array.isArray(guidanceId)
      ? guidanceId
      : [guidanceId as string]
    : [];
  const entries = ids
    .map((id) => document?.guidance[id])
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  if (entries.length === 0) return null;

  return (
    <>
      {entries.map((entry) => (
        <div class="field-guidance" key={entry.title}>
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
      ))}
    </>
  );
}
