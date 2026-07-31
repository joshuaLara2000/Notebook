/**
 * Lightweight "insights" detection à la Windows Sticky Notes: find links,
 * emails, phone numbers and dates in a note's plain text and turn them into
 * actionable chips. Pure functions, no side effects.
 */
export type InsightType = "link" | "email" | "phone" | "date";

export interface Insight {
  type: InsightType;
  label: string;
  href: string;
}

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

function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}${m}${day}`;
}

function calendarHref(date: Date, title: string): string {
  const start = ymd(date);
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "Recordatorio",
    dates: `${start}/${ymd(next)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function nextWeekday(target: number): Date {
  const d = new Date();
  const diff = (target - d.getDay() + 7) % 7 || 7; // always a future day
  d.setDate(d.getDate() + diff);
  return d;
}

function detectDate(text: string): Date | null {
  const lower = text.toLowerCase();

  if (/\bhoy\b/.test(lower)) return new Date();
  if (/\bmañana\b|\bmanana\b/.test(lower)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }

  // "12 de mayo" (opcional "de 2026")
  const written = lower.match(
    /\b(\d{1,2})\s+de\s+([a-záéíóú]+)(?:\s+de\s+(\d{4}))?/
  );
  if (written && MONTHS[written[2]] !== undefined) {
    const day = Number(written[1]);
    const month = MONTHS[written[2]];
    const year = written[3] ? Number(written[3]) : new Date().getFullYear();
    return new Date(year, month, day);
  }

  // dd/mm(/yyyy)
  const numeric = lower.match(/\b(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?\b/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]) - 1;
    let year = numeric[3] ? Number(numeric[3]) : new Date().getFullYear();
    if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
      return new Date(year, month, day);
    }
  }

  // weekday name → next occurrence
  const weekday = lower.match(
    /\b(domingo|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado)\b/
  );
  if (weekday) return nextWeekday(WEEKDAYS[weekday[1]]);

  return null;
}

export function detectInsights(plain: string): Insight[] {
  const text = plain.trim();
  if (!text) return [];

  const found: Insight[] = [];
  const seen = new Set<string>();
  const push = (i: Insight) => {
    const key = `${i.type}:${i.href}`;
    if (!seen.has(key)) {
      seen.add(key);
      found.push(i);
    }
  };

  // emails first (so they aren't swallowed by the link matcher)
  const emails = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) ?? [];
  for (const e of emails) push({ type: "email", label: e, href: `mailto:${e}` });

  // links (trim trailing punctuation that isn't part of the URL)
  const links = text.match(/(?:https?:\/\/|www\.)[^\s]+/gi) ?? [];
  for (const raw of links) {
    const clean = raw.replace(/[.,;:!?)\]]+$/, "");
    const url = clean.startsWith("http") ? clean : `https://${clean}`;
    push({ type: "link", label: clean.replace(/^https?:\/\//, ""), href: url });
  }

  // phones (7+ digits, allow + ( ) - spaces) — skip pure dates
  const phones = text.match(/\+?\d[\d\s()\-]{6,}\d/g) ?? [];
  for (const raw of phones) {
    const digits = raw.replace(/[^\d+]/g, "");
    if (digits.replace(/\D/g, "").length >= 7) {
      push({ type: "phone", label: raw.trim(), href: `tel:${digits}` });
    }
  }

  // date → calendar event using the note text as the title
  const date = detectDate(text);
  if (date && !Number.isNaN(date.getTime())) {
    const title = text.replace(/\s+/g, " ").slice(0, 60);
    push({ type: "date", label: "Agendar", href: calendarHref(date, title) });
  }

  return found.slice(0, 4);
}
