import { stickerByKind } from "../catalog";

interface StickerBadgeProps {
  kind: string;
  size?: number;
}

/** Playful hand-drawn style badge rendered from catalog data. */
export function StickerBadge({ kind, size = 72 }: StickerBadgeProps) {
  const def = stickerByKind(kind);
  return (
    <div
      className="grid place-items-center rounded-2xl text-center font-bold leading-none shadow-[0_3px_6px_rgba(0,0,0,.2)]"
      style={{
        width: size,
        height: size,
        backgroundColor: def.bg,
        color: def.fg,
        border: "2px solid rgba(255,255,255,.7)",
        transform: "rotate(-2deg)",
        padding: 6,
        fontSize: def.label.length > 4 ? size * 0.16 : size * 0.24,
        fontFamily: "var(--font-round)",
      }}
    >
      {def.label}
    </div>
  );
}
