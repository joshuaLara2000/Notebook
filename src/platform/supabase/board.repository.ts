import { supabase } from "@/platform/supabase/client";
import type {
  NotebookPage,
  NotebookStyle,
  PostIt,
  PostItColor,
  StickerInstance,
} from "@/shared/types/board";

// Snapshot completo del tablero de un usuario.
export interface BoardData {
  pages: NotebookPage[];
  postits: PostIt[];
  stickers: StickerInstance[];
  notebookStyle: NotebookStyle;
}

// Formas de fila tal como viven en la DB (snake_case).
interface PageRow {
  id: string;
  page_index: number;
  date: string | null;
  content: string;
  urgent: string;
}
interface PostitRow {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  archived: boolean;
  updated_at: string | null;
}
interface StickerRow {
  id: string;
  kind: string;
  page_id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  z_index: number;
}

// ---- dominio -> fila (agrega user_id para pasar RLS) ----
const toPageRow = (p: NotebookPage, userId: string) => ({
  id: p.id,
  user_id: userId,
  page_index: p.index,
  date: p.date ? p.date.slice(0, 10) : null,
  content: p.content,
  urgent: p.urgent,
});
const toPostitRow = (p: PostIt, userId: string) => ({
  id: p.id,
  user_id: userId,
  text: p.text,
  color: p.color,
  x: p.x,
  y: p.y,
  width: p.width,
  height: p.height,
  rotation: p.rotation,
  z_index: p.zIndex,
  archived: p.archived,
  updated_at: p.updatedAt,
});
const toStickerRow = (s: StickerInstance, userId: string) => ({
  id: s.id,
  user_id: userId,
  kind: s.kind,
  page_id: s.pageId,
  x: s.x,
  y: s.y,
  rotation: s.rotation,
  scale: s.scale,
  z_index: s.zIndex,
});

// ---- fila -> dominio ----
const fromPageRow = (r: PageRow): NotebookPage => ({
  id: r.id,
  index: r.page_index,
  date: r.date ? new Date(`${r.date}T00:00:00`).toISOString() : null,
  content: r.content ?? "",
  urgent: r.urgent ?? "",
});
const fromPostitRow = (r: PostitRow): PostIt => ({
  id: r.id,
  text: r.text ?? "",
  color: (r.color ?? "yellow") as PostItColor,
  x: r.x,
  y: r.y,
  width: r.width,
  height: r.height,
  rotation: r.rotation,
  zIndex: r.z_index,
  archived: r.archived,
  updatedAt: r.updated_at ?? new Date().toISOString(),
});
const fromStickerRow = (r: StickerRow): StickerInstance => ({
  id: r.id,
  kind: r.kind,
  pageId: r.page_id,
  x: r.x,
  y: r.y,
  rotation: r.rotation,
  scale: r.scale,
  zIndex: r.z_index,
});

// Carga todo el tablero del usuario logueado (RLS limita a sus filas).
export async function loadBoard(): Promise<BoardData> {
  if (!supabase) {
    return { pages: [], postits: [], stickers: [], notebookStyle: "ruled" };
  }
  const [pagesRes, postitsRes, stickersRes, settingsRes] = await Promise.all([
    supabase.from("pages").select("*").order("page_index", { ascending: true }),
    supabase.from("postits").select("*"),
    supabase.from("stickers").select("*"),
    supabase.from("board_settings").select("notebook_style").maybeSingle(),
  ]);
  return {
    pages: ((pagesRes.data as PageRow[]) ?? []).map(fromPageRow),
    postits: ((postitsRes.data as PostitRow[]) ?? []).map(fromPostitRow),
    stickers: ((stickersRes.data as StickerRow[]) ?? []).map(fromStickerRow),
    notebookStyle: (settingsRes.data?.notebook_style ?? "ruled") as NotebookStyle,
  };
}

// Borra en `table` las filas del usuario cuyo id ya no está en `ids`.
async function deleteMissing(table: string, ids: string[]) {
  if (!supabase) return;
  const query = supabase.from(table).delete();
  const res = ids.length
    ? await query.not("id", "in", `(${ids.join(",")})`)
    : await query.neq("id", ""); // sin ids: borra todas las del usuario (RLS)
  if (res.error) console.warn(`sync delete ${table}:`, res.error.message);
}

// Guarda el tablero: upsert de todo + borra lo eliminado. Orden: pages antes que
// stickers (FK), y borrar stickers antes que pages.
export async function saveBoard(userId: string, data: BoardData) {
  if (!supabase) return;

  const results = await Promise.all([
    supabase.from("pages").upsert(data.pages.map((p) => toPageRow(p, userId))),
    supabase
      .from("postits")
      .upsert(data.postits.map((p) => toPostitRow(p, userId))),
    supabase
      .from("board_settings")
      .upsert(
        {
          user_id: userId,
          notebook_style: data.notebookStyle,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      ),
  ]);
  // stickers después de pages (respeta la FK page_id)
  results.push(
    await supabase
      .from("stickers")
      .upsert(data.stickers.map((s) => toStickerRow(s, userId)))
  );
  for (const r of results) {
    if (r.error) console.warn("sync upsert:", r.error.message);
  }

  await deleteMissing("stickers", data.stickers.map((s) => s.id));
  await deleteMissing("postits", data.postits.map((p) => p.id));
  await deleteMissing("pages", data.pages.map((p) => p.id));
}
