-- TOF Social · Groepnamen voor tenniskamp
-- Run in Supabase SQL Editor na 001_camp.sql

CREATE TABLE IF NOT EXISTS camp_groups (
  id SMALLINT PRIMARY KEY CHECK (id >= 1 AND id <= 9),
  name TEXT NOT NULL DEFAULT ''
);

INSERT INTO camp_groups (id, name) VALUES
  (1, ''),
  (2, ''),
  (3, ''),
  (4, ''),
  (5, ''),
  (6, ''),
  (7, ''),
  (8, ''),
  (9, '')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE camp_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS camp_groups_all ON camp_groups;
CREATE POLICY camp_groups_all ON camp_groups FOR ALL USING (true) WITH CHECK (true);
