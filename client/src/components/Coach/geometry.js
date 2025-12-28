export function angleABC(a, b, c) {
  // angle at b between BA and BC
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag1 = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  const mag2 = Math.sqrt(cb.x * cb.x + cb.y * cb.y);

  if (!mag1 || !mag2) return null;

  const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.round((Math.acos(cos) * 180) / Math.PI);
}
