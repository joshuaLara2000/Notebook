---
name: notebook-ui
description: Design, build, and review the Notebook app's interface — a playful digital stationery desk (flip-page notebook, free-moving post-its, draggable stickers, floating date). Use when creating or materially changing React screens, the desk composition, post-it/sticker interactions, the notebook page, motion, or shared UI; when choosing between sheets, overlays, and drag surfaces; or when fixing UI that feels flat, generic, or off-brand for a stationery aesthetic.
---

# Notebook UI

## Mission

Make a digital desk that feels like real stationery: paper you can write on, post-its you move by hand, stickers you peel and place. Optimize first for the *tactile, delightful* feeling, then for clarity. Motion, texture, and hierarchy are the product here — not decoration to be stripped.

This is the inverse of a dense B2B tool. The process below is adapted from the `vooster-product-ui` skill (states, accessibility, structure), but the **aesthetic brief in [references/design-brief.md](references/design-brief.md) overrides any "visual restraint / anti-decoration" instinct** carried over from that origin.

## Required context before substantial UI work

1. Read [references/design-brief.md](references/design-brief.md) — the aesthetic contract (palette, texture, motion, typography).
2. Inspect `src/styles/globals.css` for design tokens. **Consume tokens, never raw hex** in feature code.
3. Reuse `src/components/ui` primitives (shadcn) and `src/modules/*/components` before inventing new abstractions.
4. Follow the module layering in [../../../FRONTEND_CONVENTIONS.md](../../../FRONTEND_CONVENTIONS.md): `service → hook → store/vm → view`.

## Workflow

### 1. Frame the interaction

The unit of value is an *interaction*, not a screen. For any change, record:

- What the user is doing with their hands (writing, dragging, flipping, peeling).
- The physical metaphor it imitates, and what would break the illusion (a hard cut where paper should ease, a sticker with no shadow, snapping where there should be inertia).
- P1 affordance (what must be obviously grabbable/tappable) vs P2 (revealed on hover/focus) vs P3 (in a sheet or menu).
- Required states: empty, editing, dragging, saving/synced, offline (localStorage fallback), error.

### 2. Choose the surface

- **Free-move objects** (post-its, placed stickers): absolute position, own shadow and slight rotation, z-index to front on interact. This is the one legitimate place for many independent "cards."
- **Focused primary object** (the notebook): a single dominant anchor, centered, with real page-turn motion.
- **On-demand collections** (sticker tray): a `Sheet`, not a permanent panel.
- **Ambient status** (date): small floating badge, high z-index, never in the flow.

### 3. Compose, then make it tactile

Grayscale structure first (where things live, reading order), then apply the design brief: paper texture, layered soft shadows, hand-drawn type, eased motion. Every elevated object needs a shadow consistent with its height off the desk.

### 4. Keep it trustworthy

Even a playful app must not lie about state. Read [references/states-and-feedback.md](references/states-and-feedback.md):

- Never show a failed save as an endless spinner.
- Persistence is real: writing to a post-it or page must survive reload (localStorage now, Supabase when connected). If a write fails, say so.
- Distinguish "empty" (no post-its yet — invite) from "loading" from "sync error".

### 5. Accessibility inside the playfulness

- Everything draggable is also operable by keyboard/click where feasible; drag is an enhancement, not the only path to an action (add, edit, delete).
- Visible focus, real labels (`aria-label` on icon buttons), sufficient contrast of ink on paper and text on stickers.
- Respect `prefers-reduced-motion`: reduce page-flip and drag easing, don't remove function.

### 6. Review before done

Read [references/review-checklist.md](references/review-checklist.md) for structure/state/accessibility, then also confirm the brief: does it *feel* like stationery, is the notebook the clear anchor, do shadows/rotation read as physical, is motion eased not linear.

## Blocking conditions

- The desk feels like flat web cards instead of physical objects.
- A draggable object has no shadow/rotation, or all objects share one flat elevation.
- Motion is linear/instant where a physical ease is expected (page flip, drop).
- Writing or placement is lost on reload, or a failed save looks like success.
- Icon-only controls lack labels; focus is invisible; sticker text fails contrast.
- Raw hex introduced in feature code instead of a token in `globals.css`.
- The sticker tray or date is promoted into permanent layout instead of a sheet/badge.

## Output behavior

- **Design request**: return the interaction frame, surface choice, and the brief elements you'll apply; recommend one direction.
- **Implement request**: build it, keep tokens/primitives, verify states and reload persistence, summarize the interaction decisions.
- **Review request**: for each issue give evidence, user/feel impact, and the smallest fix; structural and state issues before cosmetics.
