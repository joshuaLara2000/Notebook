import { useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";

import type { PostIt } from "@/shared/types/board";
import { POSTIT_STYLES } from "../constants";
import { htmlToPlainText } from "@/shared/utils/richText";
import { RichTextArea } from "@/shared/ui/RichTextArea";
import { RichToolbar } from "@/shared/ui/RichToolbar";
import { detectInsights } from "../lib/insights";
import { InsightsRow } from "./InsightsRow";
import { NoteMarkedView } from "./NoteMarkedView";

interface NoteListCardProps {
  postit: PostIt;
  onChange: (html: string) => void;
  onArchive: () => void;
  onDelete: () => void;
}

/**
 * A post-it rendered as a flowing card for the phone "Notas" list (option A):
 * no free dragging, but it keeps the paper color, the inline date highlights /
 * insights and tap-to-edit. Grows with its content instead of scrolling inside
 * a fixed box.
 */
export function NoteListCard({
  postit,
  onChange,
  onArchive,
  onDelete,
}: NoteListCardProps) {
  const [editing, setEditing] = useState(false);
  const [autoFocus, setAutoFocus] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const style = POSTIT_STYLES[postit.color];

  const hasText = useMemo(
    () => htmlToPlainText(postit.text).length > 0,
    [postit.text]
  );
  const insights = useMemo(
    () => detectInsights(htmlToPlainText(postit.text)),
    [postit.text]
  );
  const showEditor = editing || !hasText;

  const enterEdit = () => {
    setAutoFocus(true);
    setEditing(true);
  };

  return (
    <div
      className="relative flex h-full flex-col rounded-2xl pt-2 shadow-md"
      style={{ backgroundColor: style.bg }}
    >
      {/* contenido: crece para llenar la tarjeta (así en el grid, con tarjetas
          de igual alto por fila, los botones quedan siempre pegados abajo) */}
      <div className="min-h-20 flex-1">
        {showEditor ? (
          <RichTextArea
            html={postit.text}
            onChange={onChange}
            onEditingChange={(v) => {
              setEditing(v);
              if (!v) setAutoFocus(false);
            }}
            autoFocus={autoFocus}
            placeholder="Escribe…"
            className="font-hand text-postit-ink text-lg leading-tight"
          />
        ) : (
          <NoteMarkedView
            html={postit.text}
            onEdit={enterEdit}
            className="font-hand text-postit-ink text-lg leading-tight"
          />
        )}
      </div>

      {/* formatting while editing, actionable insights otherwise */}
      {editing ? (
        <RichToolbar />
      ) : (
        insights.length > 0 && <InsightsRow insights={insights} />
      )}

      {/* acciones: archivar (guardar en "Todas") o eliminar (con confirmación) */}
      <div className="flex items-center justify-end gap-1 px-2 pb-1.5">
        {confirming ? (
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={onDelete}
              className="bg-destructive rounded-full px-3 py-1 text-xs font-semibold text-white"
            >
              Eliminar
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-postit-ink/70 rounded-full px-3 py-1 text-xs"
            >
              Cancelar
            </button>
          </span>
        ) : (
          <>
            {/* archiva la nota: sale de la lista pero se guarda y se restaura en "Todas" */}
            <button
              type="button"
              onClick={onArchive}
              aria-label="Guardar nota (se restaura desde Todas)"
              title="Guardar (quitar de la lista)"
              className="text-postit-ink/50 grid size-9 place-items-center rounded-full hover:bg-black/10"
            >
              <X className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label="Eliminar nota"
              className="text-postit-ink/50 grid size-9 place-items-center rounded-full hover:bg-black/10"
            >
              <Trash2 className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
