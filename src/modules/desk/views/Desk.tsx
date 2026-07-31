import { useRef } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logoutUser } from "@/platform/auth/services/logoutUser.service";
import { PostItWall } from "@/modules/postits/views/PostItWall";
import { NotebookView } from "@/modules/notebook/views/NotebookView";
import { StickerSheet } from "@/modules/stickers/components/StickerSheet";
import { StickerLayer } from "@/modules/stickers/views/StickerLayer";
import { DateBadge } from "../components/DateBadge";
import { useBoardStore } from "../store/useBoardStore";
import { useBoardSync } from "../hooks/useBoardSync";

export function Desk() {
  const deskRef = useRef<HTMLDivElement>(null);
  // Carga y sincroniza el tablero del usuario con Supabase.
  useBoardSync();
  const handleLogout = async () => {
    await logoutUser();
    useBoardStore.getState().reset();
  };
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    const type = active.data.current?.type as string | undefined;
    const store = useBoardStore.getState();

    if (type === "new-sticker") {
      const kind = active.data.current?.kind as string;
      const deskRect = deskRef.current?.getBoundingClientRect();
      const translated = active.rect.current.translated;
      if (!deskRect || !translated) return;
      const x = translated.left - deskRect.left;
      const y = translated.top - deskRect.top;
      store.addSticker(kind, x, y);
      return;
    }

    if (type === "placed-sticker") {
      const s = store.stickers.find((it) => it.id === active.id);
      if (s) store.moveSticker(s.id, s.x + delta.x, s.y + delta.y);
      return;
    }

    // post-it move
    const p = store.postits.find((it) => it.id === active.id);
    if (p) store.movePostIt(p.id, p.x + delta.x, p.y + delta.y);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div ref={deskRef} className="relative h-dvh w-full overflow-hidden">
        {/* top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between p-4">
          <h1 className="text-ink/80 pointer-events-auto text-3xl font-bold">
            Mi libreta
          </h1>
          <div className="pointer-events-auto flex items-start gap-3">
            <StickerSheet />
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 rounded-full"
              onClick={handleLogout}
            >
              <LogOut className="size-4" /> Salir
            </Button>
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

        {/* stickers placed on the board float above everything */}
        <StickerLayer />
      </div>
    </DndContext>
  );
}
