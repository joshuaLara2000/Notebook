import { useMemo, useState } from "react";
import { BookOpen, Plus, StickyNote } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NoteListCard } from "@/modules/postits/components/NoteListCard";
import { NotebookView } from "@/modules/notebook/views/NotebookView";
import { AccountMenu } from "../components/AccountMenu";
import { ThemeToggle } from "../components/ThemeToggle";
import { useBoardStore } from "../store/useBoardStore";

type PhoneTab = "notas" | "libreta";

/**
 * Phone layout (option A): the free-canvas desk is replaced by a tabbed shell —
 * a scrollable list of notes and a full-width notebook — driven by a bottom tab
 * bar. Only rendered under `isPhone`; tablet/desktop keep the canvas.
 */
export function PhoneLayout() {
  const [tab, setTab] = useState<PhoneTab>("notas");

  const postits = useBoardStore((s) => s.postits);
  const addPostIt = useBoardStore((s) => s.addPostIt);
  const updatePostIt = useBoardStore((s) => s.updatePostIt);
  const removePostIt = useBoardStore((s) => s.removePostIt);

  // Notas activas (no archivadas), más recientes primero.
  const notes = useMemo(
    () =>
      [...postits]
        .filter((p) => !p.archived)
        .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")),
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
          <div className="flex flex-col gap-3 px-4 pb-24 pt-1">
            {notes.length === 0 ? (
              <p className="text-ink-soft font-hand mt-16 text-center text-xl">
                Aún no hay notas. Toca “+” para crear tu primera.
              </p>
            ) : (
              notes.map((p) => (
                <NoteListCard
                  key={p.id}
                  postit={p}
                  onChange={(text) => updatePostIt(p.id, { text })}
                  onDelete={() => removePostIt(p.id)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="flex justify-center px-2 pb-24 pt-2">
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
