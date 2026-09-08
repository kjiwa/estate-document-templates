export function normalizeName(value: string | undefined | null): string {
  return String(value || "")
    .trim()
    .toLowerCase();
}
