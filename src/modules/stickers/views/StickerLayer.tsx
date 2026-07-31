import { useBoardStore } from "@/modules/desk/store/useBoardStore";
import { PlacedSticker } from "../components/PlacedSticker";

/** Full-desk overlay that holds stickers already placed on the board. */
export function StickerLayer() {
  const stickers = useBoardStore((s) => s.stickers);
  const removeSticker = useBoardStore((s) => s.removeSticker);

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {stickers.map((s) => (
        <PlacedSticker
          key={s.id}
          sticker={s}
          onRemove={() => removeSticker(s.id)}
        />
      ))}
    </div>
  );
}
