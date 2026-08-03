# Plan: adaptación mobile + touch

Rama: `feat/mobile-touch` (parte de `dev`). Objetivo: que la app se sienta
tan pulida en **tablet y teléfono grande** (público principal: estudiantes)
como en escritorio, sin perder la sensación táctil de papelería.

## Principios

- **Tablet-first**, luego teléfono. La tablet es el mercado principal.
- No aplanar la estética: se mantiene el brief de `notebook-ui` (sombras,
  rotación, motion eásado). Aplicar el skill en cada cambio de UI.
- **Dos modos de layout**, no solo "encoger":
  - **Canvas libre** (tablet/desktop): el escritorio tal como está.
  - **Layout de teléfono**: repensado (ver Fase 3), porque arrastrar notas
    absolutas en una pantalla chica es incómodo.
- Progresivo y verificable por fases; cada fase se prueba con
  `resize_window` (mobile 375 / tablet 768) sobre el dev server.

## Punto de decisión (definir antes de Fase 3)

**Estrategia de teléfono:** ¿(A) lista/stack de notas + libreta a pantalla
completa con tab bar, o (B) canvas con pinch-zoom + paneo?
Recomendación: **(A)** — más usable en pantalla chica y menos frágil. (B)
conserva la metáfora pero es mucho más trabajo y peleará con gestos del
navegador. Decidir con el usuario.

---

## Fase 0 — Fundaciones

- [ ] Hook `useBreakpoint()` en `src/shared/hooks/` (o `useMediaQuery`) que
      exponga `isPhone` (<640), `isTablet` (640–1024), `isDesktop` (≥1024).
      Tailwind v4 ya trae `sm/md/lg`; usar CSS cuando alcance y el hook solo
      cuando la lógica de render dependa del tamaño.
- [ ] Respetar `prefers-reduced-motion` (lo exige el brief): reducir volteo
      y easing de drag, sin quitar función. Revisar `globals.css`
      (`.nb-flip-*`) y transiciones.
- [ ] `env(safe-area-inset-*)` para notch. Ya se agregó `viewport-fit=cover`
      en `index.html`; aplicar padding con safe-areas en la barra superior y
      controles inferiores.

## Fase 1 — Touch drag correcto (mayor impacto/esfuerzo)

Archivos: `modules/desk/views/Desk.tsx`, `modules/postits/components/PostItCard.tsx`,
`modules/stickers/*`, `shared/ui/RichTextArea.tsx`.

- [ ] **Sensores dnd-kit**: separar `MouseSensor` (distance 6) y `TouchSensor`
      (`{ delay: 200, tolerance: 8 }`). Así en touch un **tap edita** y una
      **pulsación sostenida arrastra**; un scroll/tap rápido no arrastra por
      accidente. Hoy solo hay `PointerSensor` con distance 6 (arrastra
      demasiado fácil en dedo).
- [ ] **`touch-action`**: `touch-action: none` en las **zonas de arrastre**
      del post-it (header/footer/márgenes), NO en el área de texto (que debe
      poder hacer scroll/seleccionar). Igual para stickers.
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

- [ ] **Libreta**: `computeBookSize()` limita alto por `window.innerHeight`
      pero el ancho (`height*0.75`) **no** se acota al ancho de viewport →
      se desborda en teléfono/tablet angosto. Cap: `bookWidth = min(alto*0.75,
      window.innerWidth - margen)` y derivar el alto del ancho cuando manda el
      ancho. Verificar que los stickers (que se acotan a `notebookSize`) sigan
      bien.
- [ ] **Barra superior** (`Desk.tsx`): hoy son varios botones (cuenta, +Post-it,
      Notas, Stickers, tema, atajos, fecha) en una fila; en tablet vertical se
      aprieta. Colapsar acciones secundarias en un menú (kebab/DropdownMenu) o
      un `Sheet`, dejando visibles solo +Post-it y lo esencial.
- [ ] **ShortcutsHelp**: los atajos de teclado no aplican en touch; ocultarlo
      en `isPhone/isTablet` táctil o cambiarlo por una hoja de "gestos".
- [ ] El **clamp de límites** (`shared/utils/geometry.ts`) ya mantiene las notas
      dentro del viewport al redimensionar — validar que se comporte bien al
      rotar el dispositivo.

## Fase 3 — Layout de teléfono (según decisión A/B)

Si **A (recomendado)**:
- [ ] **Tab bar inferior**: "Notas" | "Libreta" (y stickers por hoja).
- [ ] **Notas**: en vez de canvas absoluto, una **lista/grid vertical** con
      scroll; reordenar por drag (dnd-kit sortable). El post-it conserva color
      y sensación, pero fluye.
- [ ] **Libreta**: pantalla completa; **swipe** para pasar hoja (hoy solo
      botones/teclado — agregar gesto de swipe sobre `FlipBook`).
- [ ] **Editor de nota**: a pantalla completa (sheet) para que el teclado no
      tape el texto.

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
