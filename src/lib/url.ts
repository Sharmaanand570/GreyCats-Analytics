// Accept absolute http(s) URLs only. Empty strings return false so callers can
// distinguish "missing" from "malformed" themselves.
export const isValidHttpUrl = (raw: string): boolean => {
  const v = raw.trim();
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};
