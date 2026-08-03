import { useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

import type { StickerInstance } from "@/shared/types/board";
import { StickerBadge } from "./StickerBadge";

const MIN_SCALE = 0.4;
const MAX_SCALE = 3;
const BASE = 96;

interface PlacedStickerProps {
  sticker: StickerInstance;
  onResize: (scale: number) => void;
  onRemove: () => void;
}

export function PlacedSticker({
  sticker,
  onResize,
  onRemove,
}: PlacedStickerProps) {
  const [liveScale, setLiveScale] = useState<number | null>(null);
  const liveRef = useRef<number | null>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: sticker.id, data: { type: "placed-sticker" } });

  function handleResizeStart(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startScale = sticker.scale;
    const onMove = (ev: PointerEvent) => {
      const next = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, startScale + (ev.clientX - startX) / BASE)
      );
      liveRef.current = next;
      setLiveScale(next);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (liveRef.current != null) onResize(liveRef.current);
      liveRef.current = null;
      setLiveScale(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const scale = liveScale ?? sticker.scale;

  return (
    <div
      ref={setNodeRef}
      className="group pointer-events-auto absolute touch-none"
      style={{
        left: sticker.x,
        top: sticker.y,
        zIndex: sticker.zIndex,
        transform: `${CSS.Translate.toString(transform) ?? ""} rotate(${sticker.rotation}deg) scale(${scale})`,
        transformOrigin: "top left",
        filter: isDragging
          ? "drop-shadow(0 12px 16px rgba(0,0,0,.3))"
          : "drop-shadow(0 4px 6px rgba(0,0,0,.2))",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      {...listeners}
      {...attributes}
    >
      <StickerBadge kind={sticker.kind} size={BASE} />

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className="touch-show-block bg-ink/70 text-paper absolute -right-2 -top-2 hidden size-5 place-items-center rounded-full group-hover:grid"
        aria-label="Quitar sticker"
      >
        <X className="size-3" />
      </button>

      {/* resize handle */}
      <div
        onPointerDown={handleResizeStart}
        className="touch-show-block border-ink/40 absolute -bottom-1.5 -right-1.5 hidden size-3.5 cursor-nwse-resize rounded-full border-2 bg-white group-hover:block"
        aria-label="Redimensionar sticker"
        title="Arrastra para redimensionar"
      />
    </div>
  );
}
