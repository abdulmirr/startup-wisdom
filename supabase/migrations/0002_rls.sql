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
