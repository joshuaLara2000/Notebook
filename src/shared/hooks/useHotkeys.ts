import { useEffect, useRef } from "react";

export interface Hotkey {
  /** Combo tipo "mod+e", "mod+enter", "arrowleft". "mod" = ⌘ en Mac, Ctrl en el resto. */
  combo: string;
  handler: (e: KeyboardEvent) => void;
  /** Permitir el atajo aunque el foco esté en un campo de texto. */
  allowInInput?: boolean;
}

/** Indica si el foco está sobre un campo editable (input, textarea, contenteditable). */
function isEditable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.isContentEditable === true
  );
}

/** Compara un combo declarativo contra el evento de teclado. */
function matches(combo: string, e: KeyboardEvent): boolean {
  const parts = combo.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  const wantMod = parts.includes("mod");
  const wantShift = parts.includes("shift");
  const wantAlt = parts.includes("alt");

  const mod = e.metaKey || e.ctrlKey;
  if (wantMod !== mod) return false;
  // Shift/Alt solo se exigen si el combo los pide; no se prohíben (así "?" —que
  // se teclea con Shift— sigue funcionando).
  if (wantShift && !e.shiftKey) return false;
  if (wantAlt && !e.altKey) return false;
  return e.key.toLowerCase() === key;
}

/** Registra atajos de teclado globales mientras el componente está montado. */
export function useHotkeys(hotkeys: Hotkey[]): void {
  // Guarda la lista más reciente sin re-suscribir el listener en cada render.
  const ref = useRef(hotkeys);
  ref.current = hotkeys;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      for (const hk of ref.current) {
        if (!matches(hk.combo, e)) continue;
        if (!hk.allowInInput && isEditable(e.target)) return;
        e.preventDefault();
        hk.handler(e);
        return;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

/** Símbolo del modificador principal según la plataforma, para mostrar en tooltips. */
export const MOD_LABEL =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
    ? "⌘"
    : "Ctrl";
