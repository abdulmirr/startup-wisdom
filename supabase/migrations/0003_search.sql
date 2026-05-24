-- 0003_search.sql
-- Full-text and trigram indexes for /api/search and Cmd+K.

create index if not exists resources_fts_idx
  on resources using gin (fts);

create index if not exists resources_title_trgm_idx
  on resources using gin (title gin_trgm_ops);
