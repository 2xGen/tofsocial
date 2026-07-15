-- Multi-camp: add camp_id, migrate TOF data, seed SHOT
-- Safe to run on existing TOF database after 001–003

-- ─── camp_players ────────────────────────────────────────────────────────────
ALTER TABLE camp_players
  ADD COLUMN IF NOT EXISTS camp_id TEXT NOT NULL DEFAULT 'tof';

UPDATE camp_players SET camp_id = 'tof' WHERE camp_id IS NULL OR camp_id = '';

-- ─── camp_feed ───────────────────────────────────────────────────────────────
ALTER TABLE camp_feed
  ADD COLUMN IF NOT EXISTS camp_id TEXT NOT NULL DEFAULT 'tof';

UPDATE camp_feed SET camp_id = 'tof' WHERE camp_id IS NULL OR camp_id = '';

-- ─── camp_challenges ─────────────────────────────────────────────────────────
ALTER TABLE camp_challenges
  ADD COLUMN IF NOT EXISTS camp_id TEXT NOT NULL DEFAULT 'tof';

UPDATE camp_challenges SET camp_id = 'tof' WHERE camp_id IS NULL OR camp_id = '';

-- ─── camp_media ──────────────────────────────────────────────────────────────
ALTER TABLE camp_media
  ADD COLUMN IF NOT EXISTS camp_id TEXT NOT NULL DEFAULT 'tof';

UPDATE camp_media SET camp_id = 'tof' WHERE camp_id IS NULL OR camp_id = '';

-- ─── camp_settings → camp_id primary key ─────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'camp_settings' AND column_name = 'id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'camp_settings' AND column_name = 'camp_id'
  ) THEN
    ALTER TABLE camp_settings ADD COLUMN camp_id TEXT;
    UPDATE camp_settings SET camp_id = 'tof' WHERE id = 1;
    ALTER TABLE camp_settings ALTER COLUMN camp_id SET NOT NULL;
    ALTER TABLE camp_settings DROP CONSTRAINT IF EXISTS camp_settings_pkey;
    ALTER TABLE camp_settings DROP CONSTRAINT IF EXISTS camp_settings_id_check;
    ALTER TABLE camp_settings DROP COLUMN id;
    ALTER TABLE camp_settings ADD PRIMARY KEY (camp_id);
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'camp_settings'
  ) THEN
    CREATE TABLE camp_settings (
      camp_id TEXT PRIMARY KEY,
      active_day TEXT NOT NULL DEFAULT 'ma' CHECK (active_day IN ('ma', 'di', 'wo', 'do'))
    );
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'camp_settings' AND column_name = 'id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'camp_settings' AND column_name = 'camp_id'
  ) THEN
    -- Both columns present (partial migrate): finish to camp_id PK
    UPDATE camp_settings SET camp_id = 'tof' WHERE camp_id IS NULL AND id = 1;
    ALTER TABLE camp_settings ALTER COLUMN camp_id SET NOT NULL;
    ALTER TABLE camp_settings DROP CONSTRAINT IF EXISTS camp_settings_pkey;
    ALTER TABLE camp_settings DROP CONSTRAINT IF EXISTS camp_settings_id_check;
    ALTER TABLE camp_settings DROP COLUMN IF EXISTS id;
    ALTER TABLE camp_settings ADD PRIMARY KEY (camp_id);
  END IF;
END $$;

INSERT INTO camp_settings (camp_id, active_day) VALUES ('tof', 'ma')
ON CONFLICT (camp_id) DO NOTHING;

INSERT INTO camp_settings (camp_id, active_day) VALUES ('shot', 'ma')
ON CONFLICT (camp_id) DO NOTHING;

-- ─── camp_groups → composite PK (camp_id, id) ────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'camp_groups'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'camp_groups' AND column_name = 'camp_id'
  ) THEN
    CREATE TABLE camp_groups_new (
      camp_id TEXT NOT NULL,
      id SMALLINT NOT NULL CHECK (id >= 1 AND id <= 9),
      name TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (camp_id, id)
    );

    INSERT INTO camp_groups_new (camp_id, id, name)
    SELECT 'tof', id, name FROM camp_groups;

    DROP TABLE camp_groups;
    ALTER TABLE camp_groups_new RENAME TO camp_groups;

    ALTER TABLE camp_groups ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS camp_groups_all ON camp_groups;
    CREATE POLICY camp_groups_all ON camp_groups FOR ALL USING (true) WITH CHECK (true);
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'camp_groups'
  ) THEN
    CREATE TABLE camp_groups (
      camp_id TEXT NOT NULL,
      id SMALLINT NOT NULL CHECK (id >= 1 AND id <= 9),
      name TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (camp_id, id)
    );
    ALTER TABLE camp_groups ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS camp_groups_all ON camp_groups;
    CREATE POLICY camp_groups_all ON camp_groups FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

INSERT INTO camp_groups (camp_id, id, name)
SELECT c.camp_id, g.id, ''
FROM (VALUES ('tof'), ('shot')) AS c(camp_id)
CROSS JOIN generate_series(1, 9) AS g(id)
ON CONFLICT (camp_id, id) DO NOTHING;

-- ─── Seed SHOT players ───────────────────────────────────────────────────────
INSERT INTO camp_players (id, full_name, nickname, group_id, camp_id) VALUES
  ('shot-p1', 'Alexander v/d Pol', 'Alexander', NULL, 'shot'),
  ('shot-p2', 'Amaryn v/d Broek', 'Amaryn', NULL, 'shot'),
  ('shot-p3', 'Amelie Worst', 'Amelie', NULL, 'shot'),
  ('shot-p4', 'Annelinde Verveen', 'Annelinde', NULL, 'shot'),
  ('shot-p5', 'Boris Dielissen', 'Boris', NULL, 'shot'),
  ('shot-p6', 'Bram v/r Weide', 'Bram', NULL, 'shot'),
  ('shot-p7', 'Casimir Bon', 'Casimir', NULL, 'shot'),
  ('shot-p8', 'Charlotte Holterman', 'Charlotte', NULL, 'shot'),
  ('shot-p9', 'Chris Buijs', 'Chris', NULL, 'shot'),
  ('shot-p10', 'Ella Groen', 'Ella', NULL, 'shot'),
  ('shot-p11', 'Emily Muller', 'Emily', NULL, 'shot'),
  ('shot-p12', 'Eva Schalkwijk', 'Eva', NULL, 'shot'),
  ('shot-p13', 'Evi Sierenveld', 'Evi', NULL, 'shot'),
  ('shot-p14', 'Faas Koster', 'Faas', NULL, 'shot'),
  ('shot-p15', 'Fae Koster', 'Fae', NULL, 'shot'),
  ('shot-p16', 'Felix Dicksson', 'Felix', NULL, 'shot'),
  ('shot-p17', 'Florian Muller', 'Florian Mu', NULL, 'shot'),
  ('shot-p18', 'Florian t. Mors', 'Florian Mo', NULL, 'shot'),
  ('shot-p19', 'Floris v/d Pol', 'Floris', NULL, 'shot'),
  ('shot-p20', 'Hidde Smits', 'Hidde', NULL, 'shot'),
  ('shot-p21', 'Hugo Buijs', 'Hugo B', NULL, 'shot'),
  ('shot-p22', 'Hugo v Reen', 'Hugo v', NULL, 'shot'),
  ('shot-p23', 'Isis Bon', 'Isis', NULL, 'shot'),
  ('shot-p24', 'Jeppe v. Silfhout', 'Jeppe', NULL, 'shot'),
  ('shot-p25', 'Julie Slangen', 'Julie', NULL, 'shot'),
  ('shot-p26', 'Juul Berger', 'Juul', NULL, 'shot'),
  ('shot-p27', 'Kay Houterman', 'Kay', NULL, 'shot'),
  ('shot-p28', 'Lasse Doornbos', 'Lasse', NULL, 'shot'),
  ('shot-p29', 'Lauren Verveen', 'Lauren V', NULL, 'shot'),
  ('shot-p30', 'Lauren Bosse V', 'Lauren B', NULL, 'shot'),
  ('shot-p31', 'Lotte v/d Berg', 'Lotte', NULL, 'shot'),
  ('shot-p32', 'Line Kramer', 'Line', NULL, 'shot'),
  ('shot-p33', 'Lucas Verpoorte', 'Lucas', NULL, 'shot'),
  ('shot-p34', 'Mae Zumbrink', 'Mae', NULL, 'shot'),
  ('shot-p35', 'Maithe v. Silfhout', 'Maithe', NULL, 'shot'),
  ('shot-p36', 'Mathis Bosse V', 'Mathis', NULL, 'shot'),
  ('shot-p37', 'Mare Doornbos', 'Mare', NULL, 'shot'),
  ('shot-p38', 'Mas Zumbrink', 'Mas', NULL, 'shot'),
  ('shot-p39', 'Maurits Noltes', 'Maurits', NULL, 'shot'),
  ('shot-p40', 'Max Braam', 'Max B', NULL, 'shot'),
  ('shot-p41', 'Max Denee', 'Max D', NULL, 'shot'),
  ('shot-p42', 'Merle Zonnenberg', 'Merle', NULL, 'shot'),
  ('shot-p43', 'Mels Prinssen', 'Mels', NULL, 'shot'),
  ('shot-p44', 'Milo Groen', 'Milo', NULL, 'shot'),
  ('shot-p45', 'Minte Houterman', 'Minte', NULL, 'shot'),
  ('shot-p46', 'Moos Voogt', 'Moos', NULL, 'shot'),
  ('shot-p47', 'Nolan v/d Broek', 'Nolan', NULL, 'shot'),
  ('shot-p48', 'Nora v/d Weide', 'Nora', NULL, 'shot'),
  ('shot-p49', 'Olle Logman', 'Olle', NULL, 'shot'),
  ('shot-p50', 'Olivier Stoop', 'Olivier', NULL, 'shot'),
  ('shot-p51', 'Oscar Vanlenberghe', 'Oscar', NULL, 'shot'),
  ('shot-p52', 'Pepijn Makkink', 'Pepijn', NULL, 'shot'),
  ('shot-p53', 'Pieter Stoop', 'Pieter', NULL, 'shot'),
  ('shot-p54', 'Rein de Graaff', 'Rein', NULL, 'shot'),
  ('shot-p55', 'Rens Rabelink', 'Rens', NULL, 'shot'),
  ('shot-p56', 'Ruben Makkink', 'Ruben', NULL, 'shot'),
  ('shot-p57', 'Sven Palstra', 'Sven', NULL, 'shot'),
  ('shot-p58', 'Suze Bekkers', 'Suze', NULL, 'shot'),
  ('shot-p59', 'Sweder Vogelaar', 'Sweder', NULL, 'shot'),
  ('shot-p60', 'Tessa Dielissen', 'Tessa', NULL, 'shot'),
  ('shot-p61', 'Teun v Reen', 'Teun', NULL, 'shot'),
  ('shot-p62', 'Thijn Maas', 'Thijn M', NULL, 'shot'),
  ('shot-p63', 'Thijn Palstra', 'Thijn P', NULL, 'shot'),
  ('shot-p64', 'Thomas Doornbos', 'Thomas', NULL, 'shot'),
  ('shot-p65', 'Tom t. Mors', 'Tom', NULL, 'shot'),
  ('shot-p66', 'Vasco Perdon', 'Vasco', NULL, 'shot'),
  ('shot-p67', 'Vesper Kaemingk', 'Vesper', NULL, 'shot'),
  ('shot-p68', 'Willem Zonnenberg', 'Willem', NULL, 'shot'),
  ('shot-p69', 'Xavier Munnichs', 'Xavier', NULL, 'shot')
ON CONFLICT (id) DO NOTHING;

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS camp_players_camp ON camp_players (camp_id);
CREATE INDEX IF NOT EXISTS camp_feed_camp ON camp_feed (camp_id, created_at DESC);
CREATE INDEX IF NOT EXISTS camp_media_camp ON camp_media (camp_id, created_at DESC);
CREATE INDEX IF NOT EXISTS camp_challenges_camp ON camp_challenges (camp_id, created_at DESC);
