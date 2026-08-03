import { useRef } from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PostItWall } from "@/modules/postits/views/PostItWall";
import { NotesSheet } from "@/modules/postits/components/NotesSheet";
import { NotebookView } from "@/modules/notebook/views/NotebookView";
import { StickerSheet } from "@/modules/stickers/components/StickerSheet";
import { MOD_LABEL, useHotkeys } from "@/shared/hooks/useHotkeys";
import { clampBoxToBounds } from "@/shared/utils/geometry";
import { DateBadge } from "../components/DateBadge";
import { AccountMenu } from "../components/AccountMenu";
import { ShortcutsHelp } from "../components/ShortcutsHelp";
import { ThemeToggle } from "../components/ThemeToggle";
import { useBoardStore } from "../store/useBoardStore";
import { useBoardSync } from "../hooks/useBoardSync";

export function Desk() {
  const deskRef = useRef<HTMLDivElement>(null);
  // Carga y sincroniza el tablero del usuario con Supabase.
  useBoardSync();
  const addPostIt = useBoardStore((s) => s.addPostIt);

  // Atajo global: crear un post-it (funciona incluso escribiendo).
  useHotkeys([
    { combo: "mod+e", handler: () => addPostIt(), allowInInput: true },
  ]);
  // Mouse: arrastra tras mover 6px. Touch: pulsación sostenida de 200ms (con
  // tolerancia de 8px) para arrastrar, de modo que un toque simple edita y un
  // scroll/toque rápido no arrastra la nota por accidente.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    const type = active.data.current?.type as string | undefined;
    const store = useBoardStore.getState();

    if (type === "placed-sticker") {
      const s = store.stickers.find((it) => it.id === active.id);
      if (s) store.moveSticker(s.id, s.x + delta.x, s.y + delta.y);
      return;
    }

    // post-it move — clamp to the desk so a note can never be dropped past an
    // edge (its drag handle would go off-screen and become unreachable).
    const p = store.postits.find((it) => it.id === active.id);
    if (p) {
      const rect = deskRef.current?.getBoundingClientRect();
      const bounds = rect
        ? { width: rect.width, height: rect.height }
        : { width: window.innerWidth, height: window.innerHeight };
      const { x, y } = clampBoxToBounds(
        p.x + delta.x,
        p.y + delta.y,
        { width: p.width, height: p.height },
        bounds
      );
      store.movePostIt(p.id, x, y);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div ref={deskRef} className="relative h-dvh w-full overflow-hidden">
        {/* top bar: cuenta (izq) · crear (centro) · calendario (der) */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between p-4"
          // respeta el notch / barra de estado en móviles (viewport-fit=cover)
          style={{
            paddingTop: "max(1rem, env(safe-area-inset-top))",
            paddingLeft: "max(1rem, env(safe-area-inset-left))",
            paddingRight: "max(1rem, env(safe-area-inset-right))",
          }}
        >
          <div className="pointer-events-auto">
            <AccountMenu />
          </div>

          {/* herramientas para agregar al escritorio */}
          <div className="pointer-events-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1 rounded-full"
              onClick={() => addPostIt()}
              title={`Nuevo post-it (${MOD_LABEL}E)`}
            >
              <Plus className="size-4" /> Post-it
            </Button>
            <NotesSheet />
            <StickerSheet />
            <ThemeToggle />
            {/* atajos de teclado: no aplican en táctil, se ocultan ahí */}
            <span className="hide-on-touch">
              <ShortcutsHelp />
            </span>
          </div>

          <div className="pointer-events-auto">
            <DateBadge />
          </div>
        </div>

        {/* notebook — anchored to the bottom-right, leaving the open desk on the
            left for post-its. Top padding keeps it clear of the top bar/date. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-end pt-28 pr-6 pb-6">
          <div className="pointer-events-auto">
            <NotebookView />
          </div>
        </div>

        {/* post-its float freely over the whole desk (including the notebook) */}
        <PostItWall />
      </div>
    </DndContext>
  );
}
