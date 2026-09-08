// One `<label for>`-bound control per `FieldSpec["kind"]`.
import { usePlan } from "../documents/shared/PlanContext";
import {
  fromIsoDate,
  toIsoDate,
  type StoredExecutionDate,
} from "../model/dates";
import { getPath } from "../model/paths";
import type { Path } from "../model/paths";
import type { Plan } from "../model/plan";
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

    case "executionDate": {
      const stored = (value ?? {}) as Partial<StoredExecutionDate>;
      const iso = toIsoDate({
        day: stored.day ?? "",
        month: stored.month ?? "",
        year: stored.year ?? "",
      });
      return (
        <div class="field">
          <label for={id}>{field.label}</label>
          <input
            id={id}
            type="date"
            value={iso}
            onInput={(event) => {
              const nextIso = (event.target as HTMLInputElement).value;
              const parts = fromIsoDate(nextIso);
              // Sub-paths of a composite field aren't in `Path<Plan>`'s
              // union at the type level — `field.path` is the composite
              // `execution.executionDate`, not its `.day`/`.month`/`.year`
              // leaves — so the three writes are typed through the same
              // `Path<Plan>` the composite path itself carries.
              setField(`${field.path}.day` as Path<Plan>, parts.day);
              setField(`${field.path}.month` as Path<Plan>, parts.month);
              setField(`${field.path}.year` as Path<Plan>, parts.year);
            }}
          />
        </div>
      );
    }

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
          <div class="field-list">
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
        </div>
      );
    }
  }
}
