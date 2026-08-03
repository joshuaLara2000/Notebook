/**
 * Lightweight "insights" detection à la Windows Sticky Notes: find links,
 * emails and phone numbers in a note's plain text and turn them into actionable
 * chips. Dates are handled separately as inline highlights (see `dates.ts` and
 * `NoteMarkedView`), so they are intentionally not chips here. Pure functions.
 */
export type InsightType = "link" | "email" | "phone";

export interface Insight {
  type: InsightType;
  label: string;
  href: string;
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
  const phones = text.match(/\+?\d[\d\s()-]{6,}\d/g) ?? [];
  for (const raw of phones) {
    const digits = raw.replace(/[^\d+]/g, "");
    if (digits.replace(/\D/g, "").length >= 7) {
      push({ type: "phone", label: raw.trim(), href: `tel:${digits}` });
    }
  }

  return found.slice(0, 4);
}
