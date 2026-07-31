import { useMemo } from "react";

import { useBoardStore } from "@/modules/desk/store/useBoardStore";
import { PlacedSticker } from "../components/PlacedSticker";

/** Overlay that shows only the stickers belonging to the current notebook page. */
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
    <div className="pointer-events-none absolute inset-0 z-30 isolate">
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
