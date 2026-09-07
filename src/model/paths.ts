// Dotted-string paths into a `Plan`, e.g. "party.testator.name" or
// "execution.witnesses.0.name". Chosen over `as const` tuple paths after
// measuring `tsc --extendedDiagnostics` against both — see the Phase 3 child
// plan's "Step 0" section for the numbers. `getPath`/`setPath` are the only
// runtime surface; everything else (`FieldSpec["path"]`, advisories) types
// against `Path<Plan>`.

type Primitive = string | number | boolean | undefined | null;

type PathImpl<T, K extends keyof T & string> = T[K] extends Primitive
  ? `${K}`
  : T[K] extends readonly (infer U)[]
    ? U extends Primitive
      ? `${K}` | `${K}.${number}`
      : `${K}` | `${K}.${number}` | `${K}.${number}.${Path<U>}`
    : T[K] extends object
      ? `${K}` | `${K}.${Path<T[K]>}`
      : `${K}`;

export type Path<T> = T extends object
  ? { [K in keyof T & string]: PathImpl<T, K> }[keyof T & string]
  : never;

function splitPath(path: string): (string | number)[] {
  return path.split(".").map((part) => {
    const index = Number(part);
    return Number.isInteger(index) && String(index) === part ? index : part;
  });
}

export function getPath<T>(obj: T, path: string): unknown {
  return splitPath(path).reduce<unknown>((current, part) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string | number, unknown>)[part];
  }, obj);
}

// Immutable: returns a new top-level object (and new objects/arrays along
// the path) rather than mutating `obj`, so store consumers can rely on
// reference equality to detect change.
export function setPath<T>(obj: T, path: string, value: unknown): T {
  const parts = splitPath(path);
  return setPathParts(obj, parts, value) as T;
}

function setPathParts(
  obj: unknown,
  parts: (string | number)[],
  value: unknown
): unknown {
  const [head, ...rest] = parts;
  if (head === undefined) return value;

  if (typeof head === "number") {
    const arr = Array.isArray(obj) ? obj.slice() : [];
    arr[head] =
      rest.length === 0 ? value : setPathParts(arr[head], rest, value);
    return arr;
  }

  const record =
    obj && typeof obj === "object" && !Array.isArray(obj)
      ? { ...(obj as Record<string, unknown>) }
      : {};
  record[head] =
    rest.length === 0 ? value : setPathParts(record[head], rest, value);
  return record;
}
