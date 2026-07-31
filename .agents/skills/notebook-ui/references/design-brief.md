# Design brief — playful stationery

The aesthetic contract for Notebook. This **overrides** any "reduce decoration / anti-carditis / no motion" instinct inherited from the vooster B2B skill. Here, texture and motion are the product.

## Feeling

A real desk seen from above: warm paper, sticky notes at slight angles, peel-and-stick stickers, a tear-off calendar. Cozy, handmade, a little imperfect. Never sterile, never corporate.

## Palette (tokens in `src/styles/globals.css`)

- Desk background: `--desk` warm neutral with a faint dotted texture.
- Paper: `--paper` cream white with `--paper-line` ruled lines and optional `--paper-margin` red rule.
- Ink: `--ink` / `--ink-soft` for handwriting and labels.
- Post-its: `--postit-{yellow,pink,orange,cyan,green,blue}` taken from the reference sheet.
- Calendar header: `--primary` (deep blue).

Always consume tokens. If a new color is truly needed, add a token — never inline hex in components.

## Typography

- Handwriting: `font-hand` (Patrick Hand) for notes, page content, sticker labels, section titles.
- Keep a small amount of clean sans (system) for controls and dates where legibility matters.
- Big, friendly sizes. Handwriting wants room to breathe.

## Depth & shadow

- Objects sit at different heights off the desk; shadow softness/offset encodes height.
  - Paper page: large soft shadow.
  - Post-it resting: medium soft shadow; while dragging: larger, more diffuse.
  - Sticker: small tight shadow (it's stuck flat-ish).
- Layer shadows (a tight dark one + a wide soft one) rather than one harsh box-shadow.
- Post-its and stickers carry a small random rotation (±4–6°) so nothing looks grid-aligned.
- Post-it folded corner via a diagonal gradient; paper edge subtle.

## Motion

- Page turn: eased, ~600ms, with a real curl/shadow (react-pageflip). Never a hard swap.
- Drag: follow the pointer 1:1, lift shadow on grab, settle on drop. No snapping to a grid.
- Micro: gentle hover lift on grabbable things; sheet slides in.
- Respect `prefers-reduced-motion`: shorten/simplify, keep the function.

## Restraint that still applies

Playful ≠ noisy. Keep **one** dominant anchor (the notebook). Don't stack competing textures, don't animate everything at once, keep the desk uncluttered so the objects on it read clearly. Delight comes from a few well-crafted physical details, not from maximal effects.
