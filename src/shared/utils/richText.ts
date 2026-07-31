/**
 * Strip a note's rich HTML down to plain text (for search, previews, insights).
 * Block-level tags become line breaks so adjacent words/URLs don't merge — e.g.
 * "…cinepolis.com<li>comida</li>" must not read as "cinepolis.comcomida".
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    // break on both opening and closing block tags so words never merge
    .replace(/<\/?(p|div|li|ul|ol|h[1-6]|tr)\b[^>]*>/gi, "\n");
  const el = document.createElement("div");
  el.innerHTML = withBreaks;
  return (el.textContent || "")
    .replace(/ /g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** True when the note has no visible text (ignores empty tags like <br>). */
export function isHtmlEmpty(html: string): boolean {
  return htmlToPlainText(html).length === 0;
}
