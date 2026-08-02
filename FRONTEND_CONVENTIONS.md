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

## Theming & design tokens

All color/radius/font values live as CSS variables (design tokens) in
`src/styles/globals.css`. Components consume tokens; they never know the raw
value. This is why light/dark and future re-skins touch one file, not the tree.

### The four layers

1. **Raw value** — the hex lives here, once, in `:root`:
   ```css
   :root { --postit-ink: #4a4458; }
   ```
2. **Theme override** — same name, different value under `.dark` (dark mode is
   just re-pointing names; do not edit components for it):
   ```css
   .dark { --postit-ink: #33304a; }
   ```
3. **Expose to Tailwind** — register it in `@theme inline` so a utility exists:
   ```css
   @theme inline { --color-postit-ink: var(--postit-ink); }
   ```
4. **Use in components** — the utility, never the hex:
   ```tsx
   <div className="text-postit-ink">…</div>
   ```

### Primitive vs semantic tokens

- **Primitive / brand**: the raw color — `--ink`, `--postit-yellow`, `--accent-cal`.
- **Semantic**: describes a *role*, points at a primitive — `--background`,
  `--card`, `--primary`, `--border` (e.g. `--primary: var(--accent-cal)`).
- Prefer semantic tokens in components (`bg-primary`, not `bg-accent-cal`) so a
  role can be re-colored in one line.

### Adding a token

Add the raw value to `:root`, an override to `.dark` if it differs by theme, and
the `--color-*` line in `@theme inline`. Then use the utility. Example: post-its
stay light even at night, so their text needs ink that is always dark — hence a
dedicated `--postit-ink` (dark in both themes) instead of reusing `--ink` (which
flips to light in dark mode).

### Dark mode plumbing

`.dark` on `<html>` activates the overrides. The class is set before paint by an
inline script in `index.html` (respects saved choice, falls back to system
preference) and toggled at runtime by `shared/theme/useThemeStore.ts`.
