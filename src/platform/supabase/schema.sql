-- Notebook — Supabase schema (multi-usuario)
-- Cada fila pertenece a un usuario de Supabase Auth (auth.users). RLS restringe
-- todo a auth.uid(): cada quien solo ve y edita SUS notas.
-- user_id se autocompleta con `default auth.uid()`, así el cliente no lo envía.
-- Los ids son 'text' porque el cliente los genera (crypto.randomUUID) y hace
-- upsert por id.

-- Hojas de la libreta
create table if not exists pages (
  id         text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  page_index int  not null,
  date       date,
  content    text not null default '',
  urgent     text not null default '',
  created_at timestamptz not null default now()
);

-- Post-its (contenido en HTML enriquecido)
create table if not exists postits (
  id         text primary key,
  user_id    uuid    not null references auth.users(id) on delete cascade default auth.uid(),
  text       text    not null default '',
  color      text    not null default 'yellow',
  x          real    not null default 0,
  y          real    not null default 0,
  width      real    not null default 184,
  height     real    not null default 184,
  rotation   real    not null default 0,
  z_index    int     not null default 0,
  archived   boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Stickers: viven en una hoja concreta (se borran con ella)
create table if not exists stickers (
  id         text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  kind       text not null,
  page_id    text not null references pages(id) on delete cascade,
  x          real not null default 0,
  y          real not null default 0,
  rotation   real not null default 0,
  scale      real not null default 1,
  z_index    int  not null default 0,
  created_at timestamptz not null default now()
);

-- Ajustes globales del tablero, uno por usuario (estilo de papel de la libreta)
create table if not exists board_settings (
  user_id        uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  notebook_style text not null default 'ruled',
  updated_at     timestamptz not null default now()
);

-- Índices por dueño (rendimiento de consultas por usuario)
create index if not exists pages_user_idx    on pages(user_id);
create index if not exists postits_user_idx  on postits(user_id);
create index if not exists stickers_user_idx on stickers(user_id);
create index if not exists stickers_page_idx on stickers(page_id);

-- RLS: cada quien solo accede a SUS filas
alter table pages          enable row level security;
alter table postits        enable row level security;
alter table stickers       enable row level security;
alter table board_settings enable row level security;

create policy "pages owner"    on pages          for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "postits owner"  on postits        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "stickers owner" on stickers       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "settings owner" on board_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
