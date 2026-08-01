import { useMemo, useRef, useState } from "react";
import {
  ListChecks,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { MOD_LABEL, useHotkeys } from "@/shared/hooks/useHotkeys";
import type { PostItColor } from "@/shared/types/board";
import { useBoardStore, POSTIT_COLORS } from "@/modules/desk/store/useBoardStore";
import { POSTIT_STYLES } from "../constants";
import { htmlToPlainText } from "@/shared/utils/richText";

export function NotesSheet() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Atajo: abrir/cerrar el panel de notas.
  useHotkeys([
    { combo: "mod+j", handler: () => setOpen((o) => !o), allowInInput: true },
  ]);

  const postits = useBoardStore((s) => s.postits);
  const restorePostIt = useBoardStore((s) => s.restorePostIt);
  const bringToFront = useBoardStore((s) => s.bringToFront);
  const setPostItColor = useBoardStore((s) => s.setPostItColor);
  const removePostIt = useBoardStore((s) => s.removePostIt);

  const notes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...postits]
      .map((p) => ({ ...p, plain: htmlToPlainText(p.text) }))
      .filter((p) => (q ? p.plain.toLowerCase().includes(q) : true))
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  }, [postits, query]);

  const archivedCount = postits.filter((p) => p.archived).length;

  function handleRowClick(id: string, archived: boolean) {
    if (archived) {
      restorePostIt(id);
    } else {
      bringToFront(id);
    }
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1 rounded-full"
          title={`Todas las notas (${MOD_LABEL}J)`}
        >
          <ListChecks className="size-4" /> Todas
          {archivedCount > 0 && (
            <span className="bg-primary text-primary-foreground ml-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs">
              {archivedCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-96 gap-0"
        onOpenAutoFocus={(e) => {
          // enfoca el buscador al abrir para escribir sin clic
          e.preventDefault();
          searchRef.current?.focus();
        }}
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Todas las notas</SheetTitle>
          <SheetDescription>
            Cerrar una nota la quita del tablero pero la guarda aquí.
          </SheetDescription>
        </SheetHeader>

        {/* search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="text-ink/40 pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en el contenido…"
              className="pl-9"
            />
          </div>
        </div>

        {/* list */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-6">
          {notes.length === 0 ? (
            <p className="text-ink-soft mt-8 text-center text-sm">
              {query
                ? "Ninguna nota coincide con tu búsqueda."
                : "Aún no hay notas. Crea una con “Nuevo”."}
            </p>
          ) : (
            notes.map((p) => {
              const style = POSTIT_STYLES[p.color];
              const isConfirming = confirmingId === p.id;
              return (
                <div
                  key={p.id}
                  className="group border-border bg-paper/60 hover:bg-paper relative shrink-0 overflow-hidden rounded-xl border shadow-sm transition"
                >
                  {/* color bar */}
                  <span
                    className="absolute inset-y-0 left-0 w-1.5"
                    style={{ backgroundColor: style.bg }}
                  />

                  <button
                    type="button"
                    onClick={() => handleRowClick(p.id, p.archived)}
                    className="block w-full pl-4 pr-3 pt-3 text-left"
                  >
                    <p
                      className={cn(
                        "font-hand line-clamp-2 text-lg leading-snug",
                        p.plain ? "text-ink" : "text-ink/40 italic"
                      )}
                    >
                      {p.plain || "(nota vacía)"}
                    </p>
                    <span className="text-ink-soft mt-1 block text-xs">
                      {p.archived ? "Guardada" : "En el tablero"}
                    </span>
                  </button>

                  {/* actions */}
                  <div className="flex items-center justify-between px-3 pb-2 pt-1.5">
                    {/* recolor */}
                    <div className="flex items-center gap-1">
                      {POSTIT_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setPostItColor(p.id, c as PostItColor)}
                          aria-label={`Color ${c}`}
                          className={cn(
                            "size-4 rounded-full border transition",
                            p.color === c
                              ? "ring-primary border-transparent ring-2"
                              : "border-black/10 hover:scale-110"
                          )}
                          style={{ backgroundColor: POSTIT_STYLES[c].bg }}
                        />
                      ))}
                    </div>

                    {/* restore + delete */}
                    <div className="flex items-center gap-1">
                      {p.archived && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1 rounded-full px-2 text-xs"
                          onClick={() => {
                            restorePostIt(p.id);
                            setOpen(false);
                          }}
                        >
                          <RotateCcw className="size-3.5" /> Restaurar
                        </Button>
                      )}
                      {isConfirming ? (
                        <span className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 rounded-full px-2 text-xs"
                            onClick={() => {
                              removePostIt(p.id);
                              setConfirmingId(null);
                            }}
                          >
                            Eliminar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 rounded-full px-2 text-xs"
                            onClick={() => setConfirmingId(null)}
                          >
                            Cancelar
                          </Button>
                        </span>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-ink/40 hover:text-destructive size-7 rounded-full"
                          onClick={() => setConfirmingId(p.id)}
                          aria-label="Eliminar definitivamente"
                          title="Eliminar definitivamente"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
