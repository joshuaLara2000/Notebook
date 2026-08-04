import { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ListOrdered, Search } from "lucide-react";

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
import { htmlToPlainText } from "@/shared/utils/richText";
import { MOD_LABEL, useHotkeys } from "@/shared/hooks/useHotkeys";
import { useBoardStore } from "@/modules/desk/store/useBoardStore";

interface NotebookIndexProps {
  onGoToPage: (index: number) => void;
}

export function NotebookIndex({ onGoToPage }: NotebookIndexProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const pages = useBoardStore((s) => s.pages);

  // Atajo: abrir/cerrar el índice de hojas.
  useHotkeys([
    { combo: "mod+k", handler: () => setOpen((o) => !o), allowInInput: true },
  ]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pages
      .map((p, index) => ({
        id: p.id,
        index,
        date: p.date,
        preview: htmlToPlainText(p.content),
      }))
      .filter((p) => (q ? p.preview.toLowerCase().includes(q) : true));
  }, [pages, query]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1 rounded-full"
          title={`Índice de hojas (${MOD_LABEL}K)`}
        >
          <ListOrdered className="size-4" /> Índice
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-96 max-w-[92vw] gap-0"
        onOpenAutoFocus={(e) => {
          // enfoca el buscador al abrir para escribir sin clic
          e.preventDefault();
          searchRef.current?.focus();
        }}
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Índice</SheetTitle>
          <SheetDescription>Salta a cualquier hoja o busca por contenido.</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="text-ink/40 pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en las hojas…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-6">
          {rows.length === 0 ? (
            <p className="text-ink-soft mt-8 text-center text-sm">
              {query ? "Ninguna hoja coincide." : "No hay hojas."}
            </p>
          ) : (
            rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => {
                  onGoToPage(row.index);
                  setOpen(false);
                }}
                className="border-border bg-paper/60 hover:bg-paper shrink-0 rounded-xl border p-3 text-left shadow-sm transition"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-ink font-semibold">
                    Hoja {row.index + 1}
                  </span>
                  <span className="text-ink-soft text-xs">
                    {row.date
                      ? format(new Date(row.date), "dd MMM yyyy", { locale: es })
                      : ""}
                  </span>
                </div>
                <p
                  className={
                    row.preview
                      ? "text-ink font-hand line-clamp-2 text-base leading-snug"
                      : "text-ink/40 font-hand text-base italic"
                  }
                >
                  {row.preview || "(hoja vacía)"}
                </p>
              </button>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
