import { useMemo } from "react";

import { useBoardStore } from "@/modules/desk/store/useBoardStore";
import { PlacedSticker } from "../components/PlacedSticker";

/**
 * Overlay que va justo encima de la libreta (mismo tamaño), recortado a su área.
 * Muestra solo los stickers de la hoja actual, posicionados relativo a la hoja.
 */
export function StickerLayer() {
  const stickers = useBoardStore((s) => s.stickers);
  const currentPageId = useBoardStore((s) => s.currentPageId);
  const resizeSticker = useBoardStore((s) => s.resizeSticker);
  const removeSticker = useBoardStore((s) => s.removeSticker);

  const visible = useMemo(
    () => stickers.filter((s) => s.pageId === currentPageId),
    [stickers, currentPageId]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {visible.map((s) => (
        <PlacedSticker
          key={s.id}
          sticker={s}
          onResize={(scale) => resizeSticker(s.id, scale)}
          onRemove={() => removeSticker(s.id)}
        />
      ))}
    </div>
  );
}
