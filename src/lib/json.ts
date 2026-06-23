export function toJsonValue(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_, inner) => (typeof inner === "bigint" ? inner.toString() : inner))
  );
}

export function jsonResponse(data: unknown, init?: ResponseInit) {
  return Response.json(toJsonValue(data), init);
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
