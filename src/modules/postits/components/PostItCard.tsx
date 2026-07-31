import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PostIt } from "@/shared/types/board";
import { POSTIT_STYLES } from "../constants";

interface PostItCardProps {
  postit: PostIt;
  onChange: (text: string) => void;
  onFocus: () => void;
  onRemove: () => void;
}

export function PostItCard({
  postit,
  onChange,
  onFocus,
  onRemove,
}: PostItCardProps) {
  const [editing, setEditing] = useState(false);
  const style = POSTIT_STYLES[postit.color];

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: postit.id, disabled: editing });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group absolute w-40 h-40 select-none",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{
        left: postit.x,
        top: postit.y,
        zIndex: postit.zIndex,
        transform: `${CSS.Translate.toString(transform) ?? ""} rotate(${postit.rotation}deg)`,
        filter: isDragging
          ? "drop-shadow(0 16px 20px rgba(0,0,0,.28))"
          : "drop-shadow(0 6px 10px rgba(0,0,0,.18))",
      }}
      onPointerDown={onFocus}
    >
      <div
        className="relative h-full w-full"
        style={{ backgroundColor: style.bg }}
      >
        {/* folded corner */}
        <div
          className="absolute bottom-0 right-0 h-6 w-6"
          style={{
            background: `linear-gradient(135deg, transparent 50%, ${style.fold} 50%)`,
          }}
        />

        {/* drag handle strip */}
        <div
          className="h-6 w-full cursor-grab active:cursor-grabbing"
          {...listeners}
          {...attributes}
        />

        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1 top-1 rounded p-0.5 text-ink/40 opacity-0 transition hover:bg-black/10 hover:text-ink group-hover:opacity-100"
          aria-label="Eliminar post-it"
        >
          <X className="size-3.5" />
        </button>

        <textarea
          value={postit.text}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setEditing(true);
            onFocus();
          }}
          onBlur={() => setEditing(false)}
          placeholder="Escribe…"
          className="font-hand text-ink h-[calc(100%-1.5rem)] w-full resize-none bg-transparent px-3 pb-3 text-lg leading-tight outline-none placeholder:text-ink/30"
        />
      </div>
    </div>
  );
}
