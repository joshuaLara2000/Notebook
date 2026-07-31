-- Notebook — Supabase schema
-- Run in the Supabase SQL editor. Positions/rotation/z-index let the board
-- reconstruct exactly where each element was left.

create table if not exists pages (
  id         uuid primary key default gen_random_uuid(),
  index      int  not null,
  date       date,
  content    text not null default '',
  urgent     text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists postits (
  id         uuid primary key default gen_random_uuid(),
  text       text not null default '',
  color      text not null default 'yellow',
  x          real not null default 0,
  y          real not null default 0,
  rotation   real not null default 0,
  z_index    int  not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists stickers (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null,
  x          real not null default 0,
  y          real not null default 0,
  rotation   real not null default 0,
  scale      real not null default 1,
  z_index    int  not null default 0,
  page_id    uuid references pages(id) on delete set null,
  created_at timestamptz not null default now()
);
