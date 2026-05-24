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
