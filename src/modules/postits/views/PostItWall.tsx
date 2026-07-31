import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBoardStore } from "@/modules/desk/store/useBoardStore";
import { PostItCard } from "../components/PostItCard";

export function PostItWall() {
  const postits = useBoardStore((s) => s.postits);
  const addPostIt = useBoardStore((s) => s.addPostIt);
  const updatePostIt = useBoardStore((s) => s.updatePostIt);
  const bringToFront = useBoardStore((s) => s.bringToFront);
  const removePostIt = useBoardStore((s) => s.removePostIt);

  return (
    <section className="relative h-full w-full overflow-hidden">
      <header className="pointer-events-none absolute left-5 top-16 z-10 flex items-center gap-3">
        <h2 className="text-ink/70 text-2xl font-bold">Post-its</h2>
        <Button
          size="sm"
          variant="outline"
          className="pointer-events-auto gap-1 rounded-full"
          onClick={() => addPostIt()}
        >
          <Plus className="size-4" /> Nuevo
        </Button>
      </header>

      {postits.length === 0 && (
        <div className="text-ink/35 font-hand absolute inset-0 flex items-center justify-center text-center text-xl">
          Toca “Nuevo” para pegar tu primer post-it
        </div>
      )}

      {postits.map((p) => (
        <PostItCard
          key={p.id}
          postit={p}
          onChange={(text) => updatePostIt(p.id, { text })}
          onFocus={() => bringToFront(p.id)}
          onRemove={() => removePostIt(p.id)}
        />
      ))}
    </section>
  );
}
