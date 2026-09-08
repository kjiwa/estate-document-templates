// One `<label for>`-bound control per `FieldSpec["kind"]`. `date` stays a
// plain text input this phase — the execution date's migration to a real
// date picker is Phase 4d's.
import { usePlan } from "../documents/shared/PlanContext";
import { getPath } from "../model/paths";
import { setField } from "../store/index";
import type { LeafFieldSpec } from "./registry";

interface FieldProps {
  field: LeafFieldSpec;
}

export function fieldId(path: string): string {
  return `field-${path.replace(/\./g, "-")}`;
}

export function Field({ field }: FieldProps) {
  const plan = usePlan();
  const id = fieldId(field.path);
  const value = getPath(plan, field.path);

  switch (field.kind) {
    case "text":
      return (
        <div class="field">
          <label for={id}>{field.label}</label>
          <input
            id={id}
            type="text"
            value={typeof value === "string" ? value : ""}
            onInput={(event) =>
              setField(field.path, (event.target as HTMLInputElement).value)
            }
          />
          {field.hint ? <span class="field-hint">{field.hint}</span> : null}
        </div>
      );

    case "number":
      return (
        <div class="field">
          <label for={id}>{field.label}</label>
          <input
            id={id}
            type="number"
            min={field.min}
            value={typeof value === "number" ? value : ""}
            onInput={(event) =>
              setField(
                field.path,
                Number((event.target as HTMLInputElement).value)
              )
            }
          />
        </div>
      );

    case "date":
      return (
        <div class="field">
          <label for={id}>{field.label}</label>
          <input
            id={id}
            type="text"
            value={typeof value === "string" ? value : ""}
            onInput={(event) =>
              setField(field.path, (event.target as HTMLInputElement).value)
            }
          />
        </div>
      );

    case "select":
      return (
        <div class="field">
          <label for={id}>{field.label}</label>
          <select
            id={id}
            value={typeof value === "string" ? value : ""}
            onChange={(event) =>
              setField(field.path, (event.target as HTMLSelectElement).value)
            }
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "checkbox":
      return (
        <div class="field">
          <label for={id}>
            <input
              id={id}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(event) =>
                setField(field.path, (event.target as HTMLInputElement).checked)
              }
            />
            {" " + field.label}
          </label>
        </div>
      );

    case "list": {
      const items = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div class="field">
          <label>{field.label}</label>
          {items.map((item, i) => (
            <div class="field-list-row" key={i}>
              <input
                type="text"
                aria-label={`${field.label} ${i + 1}`}
                value={item}
                onInput={(event) => {
                  const next = items.slice();
                  next[i] = (event.target as HTMLInputElement).value;
                  setField(field.path, next);
                }}
              />
              <button
                type="button"
                class="btn"
                onClick={() => {
                  const next = items.slice();
                  next.splice(i, 1);
                  setField(field.path, next);
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            class="btn"
            onClick={() => setField(field.path, [...items, ""])}
          >
            {field.addLabel}
          </button>
        </div>
      );
    }
  }
}
