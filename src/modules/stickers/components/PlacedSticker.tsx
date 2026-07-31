import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

import type { StickerInstance } from "@/shared/types/board";
import { StickerBadge } from "./StickerBadge";

interface PlacedStickerProps {
  sticker: StickerInstance;
  onRemove: () => void;
}

export function PlacedSticker({ sticker, onRemove }: PlacedStickerProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: sticker.id, data: { type: "placed-sticker" } });

  return (
    <div
      ref={setNodeRef}
      className="group pointer-events-auto absolute touch-none"
      style={{
        left: sticker.x,
        top: sticker.y,
        zIndex: sticker.zIndex,
        transform: `${CSS.Translate.toString(transform) ?? ""} rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
        filter: isDragging
          ? "drop-shadow(0 12px 16px rgba(0,0,0,.3))"
          : "drop-shadow(0 4px 6px rgba(0,0,0,.2))",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      {...listeners}
      {...attributes}
    >
      <StickerBadge kind={sticker.kind} size={72} />
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className="bg-ink/70 text-paper absolute -right-2 -top-2 hidden size-5 place-items-center rounded-full group-hover:grid"
        aria-label="Quitar sticker"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
