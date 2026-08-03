<div align="center">

# 📓 Mi Libreta

**Un escritorio de papelería digital, kawaii y acogedor.**

Una libreta que se hojea en 3D, post-its que flotan libres, stickers para decorar
y un calendario de escritorio siempre a la vista. Todo se guarda en la nube,
por usuario.

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5F5F5F?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

</div>

---

## ✨ ¿Qué es?

**Mi Libreta** recrea la sensación de escribir en papel, pero en el navegador.
La pantalla es tu escritorio: a la derecha una **libreta que se hojea**, a la
izquierda **post-its** que puedes mover a tu antojo, un cajón de **stickers** para
decorar y un **calendario de escritorio** que marca el día de hoy.

Estética **kawaii sutil**: pasteles lavanda y rosa, tipografía redondeada para la
interfaz y letra manuscrita para lo que escribes. ✏️💜

## 🌟 Funcionalidades

### 📖 La libreta

- **Volteo 3D propio** que anima al avanzar **y** al regresar (animación inversa real).
- **Fecha automática** por hoja, fijada el día que la creas.
- **Texto enriquecido** (negrita, cursiva, subrayado, tachado, viñetas).
- **Estilos de papel**: renglones, cuadrícula o blanco.
- **Índice** de hojas con buscador por contenido.
- Agregar y eliminar hojas, con controles que se deshabilitan solos en los extremos.

### 🗒️ Post-its

- Notas que **flotan libres** y se arrastran por todo el escritorio.
- **Texto enriquecido**, **redimensionables** y en varios **colores**.
- **Insights automáticos**: detecta enlaces, correos, teléfonos y fechas, y los
  convierte en acciones.
- **Archivar en vez de borrar**: al cerrar una nota se guarda en el panel “Todas”,
  con búsqueda y restauración.

### 🎀 Stickers y calendario

- Cajón de **stickers** que se colocan con un clic dentro de la libreta.
- **Calendario de escritorio** flotante con el día actual.

### 🔐 Cuentas y sincronización

- **Autenticación** por correo y contraseña (Supabase).
- **Multiusuario**: cada persona ve solo sus notas gracias a **RLS**
  (Row Level Security).
- Todo se **sincroniza en la nube** automáticamente.

### ⌨️ Atajos de teclado

Funcionan con **⌘ en Mac** y **Ctrl en Windows/Linux**.

| Atajo            | Acción                    |
| ---------------- | ------------------------- |
| `⌘ / Ctrl` + `E` | Nuevo post-it             |
| `⌘ / Ctrl` + `↵` | Nueva hoja                |
| `←` / `→`        | Hoja anterior / siguiente |
| `⌘ / Ctrl` + `J` | Panel de notas            |
| `⌘ / Ctrl` + `K` | Índice de hojas           |
| `⌘ / Ctrl` + `G` | Stickers                  |
| `?`              | Ver todos los atajos      |

> 💡 El botón ⌨️ de la barra superior abre esta misma lista.

## 🛠️ Tecnologías

- **[React 19](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)**
- **[Vite](https://vite.dev/)** como bundler y dev server
- **[Tailwind CSS v4](https://tailwindcss.com/)** + **[shadcn/ui](https://ui.shadcn.com/)** (Radix)
- **[Zustand](https://zustand-demo.pmnd.rs/)** para el estado (persistido)
- **[@dnd-kit](https://dndkit.com/)** para arrastrar y soltar
- **[Supabase](https://supabase.com/)** para auth y base de datos
- **[React Router](https://reactrouter.com/)**, **[Formik](https://formik.org/)** + **[Yup](https://github.com/jquense/yup)**, **[date-fns](https://date-fns.org/)**

## 🚀 Puesta en marcha

Requiere **Node 18+** y **pnpm**.

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
```

Rellena tu `.env` con las credenciales de tu proyecto Supabase:

```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publica
```

Crea las tablas ejecutando el esquema `src/platform/supabase/schema.sql` en el
editor SQL de Supabase. Luego:

```bash
# 3. Arrancar en modo desarrollo
pnpm dev
```

### Scripts disponibles

| Comando        | Descripción                                     |
| -------------- | ----------------------------------------------- |
| `pnpm dev`     | Servidor de desarrollo con HMR                  |
| `pnpm build`   | Comprueba tipos y genera el build de producción |
| `pnpm preview` | Sirve el build de producción localmente         |
| `pnpm lint`    | Analiza el código con Oxlint                    |

## 🗂️ Estructura

```
src/
├── modules/        # Funcionalidades por dominio
│   ├── desk/       #   Escritorio: layout, store global, calendario
│   ├── notebook/   #   La libreta y su volteo 3D
│   ├── postits/    #   Post-its y panel de notas
│   ├── stickers/   #   Cajón de stickers
│   └── login/      #   Pantalla de acceso
├── platform/       # Integraciones externas
│   ├── auth/       #   Autenticación (Supabase)
│   └── supabase/   #   Cliente y esquema SQL
├── shared/         # Hooks, tipos y utilidades reutilizables
├── components/ui/  # Primitivos de shadcn/ui
└── styles/         # Tokens de diseño y estilos globales
```

La arquitectura sigue las convenciones de módulos de proyectos de referencia. El transporte (Supabase) se mantiene
fuera de las vistas: el flujo es `services → hooks → store → view`.

## 📱 Estado móvil / touch (handoff)

> **Para el próximo agente:** la adaptación móvil está **en progreso** en la rama
> `feat/mobile-touch`. El plan completo por fases está en
> [`docs/mobile-touch-plan.md`](docs/mobile-touch-plan.md). Varios cambios se
> hicieron **sin poder probarse en un dispositivo táctil real** (la app está tras
> login de Supabase y los gestos no se emulan bien). **Hay que verificarlos en
> tablet/teléfono reales.** La decisión de layout de teléfono es la **opción A**
> (lista/stack + libreta a pantalla completa), documentada en el plan.

**Ya implementado (⚠️ verificar en dispositivo):**

- **PWA instalable** (rama `dev`, ya fusionado): manifest + service worker.
  Comprobar instalación en Android/iOS/desktop.
- **Touch drag** (`Desk.tsx`): `MouseSensor` + `TouchSensor` (delay 200 ms).
  Verificar: un **toque simple edita** la nota; **mantener ~0.2 s y mover
  arrastra**; un scroll rápido no arrastra por accidente.
- **`touch-action`**: `touch-none` en el contenedor de post-it/sticker y
  `touch-auto` en el área de texto. Verificar que el texto sigue con scroll y
  que arrastrar es fluido.
- **Libreta responsive** (`NotebookView.computeBookSize`): ya no se desborda a
  lo ancho. Verificar en tablet vertical/horizontal y teléfono.
- **Controles hover en táctil**: los botones cerrar/redimensionar de post-its y
  stickers usaban `group-hover` (invisible en touch). Ahora se revelan en
  punteros gruesos vía `.touch-show` / `.touch-show-block`
  (`@media (hover: none) and (pointer: coarse)` en `globals.css`).
  **Verificar que aparecen y son tocables, y que su posición/centrado se ve bien.**
- **`prefers-reduced-motion`**: reduce transiciones y acorta el volteo a 0.2 s.
  Verificar que el volteo de hoja sigue funcionando (no romper `FlipBook`).
- **Safe-area**: la barra superior respeta el notch (`env(safe-area-inset-*)`).
- **Atajos de teclado** ocultos en táctil (`.hide-on-touch`).
- **`useBreakpoint()`** (`src/shared/hooks/`): hook base para el layout de
  teléfono; aún **sin consumir**.

**Falta por implementar:**

- **Fase 1/2 (pendientes):** agrandar el *resize handle* del post-it a un área
  táctil ≥44 px **sólo en touch** (no meter un target invisible grande en
  escritorio, rompería clics en la esquina); colapsar la **barra superior** en
  pantallas angostas.
- **Fase 3 — layout de teléfono (opción A), lo más grande, SIN empezar:**
  tab bar inferior (Notas / Libreta), notas en **lista/stack** (dnd-kit
  *sortable*) en vez de canvas absoluto, libreta a **pantalla completa** con
  **swipe** para pasar hoja (hoy solo botones/teclado; el volteo es el
  `FlipBook` propio con CSS `.nb-flip-*`), y **editor de nota a pantalla
  completa** para que el teclado no tape el texto.
- **Fase 4 — pulido/a11y:** targets ≥44 px, contraste del marcador
  `--postit-marker` a tamaños chicos, matriz iPhone/Android/iPad.

---

<div align="center">

Hecho con 💜 y mucho papel imaginario.

</div>
