/**
 * Date & time detection for note text. Unlike the chip insights, this finds
 * *every* date reference in a string and reports its position so the note can
 * highlight each one inline and offer to schedule it. Pure functions.
 */

const MONTHS: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

// Sunday = 0 … Saturday = 6
const WEEKDAYS: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miércoles: 3,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sábado: 6,
  sabado: 6,
};

export interface DateMatch {
  /** Start offset of the highlighted span within the source string. */
  index: number;
  /** Length of the highlighted span (may include a trailing time). */
  length: number;
  /** Resolved start moment (with the detected time, or midnight when all-day). */
  date: Date;
  /** True when no time was found — the event should be a full-day event. */
  allDay: boolean;
}

function nextWeekday(target: number, from = new Date()): Date {
  const d = new Date(from);
  const diff = (target - d.getDay() + 7) % 7 || 7; // always a future day
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

interface TimeHit {
  hour: number;
  minute: number;
  index: number;
  length: number;
}

/**
 * First clock time in `s`: "a las 4", "a las 16:30", "4:30pm", "4 pm".
 * Returns the offset within `s` so the caller can extend a highlight over it.
 */
function findTime(s: string): TimeHit | null {
  const patterns = [
    // "a las 4", "a las 16:30", "a las 4 pm"
    /\ba\s+las?\s+(\d{1,2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?/i,
    // "16:30", "4:30 pm"
    /\b(\d{1,2}):(\d{2})\s*(a\.?\s?m\.?|p\.?\s?m\.?)?/i,
    // "4pm", "11 am"
    /\b(\d{1,2})\s*(a\.?\s?m\.?|p\.?\s?m\.?)\b/i,
  ];

  let best: (TimeHit & { raw: string }) | null = null;
  for (const re of patterns) {
    const m = re.exec(s);
    if (!m || m.index === undefined) continue;
    if (best && m.index >= best.index) continue;

    let hour = Number(m[1]);
    // pattern C has meridiem in group 2; A/B in group 3
    const minute = /^\d/.test(m[2] ?? "") ? Number(m[2]) : 0;
    const meridiem = (m[3] ?? m[2] ?? "").toLowerCase();
    const isPm = meridiem.startsWith("p");
    const isAm = meridiem.startsWith("a");
    if (isPm && hour < 12) hour += 12;
    if (isAm && hour === 12) hour = 0;
    if (hour > 23 || minute > 59) continue;

    best = { hour, minute, index: m.index, length: m[0].length, raw: m[0] };
  }
  return best;
}

/**
 * How specific a date reference is. A bare weekday ("martes") only names a day;
 * an explicit calendar date ("16 de junio", "12/05") pins it down. When the two
 * sit next to each other ("martes 16 de junio") they describe the same day.
 */
type DateKind = "weekday" | "relative" | "explicit";

interface Candidate {
  index: number;
  length: number;
  kind: DateKind;
  make: () => Date | null;
}

/** Collect every date candidate (unresolved) with its position. */
function collectCandidates(text: string): Candidate[] {
  const now = new Date();
  const cands: Candidate[] = [];
  const add = (
    re: RegExp,
    kind: DateKind,
    make: (m: RegExpExecArray) => Date | null
  ) => {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const match = m;
      cands.push({
        index: match.index,
        length: match[0].length,
        kind,
        make: () => make(match),
      });
      if (re.lastIndex === match.index) re.lastIndex++; // guard zero-width
    }
  };

  add(/\bhoy\b/gi, "relative", () => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  add(/\b(mañana|manana)\b/gi, "relative", () => {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  add(
    /\b(domingo|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado)\b/gi,
    "weekday",
    (m) => nextWeekday(WEEKDAYS[m[1].toLowerCase()], now)
  );
  // "12 de mayo" (opcional "de 2026")
  add(
    /\b(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de\s+(\d{4}))?/gi,
    "explicit",
    (m) => {
      const month = MONTHS[m[2].toLowerCase()];
      if (month === undefined) return null;
      const day = Number(m[1]);
      const year = m[3] ? Number(m[3]) : now.getFullYear();
      if (day < 1 || day > 31) return null;
      return new Date(year, month, day);
    }
  );
  // dd/mm(/yyyy) — ':' is never a separator here, so times aren't matched
  add(/\b(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?\b/g, "explicit", (m) => {
    const day = Number(m[1]);
    const month = Number(m[2]) - 1;
    let year = m[3] ? Number(m[3]) : now.getFullYear();
    if (year < 100) year += 2000;
    if (day < 1 || day > 31 || month < 0 || month > 11) return null;
    return new Date(year, month, day);
  });

  return cands;
}

type Accepted = DateMatch & { kind: DateKind };

/**
 * Fuse a weekday that sits right before/after an explicit date into a single
 * highlight — "martes 16 de junio" is one appointment, not two. Only a
 * whitespace/comma gap is bridged, and the explicit date wins.
 */
function fuseWeekdayWithDate(text: string, accepted: Accepted[]): Accepted[] {
  const out: Accepted[] = [];
  for (const m of accepted) {
    const last = out[out.length - 1];
    if (last) {
      const gap = text.slice(last.index + last.length, m.index);
      const kinds = new Set([last.kind, m.kind]);
      if (/^[\s,]*$/.test(gap) && kinds.has("weekday") && kinds.has("explicit")) {
        const explicit = last.kind === "explicit" ? last : m;
        last.length = m.index + m.length - last.index; // cover the whole span
        last.date = explicit.date;
        last.allDay = explicit.allDay;
        last.kind = "explicit";
        continue;
      }
    }
    out.push({ ...m });
  }
  return out;
}

/**
 * Every date reference in `text`, in reading order, de-duplicated by span and
 * each with an optional trailing time folded in. Overlapping candidates keep
 * the earliest; a written month ("4 de agosto") wins over the bare number.
 */
export function findDateMatches(text: string): DateMatch[] {
  if (!text) return [];

  const candidates = collectCandidates(text)
    // longer spans first so "4 de agosto" beats a stray numeric match at 4
    .sort((a, b) => a.index - b.index || b.length - a.length);
  const starts = candidates.map((c) => c.index);

  const matches: Accepted[] = [];
  let lastEnd = -1;
  for (const c of candidates) {
    if (c.index < lastEnd) continue; // overlaps an accepted match
    const base = c.make();
    if (!base || Number.isNaN(base.getTime())) continue;

    let end = c.index + c.length;
    let allDay = true;
    const date = new Date(base);
    // look for a time right after the date ("4 de agosto a las 5pm") but never
    // past the next date, so a time doesn't get pulled across an intervening one
    const nextStart = starts.find((s) => s >= end) ?? text.length;
    const time = findTime(text.slice(end, Math.min(end + 24, nextStart)));
    if (time) {
      date.setHours(time.hour, time.minute, 0, 0);
      allDay = false;
      end += time.index + time.length;
    }

    matches.push({ index: c.index, length: end - c.index, date, allDay, kind: c.kind });
    lastEnd = end;
  }

  return fuseWeekdayWithDate(text, matches).map(({ kind: _kind, ...m }) => m);
}
