import { useDraggable } from "@dnd-kit/core";
import { Sticker as StickerIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { STICKERS } from "../catalog";
import { StickerBadge } from "./StickerBadge";

function SheetSticker({ kind }: { kind: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-sticker:${kind}`,
    data: { type: "new-sticker", kind },
  });
  return (
    <button
      ref={setNodeRef}
      className="grid touch-none place-items-center rounded-xl p-2 transition hover:bg-black/5"
      style={{ opacity: isDragging ? 0.3 : 1 }}
      {...listeners}
      {...attributes}
      aria-label={`Arrastrar sticker ${kind}`}
    >
      <StickerBadge kind={kind} size={68} />
    </button>
  );
}

export function StickerSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-full shadow-sm">
          <StickerIcon className="size-4" /> Stickers
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="font-hand text-2xl">Stickers</SheetTitle>
          <SheetDescription>
            Arrastra un sticker hacia la libreta o el tablero.
          </SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-2 overflow-y-auto px-4 pb-6">
          {STICKERS.map((s) => (
            <SheetSticker key={s.kind} kind={s.kind} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
