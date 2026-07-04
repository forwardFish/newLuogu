export function toJsonValue(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_, inner) => (typeof inner === "bigint" ? inner.toString() : inner))
  );
}

export function jsonResponse(data: unknown, init?: ResponseInit) {
  return Response.json(toJsonValue(data), init);
}

export function formatErrorDetail(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("DATABASE_URL")) {
    return "Database is not configured: missing DATABASE_URL. Fill .env from .env.example and retry.";
  }
  if (message.includes("DIRECT_URL")) {
    return "Database is not configured: missing DIRECT_URL. Fill .env from .env.example and retry.";
  }
  return message;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
