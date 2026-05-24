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
  thumbnail_position text
                    check (thumbnail_position in ('top','center','bottom','left','right')),
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
-- 0002_rls.sql
-- Public-read on published content. Admin-write gated by email allowlist.

alter table creators       enable row level security;
alter table sources        enable row level security;
alter table resources      enable row level security;
alter table highlights     enable row level security;
alter table subscribers    enable row level security;
alter table admin_actions  enable row level security;

create or replace function is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'builtbyabdul@gmail.com';
$$;

-- Public read of published content
drop policy if exists "public read creators"   on creators;
create policy "public read creators"  on creators  for select using (true);

drop policy if exists "public read sources"    on sources;
create policy "public read sources"   on sources   for select using (true);

drop policy if exists "public read resources"  on resources;
create policy "public read resources" on resources for select
  using (status = 'published');

drop policy if exists "public read highlights" on highlights;
create policy "public read highlights" on highlights for select
  using (exists (
    select 1 from resources r
    where r.id = highlights.resource_id and r.status = 'published'
  ));

-- Admin writes
drop policy if exists "admin write creators"  on creators;
create policy "admin write creators"  on creators
  for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write sources"   on sources;
create policy "admin write sources"   on sources
  for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write resources" on resources;
create policy "admin write resources" on resources
  for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write highlights" on highlights;
create policy "admin write highlights" on highlights
  for all using (is_admin()) with check (is_admin());

-- Subscribers: anyone can subscribe, only admin reads
drop policy if exists "anon subscribe"  on subscribers;
create policy "anon subscribe"  on subscribers for insert with check (true);

drop policy if exists "admin read subs" on subscribers;
create policy "admin read subs" on subscribers for select using (is_admin());

-- Admin actions: admin only
drop policy if exists "admin actions" on admin_actions;
create policy "admin actions" on admin_actions
  for all using (is_admin()) with check (is_admin());
-- 0003_search.sql
-- Full-text and trigram indexes for /api/search and Cmd+K.

create index if not exists resources_fts_idx
  on resources using gin (fts);

create index if not exists resources_title_trgm_idx
  on resources using gin (title gin_trgm_ops);
-- 0005_topics_collections.sql
-- Topic taxonomy + curated collections + daily_highlights + ask_queries analytics.

create table if not exists topics (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  sort_order  integer not null default 0
);

create table if not exists resource_topics (
  resource_id uuid not null references resources(id) on delete cascade,
  topic_id    uuid not null references topics(id)    on delete cascade,
  primary key (resource_id, topic_id)
);
create index if not exists resource_topics_topic_idx on resource_topics (topic_id);

create table if not exists collections (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  cover_image text,
  status      text not null default 'published'
              check (status in ('draft','published','hidden')),
  created_at  timestamptz not null default now()
);

create table if not exists collection_items (
  collection_id uuid not null references collections(id) on delete cascade,
  resource_id   uuid not null references resources(id)   on delete cascade,
  rank          smallint not null,
  note          text,
  primary key (collection_id, resource_id)
);
create index if not exists collection_items_rank_idx
  on collection_items (collection_id, rank);

create table if not exists daily_highlights (
  date         date primary key,
  highlight_id uuid not null references highlights(id) on delete restrict,
  picked_by    text not null default 'auto'
);

create table if not exists ask_queries (
  id         uuid primary key default gen_random_uuid(),
  query      text not null,
  ip_hash    text,
  citations  uuid[],
  created_at timestamptz not null default now()
);

-- RLS

alter table topics            enable row level security;
alter table resource_topics   enable row level security;
alter table collections       enable row level security;
alter table collection_items  enable row level security;
alter table daily_highlights  enable row level security;
alter table ask_queries       enable row level security;

drop policy if exists "public read topics" on topics;
create policy "public read topics" on topics for select using (true);

drop policy if exists "public read resource_topics" on resource_topics;
create policy "public read resource_topics" on resource_topics for select using (true);

drop policy if exists "public read collections" on collections;
create policy "public read collections" on collections for select
  using (status = 'published');

drop policy if exists "public read collection_items" on collection_items;
create policy "public read collection_items" on collection_items for select
  using (exists (
    select 1 from collections c
    where c.id = collection_items.collection_id and c.status = 'published'
  ));

drop policy if exists "public read daily" on daily_highlights;
create policy "public read daily" on daily_highlights for select using (true);

-- Ask queries: anon insert, admin read
drop policy if exists "anon ask insert" on ask_queries;
create policy "anon ask insert" on ask_queries for insert with check (true);

drop policy if exists "admin ask read" on ask_queries;
create policy "admin ask read" on ask_queries for select using (is_admin());

-- Admin writes everywhere
drop policy if exists "admin write topics"           on topics;
create policy "admin write topics"           on topics           for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write resource_topics"  on resource_topics;
create policy "admin write resource_topics"  on resource_topics  for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write collections"      on collections;
create policy "admin write collections"      on collections      for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write collection_items" on collection_items;
create policy "admin write collection_items" on collection_items for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write daily"            on daily_highlights;
create policy "admin write daily"            on daily_highlights for all using (is_admin()) with check (is_admin());
