/* ------------------------------------------------------------
   NEXUS formatting helpers
   ------------------------------------------------------------ */

export function fmt(n, dp = 0) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: dp,
  });
}

export function pct(n) {
  return `${Math.round(n)}%`;
}

/* Prettify a time label such as "07:30". */
export function fmtClock(h, m) {
  const hh = h % 12 === 0 ? 12 : h % 12;
  const ap = h < 12 ? "AM" : "PM";
  return `${hh}:${String(m || 0).padStart(2, "0")} ${ap}`;
}

/* A tiny sparkline path from an array of numbers. */
export function sparkPath(values, w = 90, h = 26) {
  if (!values || values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - 3 - ((v - min) / span) * (h - 6);
    return [x, y];
  });
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

export function statusTone(curr, prev, opts = {}) {
  /* Compare two series totals to pick a status tone. */
  const { invert = false } = opts;
  if (curr == null || prev == null || prev === 0) return "neutral";
  const delta = curr - prev;
  if (Math.abs(delta) < 0.01) return "neutral";
  const good = invert ? delta < 0 : delta > 0;
  return good ? "ok" : "neg";
}
