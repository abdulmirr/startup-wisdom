-- 0001_init.sql
-- Core entities: creators, sources, resources, highlights, subscribers, admin_actions.

create extension if not exists pg_trgm;
create extension if not exists citext;

create table if not exists creators (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  bio           text,
  avatar_url    text,
  homepage_url  text,
  created_at    timestamptz not null default now()
);

create table if not exists sources (
  id        uuid primary key default gen_random_uuid(),
  slug      text unique not null,
  name      text not null,
  base_url  text not null,
  kind      text not null check (kind in ('blog','youtube','podcast','letters','lectures')),
  created_at timestamptz not null default now()
);

do $$ begin
  create type resource_medium as enum ('essay','video','podcast','lecture','letter');
exception when duplicate_object then null; end $$;

create table if not exists resources (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  title             text not null,
  creator_id        uuid not null references creators(id) on delete restrict,
  source_id         uuid not null references sources(id)  on delete restrict,
  medium            resource_medium not null,
  external_url      text not null,
  external_id       text,
  thumbnail_url     text,
  duration_seconds  integer,
  word_count        integer,
  published_at      date,
  added_at          timestamptz not null default now(),
  description       text,
  raw_text          text,
  raw_text_url      text,
  status            text not null default 'draft'
                    check (status in ('draft','published','hidden')),
  extraction_status text not null default 'pending'
                    check (extraction_status in ('pending','running','done','failed')),
  extraction_error  text,
  extracted_at      timestamptz,
  fts               tsvector generated always as
                    (to_tsvector('english',
                       coalesce(title,'') || ' ' || coalesce(description,'')
                    )) stored,
  unique (source_id, external_url)
);

create index if not exists resources_published_at_idx on resources (published_at desc);
create index if not exists resources_added_at_idx     on resources (added_at desc);
create index if not exists resources_medium_idx       on resources (medium);
create index if not exists resources_creator_idx      on resources (creator_id);
create index if not exists resources_status_idx       on resources (status);

create table if not exists highlights (
  id                uuid primary key default gen_random_uuid(),
  resource_id       uuid not null references resources(id) on delete cascade,
  body              text not null,
  is_key            boolean not null default false,
  rank              smallint not null,
  context           text,
  timestamp_seconds integer,
  created_at        timestamptz not null default now()
);

create unique index if not exists highlights_one_key_per_resource
  on highlights (resource_id) where is_key = true;
create index if not exists highlights_resource_rank on highlights (resource_id, rank);
create index if not exists highlights_recent on highlights (created_at desc);

create table if not exists subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           citext unique not null,
  confirmed_at    timestamptz,
  unsubscribed_at timestamptz,
  source          text,
  created_at      timestamptz not null default now()
);

create table if not exists admin_actions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id),
  action     text not null,
  target_id  uuid,
  payload    jsonb,
  created_at timestamptz not null default now()
);
