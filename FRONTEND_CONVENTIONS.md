# Frontend Conventions (Notebook)

Adapted from `vooster-app/frontend`, trimmed for a Vite SPA. Goal: keep the app
modular by feature, separate data/state/view, and keep views free of transport.

## Top-level structure

- `src/components/ui/` — low-level shadcn primitives (Button, Sheet, Tooltip…).
- `src/shared/` — reusable, domain-agnostic UI, hooks, types (`shared/types/board.ts`).
- `src/platform/` — transversal runtime: `platform/supabase/` (client, schema).
- `src/modules/<feature>/` — business features. Current modules:
  - `desk` — composition owner: `views/Desk.tsx`, `store/useBoardStore.ts`, `components/DateBadge.tsx`.
  - `notebook` — flip-page notebook: `views/NotebookView.tsx`, `components/NotebookPageSheet.tsx`.
  - `postits` — free-move post-it wall: `views/PostItWall.tsx`, `components/PostItCard.tsx`.
  - `stickers` — tray + placed stickers: `catalog.ts`, `components/*`, `views/StickerLayer.tsx`.
- `src/lib/` — framework utilities (`utils.ts` → `cn`).
- `src/styles/globals.css` — Tailwind v4 entry + design tokens.

There is intentionally **no `src/app`** (that was Next-specific in vooster).
Entry is `src/main.tsx` → `App.tsx` → `modules/desk`.

## Layering

`service → hook (react-query) → store (zustand) / vm → view`

- Views must not talk to Supabase directly or parse payloads.
- `platform/supabase/client.ts` exposes `supabase` (nullable) and `isSupabaseEnabled`.
  Until credentials exist, state persists to localStorage via the zustand store;
  services must guard on `isSupabaseEnabled` before querying.
- The board state (`useBoardStore`) is the single source of truth the views read.

## State ownership

- Board data (post-its, stickers, pages, positions) → `modules/desk/store/useBoardStore.ts`
  (zustand + `persist`). Supabase sync is the next layer, added per module under
  `modules/<feature>/services/` + `query/`.

## UI rules

- Consume tokens from `globals.css`; do not hardcode colors/spacing/radii.
- Reuse `components/ui` and module components before adding abstractions.
- Icon-only buttons need `aria-label`; keep focus visible; respect `prefers-reduced-motion`.
- Apply the `notebook-ui` design skill for substantial UI work.
