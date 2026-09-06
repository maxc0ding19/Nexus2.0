/* ------------------------------------------------------------
   NEXUS time helpers. All day-boundaries are local-time based
   and keyed as ISO date "YYYY-MM-DD".
   ------------------------------------------------------------ */

export function pad(n) {
  return String(n).padStart(2, "0");
}

export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function fromKey(key) {
  if (!key) return new Date();
  const parts = String(key).split("-").map(Number);
  if (parts.length < 3 || parts.some(isNaN)) return new Date();
  const [y, m, d] = parts;
  return new Date(y, (m || 1) - 1, d || 1);
}

export function keysRange(endKey, n) {
  /* n keys ending at endKey (inclusive), oldest first. */
  const out = [];
  const end = fromKey(endKey);
  for (let i = n - 1; i >= 0; i--) {
    out.push(dateKey(addDays(end, -i)));
  }
  return out;
}

export function weekdayLabel(key) {
  return fromKey(key).toLocaleDateString(undefined, { weekday: "short" });
}
export function shortDate(key) {
  const d = fromKey(key);
  return `${d.toLocaleDateString(undefined, { month: "short" })}
    ${d.getDate()}`.replace(/\s+/g, " ");
}
export function longDate(d = new Date()) {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/* A "nice" relative label for a day offset. */
export function dayLabel(key) {
  const today = dateKey();
  if (key === today) return "Today";
  if (key === dateKey(addDays(new Date(), -1))) return "Yesterday";
  return shortDate(key);
}
