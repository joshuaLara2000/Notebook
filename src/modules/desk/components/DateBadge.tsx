import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Small tear-off calendar badge, floating top-right above the notebook.
 * Mirrors the reference: blue header (month + weekday) over a large day.
 */
export function DateBadge() {
  const now = new Date();
  const month = format(now, "MMMM", { locale: es }).toUpperCase();
  const weekday = format(now, "EEEE", { locale: es }).toUpperCase();
  const day = format(now, "dd");
  const year = format(now, "yyyy");

  return (
    <div className="w-28 select-none overflow-hidden rounded-xl bg-white shadow-[0_10px_20px_rgba(0,0,0,.25)] ring-1 ring-black/10">
      <div className="bg-primary text-primary-foreground flex items-center justify-between px-2 py-1">
        <span className="text-[0.7rem] font-bold tracking-wide">{month}</span>
        <span className="text-[0.55rem] opacity-80">{year}</span>
      </div>
      <div className="flex flex-col items-center px-2 pb-2 pt-1">
        <span className="text-ink text-4xl font-extrabold leading-none">
          {day}
        </span>
        <span className="text-ink-soft mt-1 text-[0.6rem] tracking-wide">
          {weekday}
        </span>
      </div>
    </div>
  );
}
