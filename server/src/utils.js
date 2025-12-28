export function makeId(prefix = "id") {
  // stable enough for demo (no external deps)
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function isISODateOnly(s) {
  // YYYY-MM-DD
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}
