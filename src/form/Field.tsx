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
import { isOptional } from "./field-spec";
import type { LeafFieldSpec } from "./registry";

interface FieldProps {
  field: LeafFieldSpec;
}

export function parseNumberInput(raw: string): number | undefined {
  return raw.trim() === "" ? undefined : Number(raw);
}

export function fieldId(path: string): string {
  return `field-${path.replace(/\./g, "-")}`;
}

function FieldLabel({ plan, field }: { plan: Plan; field: LeafFieldSpec }) {
  return (
    <>
      {field.label}
      {isOptional(plan, field) ? (
        <span class="field-optional"> (optional)</span>
      ) : null}
    </>
  );
}

export function Field({ field }: FieldProps) {
  const plan = usePlan();
  const id = fieldId(field.path);
  const value = getPath(plan, field.path);

  switch (field.kind) {
    case "text":
      return (
        <div class="field">
          <label for={id}>
            <FieldLabel plan={plan} field={field} />
          </label>
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
                parseNumberInput((event.target as HTMLInputElement).value)
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
          <label for={id}>
            <FieldLabel plan={plan} field={field} />
          </label>
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
        <div class="field field-checkbox">
          <label for={id}>
            <input
              id={id}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(event) =>
                setField(field.path, (event.target as HTMLInputElement).checked)
              }
            />
            <span>{field.label}</span>
          </label>
        </div>
      );

    case "list": {
      const columns = field.columns;
      const blank = columns
        ? Object.fromEntries(columns.map((column) => [column.key, ""]))
        : "";
      const items = Array.isArray(value) ? (value as unknown[]) : [];
      const replaceAt = (i: number, entry: unknown) => {
        const next = items.slice();
        next[i] = entry;
        setField(field.path, next);
      };
      return (
        <div class="field">
          <label>
            <FieldLabel plan={plan} field={field} />
          </label>
          <div class="field-list">
            {items.map((item, i) => (
              <div
                class={
                  columns
                    ? "field-list-row field-list-row-columns"
                    : "field-list-row"
                }
                key={i}
              >
                {columns ? (
                  columns.map((column) => (
                    <input
                      key={column.key}
                      type="text"
                      aria-label={`${field.label} ${i + 1} ${column.label}`}
                      placeholder={column.label}
                      value={
                        (item as Record<string, string | undefined>)[
                          column.key
                        ] ?? ""
                      }
                      onInput={(event) =>
                        replaceAt(i, {
                          ...(item as Record<string, string>),
                          [column.key]: (event.target as HTMLInputElement)
                            .value,
                        })
                      }
                    />
                  ))
                ) : (
                  <input
                    type="text"
                    aria-label={`${field.label} ${i + 1}`}
                    value={item as string}
                    onInput={(event) =>
                      replaceAt(i, (event.target as HTMLInputElement).value)
                    }
                  />
                )}
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
              onClick={() => setField(field.path, [...items, blank])}
            >
              {field.addLabel}
            </button>
          </div>
        </div>
      );
    }
  }
}
