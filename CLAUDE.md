# Notebook — Project Guide

Digital stationery desk: a flip-page notebook (right), free-moving post-its
(left), a draggable sticker tray, and a floating date badge. Vite + React 19 +
TypeScript + Tailwind v4 + shadcn/ui, with Supabase for persistence.

Conventions here are adapted from `Astroline/vooster-app/frontend` (module
layering, shared/ui, tokens, i18n-ready). The framework differs on purpose:
this is a Vite SPA, so there is no Next `src/app` route layer.

## Before working

1. Read `FRONTEND_CONVENTIONS.md` for structure and layering.
2. For any substantial UI creation, redesign, or review, apply the design skill
   at `.agents/skills/notebook-ui/SKILL.md` (stub at `.claude/skills/notebook-ui`).
   Its `references/design-brief.md` is the aesthetic contract.

## Rules

- TypeScript everywhere; avoid `any`.
- Feature code consumes design tokens from `src/styles/globals.css` — never raw hex.
  See "Theming & design tokens" in `FRONTEND_CONVENTIONS.md` for the layering,
  primitive vs semantic tokens, how to add one, and the dark-mode pattern.
- Keep transport (Supabase) out of views; go through `services → hooks → store → view`.
- Import with the `@/` alias.
