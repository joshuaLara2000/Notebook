# Plan: adaptación mobile + touch

Rama: `feat/mobile-touch` (parte de `dev`). Objetivo: que la app se sienta
tan pulida en **tablet y teléfono grande** (público principal: estudiantes)
como en escritorio, sin perder la sensación táctil de papelería.

## Principios

- **Tablet-first**, luego teléfono. La tablet es el mercado principal.
- No aplanar la estética: se mantiene el brief de `notebook-ui` (sombras,
  rotación, motion eásado). Aplicar el skill en cada cambio de UI.
- **Dos modos de layout**, no solo "encoger", elegidos por **ancho** (no por
  clase de dispositivo):
  - **Canvas libre** (ancho ≥ 1024: tablet horizontal y desktop): el escritorio
    tal como está.
  - **Layout compacto** (ancho < 1024: teléfono **y tablet vertical**): lista +
    tab bar (ver Fase 3), porque arrastrar notas absolutas en una pantalla
    angosta es incómodo. Se activa con `isCompact` de `useBreakpoint`.
- Progresivo y verificable por fases; cada fase se prueba con
  `resize_window` (mobile 375 / tablet 768) sobre el dev server.

## Decisión tomada — estrategia de teléfono: **A**

**A) Lista/stack de notas + libreta a pantalla completa con tab bar.** Elegida
por ser **menos frágil** (usa dnd-kit *sortable*, patrón probado) y encajar con
el uso real del teléfono (pulgar, vertical, scroll). (B) —canvas con pinch-zoom
+ paneo— se descarta: mucho más trabajo y pelea con scroll/zoom nativos.

Trade-off aceptado: en teléfono se pierde la metáfora de "escritorio libre"
(las notas fluyen en lista); se compensa conservando color, rotación leve,
sombra y reordenar-arrastrando para que siga sintiéndose papelería.
**Tablet horizontal y desktop (≥1024) conservan el canvas libre**; **tablet
vertical y teléfono (<1024) usan el layout compacto** (`isCompact`).

---

## Fase 0 — Fundaciones

- [x] Hook `useBreakpoint()` en `src/shared/hooks/useBreakpoint.ts`
      (`isPhone`/`isTablet`/`isDesktop` + `isCoarsePointer`). Aún **sin
      consumir** — lo usará el layout de teléfono (Fase 3).
- [x] `prefers-reduced-motion` en `globals.css`: acorta transiciones y el
      volteo (a 0.2 s), manteniendo la función.
- [x] `env(safe-area-inset-*)`: barra superior con padding safe-area en
      `Desk.tsx` (ya estaba `viewport-fit=cover` en `index.html`). Pendiente:
      controles inferiores cuando exista el layout de teléfono.

## Fase 1 — Touch drag correcto (mayor impacto/esfuerzo)

Archivos: `modules/desk/views/Desk.tsx`, `modules/postits/components/PostItCard.tsx`,
`modules/stickers/*`, `shared/ui/RichTextArea.tsx`.

- [x] **Sensores dnd-kit**: separado `MouseSensor` (distance 6) y `TouchSensor`
      (`{ delay: 200, tolerance: 8 }`) en `Desk.tsx`. En touch un **tap edita**
      y una **pulsación sostenida arrastra**; un scroll/tap rápido no arrastra.
- [x] **`touch-action`** (post-it): `touch-none` en el contenedor arrastrable
      de `PostItCard` y `touch-auto` en el área de texto (scroll/selección).
      Los stickers (`PlacedSticker`) ya tenían `touch-none`.
- [x] **Controles hover en táctil**: cerrar/redimensionar de post-its y
      stickers se revelan en punteros gruesos (`.touch-show` / `.touch-show-block`
      en `globals.css`). ⚠️ Verificar posición/centrado en dispositivo.
- [ ] **Resize handle** (`PostItCard` handler con pointer events): funciona en
      touch pero el objetivo de 16px es muy chico. Agrandar a ≥44px de área
      efectiva y/o mostrarlo solo cuando la nota está "seleccionada".
- [ ] **Tap vs editar**: verificar que tocar el texto entra a editar y que la
      vista de lectura marcada (`NoteMarkedView`) abre el `ScheduleMenu` con un
      tap; que el teclado virtual no tape la nota (autoscroll al enfocar).
- [ ] **ScheduleMenu**: revisar posición en pantallas chicas (ya hace flip
      arriba/abajo y clamp horizontal) y que el tap-fuera lo cierre en touch.

## Fase 2 — Responsive de tablet

Archivos: `Desk.tsx`, `NotebookView.tsx`, `PostItWall.tsx`, barra superior.

- [x] **Libreta**: `computeBookSize()` ahora acota el ancho a
      `min(alto*0.75, innerWidth - 32, 700)` y recalcula el alto cuando manda
      el ancho, así ya no se desborda en tablet/teléfono angosto (desktop
      queda igual). Pendiente: en teléfono horizontal puede sobrar de alto →
      lo cubre el layout de teléfono (Fase 3).
- [ ] **Barra superior** (`Desk.tsx`): hoy son varios botones (cuenta, +Post-it,
      Notas, Stickers, tema, atajos, fecha) en una fila; en tablet vertical se
      aprieta. Colapsar acciones secundarias en un menú (kebab/DropdownMenu) o
      un `Sheet`, dejando visibles solo +Post-it y lo esencial.
- [x] **ShortcutsHelp**: oculto en táctil vía `.hide-on-touch`
      (`@media (hover: none) and (pointer: coarse)`).
- [ ] El **clamp de límites** (`shared/utils/geometry.ts`) ya mantiene las notas
      dentro del viewport al redimensionar — validar que se comporte bien al
      rotar el dispositivo.

## Fase 3 — Layout de teléfono (según decisión A/B)

**A (elegida) — andamiaje implementado, ⚠️ nunca renderizado en dispositivo:**
- [x] **Tab bar inferior** Notas / Libreta (`PhoneLayout`, gated en `isCompact`
      = ancho < 1024, o sea teléfono y tablet vertical).
- [x] **Notas en lista** (`NoteListCard`): tarjeta que fluye con color,
      insights inline y tap-para-editar; botón “+” flotante y borrar.
- [x] **Libreta** reusa `NotebookView` a lo ancho.
- [ ] **Reordenar** notas por arrastre (dnd-kit *sortable*).
- [ ] **Editor a pantalla completa** (sheet) para que el teclado no tape el
      texto (hoy edición inline en la tarjeta).
- [ ] **Swipe** para pasar hoja sobre `FlipBook` (hoy solo botones/teclado).
- [ ] Acceso a **notas archivadas** en teléfono (hoy solo activas).
- [ ] **Auto-focus** al crear una nota nueva.
- [ ] ⚠️ **Verificar en teléfono real**: layout, scroll, teclado, gestos.

Si **B**: envolver el canvas en un contenedor con pinch-zoom + paneo (p. ej.
gestos propios o una lib ligera), y desactivar el clamp mientras se hace zoom.

## Fase 4 — Pulido y accesibilidad

- [ ] Objetivos táctiles ≥44px: botón cerrar del post-it, resize, toolbar,
      chips de insight.
- [ ] Focus visible y `aria-label` (ya presentes en varios; revisar los nuevos).
- [ ] Contraste de tinta sobre post-it y del marcador `--postit-marker` en
      ambos temas a tamaños chicos.
- [ ] Matriz de prueba: iPhone Safari, Android Chrome, iPad Safari, desktop.
      Emulación con `resize_window` cubre layout; los **gestos** conviene
      probarlos en dispositivo real.

## Riesgos / preguntas abiertas

- **`FlipBook` en touch**: verificar que el volteo (CSS 3D propio) no pelee con
  el scroll ni con dnd; el swipe-to-flip es nuevo.
- **contentEditable en móvil**: caret, teclado virtual tapando la nota,
  autoscroll — dolores conocidos; presupuestar tiempo.
- **Metáfora de canvas en teléfono**: definir A vs B con el usuario (arriba).
- **react-pageflip**: no se usa; el volteo es `FlipBook` propio (CSS en
  `globals.css` `.nb-flip-*`). Cualquier gesto se implementa ahí.

## Orden sugerido de ejecución

1. Fase 0 (hook + reduced-motion + safe-areas)
2. Fase 1 (touch drag) ← lo que más sostiene "se siente app"
3. Fase 2 (responsive tablet)
4. Decidir A/B → Fase 3 (teléfono)
5. Fase 4 (pulido + a11y)

Verificar cada fase con el dev server + `resize_window` antes de pasar a la
siguiente; commits pequeños por fase.
