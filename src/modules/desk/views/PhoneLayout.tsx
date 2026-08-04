import { useMemo, useState } from "react";
import { BookOpen, Plus, StickyNote } from "lucide-react";

import { cn } from "@/lib/utils";
import { htmlToPlainText } from "@/shared/utils/richText";
import { Button } from "@/components/ui/button";
import { NoteListCard } from "@/modules/postits/components/NoteListCard";
import { NotesSheet } from "@/modules/postits/components/NotesSheet";
import { NotebookView } from "@/modules/notebook/views/NotebookView";
import { StickerSheet } from "@/modules/stickers/components/StickerSheet";
import { AccountMenu } from "../components/AccountMenu";
import { ThemeToggle } from "../components/ThemeToggle";
import { useBoardStore } from "../store/useBoardStore";

type PhoneTab = "notas" | "libreta";

/**
 * Compact layout (option A): the free-canvas desk is replaced by a tabbed shell —
 * a scrollable list of notes and a full-width notebook — driven by a bottom tab
 * bar. Rendered under `isCompact` (phone + tablet portrait); tablet landscape
 * and desktop keep the canvas.
 */
export function PhoneLayout() {
  const [tab, setTab] = useState<PhoneTab>("notas");

  const postits = useBoardStore((s) => s.postits);
  const addPostIt = useBoardStore((s) => s.addPostIt);
  const updatePostIt = useBoardStore((s) => s.updatePostIt);
  const archivePostIt = useBoardStore((s) => s.archivePostIt);
  const removePostIt = useBoardStore((s) => s.removePostIt);

  // Guardar una nota la saca de la lista pero la conserva (restaurable en
  // "Todas"); si está vacía no vale la pena conservarla, se descarta.
  const closeNote = (id: string, html: string) => {
    if (htmlToPlainText(html)) archivePostIt(id);
    else removePostIt(id);
  };

  // Notas activas (no archivadas). Orden por inserción invertido (más nuevas
  // primero) — estable: NO se ordena por updatedAt, así editar una nota no la
  // reubica; se queda en su lugar.
  const notes = useMemo(
    () => postits.filter((p) => !p.archived).reverse(),
    [postits]
  );

  return (
    <div className="pointer-events-auto flex h-full flex-col">
      {/* header compacto */}
      <header
        className="flex shrink-0 items-center justify-between gap-2 px-4 py-3"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <h1 className="text-ink text-xl font-bold">Mi libreta</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AccountMenu />
        </div>
      </header>

      {/* contenido */}
      <main className="min-h-0 flex-1 overflow-y-auto">
        {tab === "notas" ? (
          <div className="px-4 pb-24 pt-1">
            {/* CTA: ver/buscar todas las notas (incluye archivadas), como en desktop */}
            <div className="mb-3 flex justify-end">
              <NotesSheet />
            </div>
            {notes.length === 0 ? (
              <p className="text-ink-soft font-hand mt-12 text-center text-xl">
                Aún no hay notas. Toca “+” para crear tu primera.
              </p>
            ) : (
              // 1 columna en teléfono; 2 en tablet vertical para no verse estiradas
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {notes.map((p) => (
                  <NoteListCard
                    key={p.id}
                    postit={p}
                    onChange={(text) => updatePostIt(p.id, { text })}
                    onArchive={() => closeNote(p.id, p.text)}
                    onDelete={() => removePostIt(p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center px-2 pb-24 pt-2">
            {/* CTA: pegar stickers en la hoja, como en desktop */}
            <div className="mb-2 flex w-full justify-end px-1">
              <StickerSheet />
            </div>
            <NotebookView />
          </div>
        )}
      </main>

      {/* botón flotante para crear nota (solo en la pestaña Notas) */}
      {tab === "notas" && (
        <Button
          size="icon"
          onClick={() => addPostIt()}
          aria-label="Nueva nota"
          className="absolute bottom-24 right-5 z-10 size-14 rounded-full shadow-lg"
        >
          <Plus className="size-6" />
        </Button>
      )}

      {/* tab bar inferior */}
      <nav
        className="bg-paper/90 flex shrink-0 items-stretch border-t backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {(
          [
            { id: "notas", label: "Notas", icon: StickyNote },
            { id: "libreta", label: "Libreta", icon: BookOpen },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition",
              tab === id ? "text-primary" : "text-ink/50"
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
