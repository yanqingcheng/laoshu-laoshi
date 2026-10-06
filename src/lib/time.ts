// Local-day helpers. Times are stored UTC; the learner's timezone decides the day.

function partsIn(date: Date, tz: string) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const p: Record<string, string> = {};
  for (const x of f.formatToParts(date)) p[x.type] = x.value;
  return p;
}

export function safeTz(tz: string | null | undefined): string {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz || "UTC" });
    return tz || "UTC";
  } catch {
    return "UTC";
  }
}

/** YYYY-MM-DD of `date` in `tz`. */
export function localDay(date: Date, tz: string): string {
  const p = partsIn(date, tz);
  return `${p.year}-${p.month}-${p.day}`;
}

function offsetMs(date: Date, tz: string): number {
  const p = partsIn(date, tz);
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** UTC instant at which local day `day` starts in `tz`. */
export function startOfLocalDay(day: string, tz: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d));
  let t = guess.getTime() - offsetMs(guess, tz);
  t = guess.getTime() - offsetMs(new Date(t), tz);
  return new Date(t);
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function endOfToday(now: Date, tz: string): Date {
  return new Date(startOfLocalDay(addDays(localDay(now, tz), 1), tz).getTime() - 1);
}
