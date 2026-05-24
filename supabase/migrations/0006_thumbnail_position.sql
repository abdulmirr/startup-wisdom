-- 0006_thumbnail_position.sql
-- Per-resource override for how the card thumbnail is cropped. Defaults to
-- center; values like 'top' bias the crop toward a subject (e.g. a head in a
-- portrait photo) that would otherwise get cut off.

alter table resources
  add column if not exists thumbnail_position text
    check (thumbnail_position in ('top','center','bottom','left','right'));

-- Resources whose thumbnails need a top-biased crop (subject at top of frame).
update resources set thumbnail_position = 'top' where slug in (
  'hiring-executives',
  'peacetime-ceo-wartime-ceo',
  '2018-letter-to-shareholders',
  'judgment',
  'desire-is-a-contract-you-make-with-yourself',
  'how-to-invest-in-startups',
  'before-the-startup',
  'mean-people-fail',
  'how-to-do-what-you-love',
  'how-to-make-wealth'
);
