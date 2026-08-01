import { useState } from "react";
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
import { MOD_LABEL, useHotkeys } from "@/shared/hooks/useHotkeys";
import { useBoardStore } from "@/modules/desk/store/useBoardStore";
import { STICKERS } from "../catalog";
import { StickerBadge } from "./StickerBadge";

export function StickerSheet() {
  const [open, setOpen] = useState(false);
  const addSticker = useBoardStore((s) => s.addSticker);

  // Atajo: abrir/cerrar el panel de stickers.
  useHotkeys([
    { combo: "mod+g", handler: () => setOpen((o) => !o), allowInInput: true },
  ]);

  const place = (kind: string) => {
    addSticker(kind);
    setOpen(false); // cierra para ver el sticker caer en la hoja
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 rounded-full shadow-sm"
          title={`Stickers (${MOD_LABEL}G)`}
        >
          <StickerIcon className="size-4" /> Stickers
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Stickers</SheetTitle>
          <SheetDescription>
            Toca uno para pegarlo en la hoja actual de la libreta.
          </SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-2 overflow-y-auto px-4 pb-6">
          {STICKERS.map((s) => (
            <button
              key={s.kind}
              type="button"
              onClick={() => place(s.kind)}
              className="grid place-items-center rounded-xl p-2 transition hover:bg-black/5"
              aria-label={`Pegar sticker ${s.label}`}
            >
              <StickerBadge kind={s.kind} size={68} />
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
