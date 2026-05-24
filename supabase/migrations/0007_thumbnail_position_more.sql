-- 0007_thumbnail_position_more.sql
-- Additional resources whose thumbnails need a top-biased crop.

update resources set thumbnail_position = 'top' where slug in (
  'mark-zuckerberg-you-cant-8020-everything',
  'keith-rabois-on-how-to-identify-great-talent'
);
