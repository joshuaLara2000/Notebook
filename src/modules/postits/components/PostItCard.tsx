import { useMemo, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PostIt } from "@/shared/types/board";
import { POSTIT_STYLES } from "../constants";
import { htmlToPlainText } from "@/shared/utils/richText";
import { RichTextArea } from "@/shared/ui/RichTextArea";
import { RichToolbar } from "@/shared/ui/RichToolbar";
import { detectInsights } from "../lib/insights";
import { InsightsRow } from "./InsightsRow";
import { NoteMarkedView } from "./NoteMarkedView";

const MIN_W = 150;
const MIN_H = 140;
const MAX = 460;

interface PostItCardProps {
  postit: PostIt;
  onChange: (html: string) => void;
  onFocus: () => void;
  /** Close the note: remove from board, keep it in the notes list. */
  onArchive: () => void;
  onResize: (width: number, height: number) => void;
}

export function PostItCard({
  postit,
  onChange,
  onFocus,
  onArchive,
  onResize,
}: PostItCardProps) {
  const [editing, setEditing] = useState(false);
  const [autoFocus, setAutoFocus] = useState(false);
  const [live, setLive] = useState<{ w: number; h: number } | null>(null);
  const liveRef = useRef<{ w: number; h: number } | null>(null);
  const style = POSTIT_STYLES[postit.color];

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: postit.id, disabled: editing });

  const insights = useMemo(
    () => detectInsights(htmlToPlainText(postit.text)),
    [postit.text]
  );
  const hasText = useMemo(
    () => htmlToPlainText(postit.text).length > 0,
    [postit.text]
  );

  // Show the marker/read view while idle (dates become clickable there); swap to
  // the editor when the note is focused or still empty (so the placeholder and
  // first click work). Entering edit from the read view auto-focuses the caret.
  const showEditor = editing || !hasText;

  const enterEdit = () => {
    setAutoFocus(true);
    setEditing(true);
    onFocus();
  };

  function handleResizeStart(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = postit.width;
    const startH = postit.height;

    const onMove = (ev: PointerEvent) => {
      const w = Math.min(MAX, Math.max(MIN_W, startW + (ev.clientX - startX)));
      const h = Math.min(MAX, Math.max(MIN_H, startH + (ev.clientY - startY)));
      const next = { w, h };
      liveRef.current = next;
      setLive(next);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (liveRef.current) onResize(liveRef.current.w, liveRef.current.h);
      liveRef.current = null;
      setLive(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const width = live?.w ?? postit.width;
  const height = live?.h ?? postit.height;

  // Drag the whole note (top, sides, footer) — combine dnd's pointerdown with
  // bring-to-front. Text and controls stop propagation so they don't drag.
  const listenerPointerDown = listeners?.onPointerDown as
    | ((e: React.PointerEvent) => void)
    | undefined;
  const handleContainerPointerDown = (e: React.PointerEvent) => {
    listenerPointerDown?.(e);
    onFocus();
  };
  const stop = (e: React.PointerEvent) => e.stopPropagation();

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onPointerDown={handleContainerPointerDown}
      className={cn(
        // touch-none: el gesto lo maneja dnd-kit, no el navegador (el área de
        // texto vuelve a touch-auto para poder hacer scroll/seleccionar).
        "group pointer-events-auto absolute touch-none select-none",
        editing ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{
        left: postit.x,
        top: postit.y,
        width,
        height,
        zIndex: postit.zIndex,
        transform: `${CSS.Translate.toString(transform) ?? ""} rotate(${postit.rotation}deg)`,
      }}
    >
      <div
        className="relative flex h-full w-full flex-col"
        style={{
          backgroundColor: style.bg,
          // box-shadow (not filter: drop-shadow) — avoids Safari repaint
          // trails when the note is dragged or resized.
          boxShadow: isDragging
            ? "0 16px 24px rgba(0,0,0,.28)"
            : "0 6px 12px rgba(0,0,0,.18)",
        }}
      >
        {/* header grip (drag handle) */}
        <div className="flex h-7 w-full shrink-0 items-center justify-center">
          <span className="h-1 w-8 rounded-full bg-black/10 opacity-0 transition group-hover:opacity-100" />
        </div>

        <button
          type="button"
          onPointerDown={stop}
          onClick={onArchive}
          className="touch-show absolute right-1 top-1 rounded p-0.5 text-postit-ink/40 opacity-0 transition hover:bg-black/10 hover:text-postit-ink group-hover:opacity-100"
          aria-label="Quitar del tablero (se guarda en la lista)"
          title="Quitar del tablero"
        >
          <X className="size-3.5" />
        </button>

        {/*
          Text area stops propagation so clicking/selecting text never drags
          the note. The note is dragged from everything else — the header grip,
          the footer, and the side margins — so both the top and bottom bands
          work as drag handles.
        */}
        <div className="min-h-0 flex-1 touch-auto" onPointerDown={stop}>
          {showEditor ? (
            <RichTextArea
              html={postit.text}
              onChange={onChange}
              onEditingChange={(v) => {
                setEditing(v);
                if (v) onFocus();
                else setAutoFocus(false);
              }}
              autoFocus={autoFocus}
              placeholder="Escribe…"
              className="font-hand text-postit-ink h-full text-lg leading-tight"
            />
          ) : (
            <NoteMarkedView
              html={postit.text}
              onEdit={enterEdit}
              className="font-hand text-postit-ink text-lg leading-tight"
            />
          )}
        </div>

        {/* bottom: formatting while editing, actionable insights otherwise */}
        {editing ? (
          <RichToolbar />
        ) : (
          insights.length > 0 && <InsightsRow insights={insights} />
        )}

        {/* resize handle */}
        <div
          onPointerDown={handleResizeStart}
          className="touch-show touch-resize absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize opacity-40 transition group-hover:opacity-80"
          style={{
            background: `linear-gradient(135deg, transparent 55%, ${style.fold} 55%)`,
          }}
          aria-label="Redimensionar nota"
          title="Arrastra para redimensionar"
        />
      </div>
    </div>
  );
}
