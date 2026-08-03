import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Download } from "lucide-react";

import {
  openInCalendar,
  PROVIDER_LABELS,
  type CalendarEvent,
  type CalendarProvider,
} from "../lib/calendar";

/** A date the user tapped: where it is on screen and what to schedule. */
export interface ScheduleTarget {
  rect: DOMRect;
  event: CalendarEvent;
}

const PROVIDERS: CalendarProvider[] = ["google", "outlook", "apple", "yahoo"];

const MENU_W = 216;

function formatWhen(e: CalendarEvent): string {
  const day = new Intl.DateTimeFormat("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(e.start);
  if (e.allDay) return `${day} · todo el día`;
  const time = new Intl.DateTimeFormat("es", {
    hour: "numeric",
    minute: "2-digit",
  }).format(e.start);
  return `${day} · ${time}`;
}

/**
 * Floating "add to calendar" picker anchored to a highlighted date. Rendered in
 * a portal so it escapes the post-it's clipping/transform; closes on outside
 * click, Escape, or when the page scrolls (the anchor rect would go stale).
 */
export function ScheduleMenu({
  target,
  onClose,
}: {
  target: ScheduleTarget | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  // Place under the date, flipping above / nudging inward to stay on screen.
  useLayoutEffect(() => {
    if (!target) return;
    const { rect } = target;
    const h = ref.current?.offsetHeight ?? 180;
    const left = Math.min(rect.left, window.innerWidth - MENU_W - 8);
    const below = rect.bottom + 6;
    const top =
      below + h > window.innerHeight - 8 ? rect.top - h - 6 : below;
    setPos({ top: Math.max(8, top), left: Math.max(8, left) });
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const close = () => onClose();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [target, onClose]);

  if (!target) return null;

  const choose = (provider: CalendarProvider) => {
    openInCalendar(provider, target.event);
    onClose();
  };

  return createPortal(
    <div
      ref={ref}
      role="menu"
      aria-label="Agendar en…"
      className="bg-paper text-ink fixed z-50 overflow-hidden rounded-xl border p-1 shadow-xl"
      style={{ top: pos.top, left: pos.left, width: MENU_W }}
      // keep clicks inside from bubbling to the note (which would enter edit)
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p className="text-ink-soft truncate px-2.5 pt-1.5 pb-1 text-xs">
        {formatWhen(target.event)}
      </p>
      {PROVIDERS.map((provider) => {
        const Icon = provider === "apple" ? Download : CalendarDays;
        return (
          <button
            key={provider}
            type="button"
            role="menuitem"
            onClick={() => choose(provider)}
            className="hover:bg-black/5 focus:bg-black/5 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm outline-hidden select-none"
          >
            <Icon className="text-ink-soft size-4 shrink-0" />
            <span className="truncate">{PROVIDER_LABELS[provider]}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
}
