-- Fix: dubbele inzet-actie verwijderen (per speler 1 behouden)
-- Na per ongeluk 007_tof_inzet_all_players.sql 2x te runnen

DELETE FROM camp_feed
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY player_id
        ORDER BY created_at ASC
      ) AS rn
    FROM camp_feed
    WHERE camp_id = 'tof'
      AND type = 'special'
      AND special_category = 'inzet'
      AND description = 'Inzet — alle kampers'
      AND points = 10
  ) ranked
  WHERE rn > 1
);
