import { useState } from "react";
import { Keyboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MOD_LABEL, useHotkeys } from "@/shared/hooks/useHotkeys";

/** Lista de atajos que se muestra al usuario. Debe reflejar los que registran los módulos. */
const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: [MOD_LABEL, "E"], label: "Nuevo post-it" },
  { keys: [MOD_LABEL, "↵"], label: "Nueva hoja" },
  { keys: ["←"], label: "Hoja anterior" },
  { keys: ["→"], label: "Hoja siguiente" },
  { keys: [MOD_LABEL, "J"], label: "Panel de notas" },
  { keys: [MOD_LABEL, "K"], label: "Índice de hojas" },
  { keys: [MOD_LABEL, "G"], label: "Stickers" },
  { keys: [MOD_LABEL, "⇧", "D"], label: "Modo claro / oscuro" },
  { keys: ["?"], label: "Ver estos atajos" },
];

/** Muestra una tecla con estilo de tecla física. */
function Key({ children }: { children: string }) {
  return (
    <kbd className="bg-paper text-ink border-border inline-grid min-w-7 place-items-center rounded-md border px-1.5 py-0.5 text-sm font-semibold shadow-sm">
      {children}
    </kbd>
  );
}

/** Botón de ayuda + diálogo con la lista de atajos de teclado. */
export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  // Abrir/cerrar con "?" (convención habitual). Se detecta por carácter y por
  // tecla física (Shift+Slash) para funcionar en cualquier layout de teclado.
  // Fuera de campos de texto para no interferir al escribir "?".
  const toggle = () => setOpen((o) => !o);
  useHotkeys([
    { combo: "?", handler: toggle },
    { combo: "shift+slash", handler: toggle },
  ]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          aria-label="Atajos de teclado"
          title="Atajos de teclado (?)"
        >
          <Keyboard className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Atajos de teclado
          </DialogTitle>
          <DialogDescription>
            En Windows y Linux usa Ctrl en lugar de {MOD_LABEL}.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-2">
          {SHORTCUTS.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-ink text-sm">{s.label}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <Key key={k}>{k}</Key>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
