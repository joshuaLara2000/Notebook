import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { findDateMatches } from "../lib/dates";
import { eventFromMatch } from "../lib/calendar";
import { ScheduleMenu, type ScheduleTarget } from "./ScheduleMenu";

const BLOCK_TAGS = new Set([
  "P", "DIV", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "TD", "BLOCKQUOTE",
]);

/** Text of the nearest block ancestor — used as the calendar event's title. */
function blockTitle(node: Node): string {
  let el = node.parentElement;
  while (el && !BLOCK_TAGS.has(el.tagName)) el = el.parentElement;
  const src = (el ?? node.parentElement)?.textContent ?? node.nodeValue ?? "";
  return src.replace(/\s+/g, " ").trim().slice(0, 80);
}

/**
 * Wrap every detected date in the note's HTML with a clickable `<mark>`,
 * leaving all other markup (bold, lists, links…) untouched. Works on a detached
 * DOM so tag boundaries are never broken by naive string replacement.
 */
function markDates(html: string): string {
  if (typeof document === "undefined" || !html) return html;
  const root = document.createElement("div");
  root.innerHTML = html;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    // a date inside a link is part of a URL, not an appointment
    if (node.parentElement?.closest("a")) continue;
    texts.push(node);
  }

  for (const node of texts) {
    const text = node.nodeValue ?? "";
    const matches = findDateMatches(text);
    if (!matches.length) continue;

    const title = blockTitle(node);
    const frag = document.createDocumentFragment();
    let cursor = 0;
    for (const m of matches) {
      if (m.index > cursor) frag.append(text.slice(cursor, m.index));
      const phrase = text.slice(m.index, m.index + m.length);
      const mark = document.createElement("mark");
      mark.className = "nb-date";
      mark.tabIndex = 0;
      mark.setAttribute("role", "button");
      mark.setAttribute("aria-label", `Agendar: ${phrase}`);
      mark.dataset.when = m.date.toISOString();
      mark.dataset.allday = m.allDay ? "1" : "0";
      mark.dataset.title = title;
      mark.textContent = phrase;
      frag.append(mark);
      cursor = m.index + m.length;
    }
    if (cursor < text.length) frag.append(text.slice(cursor));
    node.parentNode?.replaceChild(frag, node);
  }

  return root.innerHTML;
}

interface NoteMarkedViewProps {
  html: string;
  className?: string;
  /** Enter edit mode (clicked anywhere that isn't a highlighted date). */
  onEdit: () => void;
}

/**
 * Read-only render of a note shown while it isn't being edited: dates are
 * highlighted and tapping one opens the "add to calendar" picker; tapping
 * anywhere else switches to the editor.
 */
export function NoteMarkedView({ html, className, onEdit }: NoteMarkedViewProps) {
  const marked = useMemo(() => markDates(html), [html]);
  const [target, setTarget] = useState<ScheduleTarget | null>(null);

  const openFor = (el: HTMLElement) => {
    const when = el.dataset.when;
    if (!when) return;
    const event = eventFromMatch(
      new Date(when),
      el.dataset.allday === "1",
      el.dataset.title ?? ""
    );
    setTarget({ rect: el.getBoundingClientRect(), event });
  };

  const handleClick = (e: React.MouseEvent) => {
    const mark = (e.target as HTMLElement).closest?.(
      "mark.nb-date"
    ) as HTMLElement | null;
    if (mark) {
      e.stopPropagation();
      openFor(mark);
    } else {
      onEdit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const el = e.target as HTMLElement;
    if ((e.key === "Enter" || e.key === " ") && el.matches?.("mark.nb-date")) {
      e.preventDefault();
      openFor(el);
    }
  };

  return (
    <>
      <div
        className={cn(
          "rich-note h-full w-full cursor-text overflow-y-auto px-3 pb-2",
          className
        )}
        // clicking to edit must not start a drag on the post-it
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: marked }}
      />
      <ScheduleMenu target={target} onClose={() => setTarget(null)} />
    </>
  );
}
