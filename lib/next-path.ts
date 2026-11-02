/** Only same-site relative paths. */
export function safeNext(v: string | string[] | undefined | null, fallback = "/routine") {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s || !s.startsWith("/") || s.startsWith("//") || s.includes("\\")) return fallback;
  return s;
}
