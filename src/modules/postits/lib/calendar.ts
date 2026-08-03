/**
 * Build "add to calendar" targets for each provider from a detected event.
 * Google/Outlook/Yahoo are deep links; Apple (and anything else) gets a
 * universal `.ics` file. Times are treated as the user's local wall-clock.
 */

export type CalendarProvider = "google" | "outlook" | "apple" | "yahoo";

export interface CalendarEvent {
  title: string;
  start: Date;
  /** End moment; defaults are applied by `eventFromMatch`. */
  end: Date;
  allDay: boolean;
}

export const PROVIDER_LABELS: Record<CalendarProvider, string> = {
  google: "Google Calendar",
  outlook: "Outlook",
  apple: "Apple / .ics",
  yahoo: "Yahoo Calendar",
};

/** Default event length for a timed appointment. */
const DEFAULT_DURATION_MIN = 60;

/** Turn a detected date into a full event (adds a sensible end + title). */
export function eventFromMatch(
  start: Date,
  allDay: boolean,
  title: string
): CalendarEvent {
  const end = new Date(start);
  if (allDay) end.setDate(end.getDate() + 1);
  else end.setMinutes(end.getMinutes() + DEFAULT_DURATION_MIN);
  return { title: title.trim() || "Recordatorio", start, end, allDay };
}

const p2 = (n: number) => String(n).padStart(2, "0");

/** YYYYMMDD (all-day). */
function dayStamp(d: Date): string {
  return `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}`;
}

/** YYYYMMDDTHHMMSS — local wall-clock, no timezone suffix (floating). */
function localStamp(d: Date): string {
  return `${dayStamp(d)}T${p2(d.getHours())}${p2(d.getMinutes())}00`;
}

/** YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS for Outlook's deep link. */
function isoLocal(d: Date, allDay: boolean): string {
  const date = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  if (allDay) return date;
  return `${date}T${p2(d.getHours())}:${p2(d.getMinutes())}:00`;
}

/** Deep-link URL for Google, Outlook or Yahoo. Apple uses `buildIcs` instead. */
export function buildCalendarUrl(
  provider: Exclude<CalendarProvider, "apple">,
  e: CalendarEvent
): string {
  if (provider === "google") {
    const dates = e.allDay
      ? `${dayStamp(e.start)}/${dayStamp(e.end)}`
      : `${localStamp(e.start)}/${localStamp(e.end)}`;
    const q = new URLSearchParams({
      action: "TEMPLATE",
      text: e.title,
      dates,
    });
    return `https://calendar.google.com/calendar/render?${q.toString()}`;
  }

  if (provider === "outlook") {
    const q = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      subject: e.title,
      startdt: isoLocal(e.start, e.allDay),
      enddt: isoLocal(e.end, e.allDay),
    });
    if (e.allDay) q.set("allday", "true");
    return `https://outlook.live.com/calendar/0/deeplink/compose?${q.toString()}`;
  }

  // yahoo
  const q = new URLSearchParams({ v: "60", title: e.title });
  if (e.allDay) {
    q.set("st", dayStamp(e.start));
    q.set("dur", "allday");
  } else {
    q.set("st", localStamp(e.start));
    q.set("et", localStamp(e.end));
  }
  return `https://calendar.yahoo.com/?${q.toString()}`;
}

/** Escape a value for an ICS text field (RFC 5545). */
function icsEscape(s: string): string {
  return s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");
}

function icsStamp(d: Date, allDay: boolean): string {
  return allDay ? dayStamp(d) : localStamp(d);
}

/** A minimal single-event VCALENDAR document. */
export function buildIcs(e: CalendarEvent): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@notebook`;
  const dtstamp = `${new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")}`;
  const dtStart = e.allDay
    ? `DTSTART;VALUE=DATE:${icsStamp(e.start, true)}`
    : `DTSTART:${icsStamp(e.start, false)}`;
  const dtEnd = e.allDay
    ? `DTEND;VALUE=DATE:${icsStamp(e.end, true)}`
    : `DTEND:${icsStamp(e.end, false)}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Notebook//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    dtStart,
    dtEnd,
    `SUMMARY:${icsEscape(e.title)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Trigger a client-side download of the event as an `.ics` file. */
export function downloadIcs(e: CalendarEvent): void {
  const blob = new Blob([buildIcs(e)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.title.slice(0, 40).replace(/[^\w\s-]/g, "").trim() || "evento"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Open the provider's page, or download the `.ics`, for this event. */
export function openInCalendar(provider: CalendarProvider, e: CalendarEvent): void {
  if (provider === "apple") {
    downloadIcs(e);
    return;
  }
  window.open(buildCalendarUrl(provider, e), "_blank", "noopener,noreferrer");
}
