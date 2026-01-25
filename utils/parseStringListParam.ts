// utils/parseStringListParam.ts
export function parseStringListParam(value?: string): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (typeof parsed === "string") {
      return parsed
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  } catch {
    // Not JSON → fall through
  }

  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
