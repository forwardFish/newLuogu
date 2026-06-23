export function daysBetween(from: Date, to: Date) {
  const diff = to.getTime() - from.getTime();
  return Math.floor(diff / 86_400_000);
}

export function startOfUtcDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function parseMaybeDate(input: unknown): Date | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") {
    const ms = input > 2_000_000_000 ? input : input * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric) && trimmed.length >= 10) return parseMaybeDate(numeric);
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}
