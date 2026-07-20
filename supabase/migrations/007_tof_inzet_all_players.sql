-- TOF kamp: +10 inzet-punten voor álle TOF-spelers (maandag)
-- Run once in Supabase SQL Editor

INSERT INTO camp_feed (
  day,
  trainer,
  type,
  target_type,
  player_id,
  group_id,
  points,
  challenge_id,
  challenge_name,
  special_category,
  description,
  camp_id
)
SELECT
  'ma',
  'TOF Kamp',
  'special',
  'player',
  p.id,
  NULL,
  10,
  NULL,
  NULL,
  'inzet',
  'Inzet — alle kampers',
  'tof'
FROM camp_players p
WHERE p.camp_id = 'tof';
