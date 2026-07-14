-- TOF Social · Tenniskamp schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/iemgpccgdlwpsrsjuumo/sql

-- Players
CREATE TABLE IF NOT EXISTS camp_players (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  group_id SMALLINT CHECK (group_id IS NULL OR (group_id >= 1 AND group_id <= 9))
);

-- Single-row settings
CREATE TABLE IF NOT EXISTS camp_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  active_day TEXT NOT NULL DEFAULT 'ma' CHECK (active_day IN ('ma', 'di', 'wo', 'do'))
);

INSERT INTO camp_settings (id, active_day) VALUES (1, 'ma')
ON CONFLICT (id) DO NOTHING;

-- Challenges
CREATE TABLE IF NOT EXISTS camp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  points SMALLINT NOT NULL CHECK (points IN (5, 10, 15, 20)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feed / score log
CREATE TABLE IF NOT EXISTS camp_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day TEXT NOT NULL CHECK (day IN ('ma', 'di', 'wo', 'do')),
  trainer TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('points', 'challenge', 'special')),
  target_type TEXT NOT NULL CHECK (target_type IN ('player', 'group')),
  player_id TEXT REFERENCES camp_players(id),
  group_id SMALLINT,
  points SMALLINT NOT NULL,
  challenge_id UUID REFERENCES camp_challenges(id),
  challenge_name TEXT,
  special_category TEXT CHECK (
    special_category IS NULL OR
    special_category IN ('fair_play', 'respect', 'samenwerking', 'inzet')
  ),
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS camp_feed_day_created ON camp_feed (day, created_at DESC);
CREATE INDEX IF NOT EXISTS camp_feed_created ON camp_feed (created_at DESC);

-- Realtime for live wall
ALTER PUBLICATION supabase_realtime ADD TABLE camp_feed;

-- RLS: open for camp week (anon key in browser)
ALTER TABLE camp_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_feed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS camp_players_all ON camp_players;
CREATE POLICY camp_players_all ON camp_players FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS camp_settings_all ON camp_settings;
CREATE POLICY camp_settings_all ON camp_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS camp_challenges_all ON camp_challenges;
CREATE POLICY camp_challenges_all ON camp_challenges FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS camp_feed_all ON camp_feed;
CREATE POLICY camp_feed_all ON camp_feed FOR ALL USING (true) WITH CHECK (true);

-- Seed 60 players
INSERT INTO camp_players (id, full_name, nickname) VALUES
  ('camp-p1', 'Arthur Rozemulder', 'Arthur'),
  ('camp-p2', 'Dann Onderdijk', 'Dann'),
  ('camp-p3', 'Mees van Wersch', 'Mees'),
  ('camp-p4', 'Stijn Langendoen', 'Stijn'),
  ('camp-p5', 'Beau van der Reiden', 'Beau'),
  ('camp-p6', 'Enzo Lobs', 'Enzo L'),
  ('camp-p7', 'Bor de Wolf', 'Bor'),
  ('camp-p8', 'Lars Rijke', 'Lars'),
  ('camp-p9', 'Fayenne Mudde', 'Fayenne'),
  ('camp-p10', 'Juliette', 'Xavier'),
  ('camp-p11', 'Flynn Wolterbeek', 'Flynn'),
  ('camp-p12', 'Lukas Langendoen', 'Lukas'),
  ('camp-p13', 'Casper den Haan', 'Casper'),
  ('camp-p14', 'Raymond den Haan', 'Raymond'),
  ('camp-p15', 'Riven Klein', 'Riven'),
  ('camp-p16', 'Chazz Klein', 'Chazz'),
  ('camp-p17', 'Hayden Klein', 'Hayden'),
  ('camp-p18', 'Vinn de Bloeme', 'Vinn'),
  ('camp-p19', 'Kai de Laat', 'Kai'),
  ('camp-p20', 'Lasse de Laat', 'Lasse'),
  ('camp-p21', 'Siem Timmerman', 'Siem'),
  ('camp-p22', 'Celina Van der Veen', 'Celina'),
  ('camp-p23', 'Kayleigh van der Veen', 'Kayleigh'),
  ('camp-p24', 'Enzo Landman', 'Enzo La'),
  ('camp-p25', 'Luc Vos', 'Luc'),
  ('camp-p26', 'Sanne Dikmans', 'Sanne'),
  ('camp-p27', 'Raúl Monfrooij', 'Raúl'),
  ('camp-p28', 'Noa van Lankeren', 'Noa'),
  ('camp-p29', 'Tijn van Wijk', 'Tijn W'),
  ('camp-p30', 'Fay van Bogeriej', 'Fay'),
  ('camp-p31', 'Lou van Bogerijen', 'Lou'),
  ('camp-p32', 'Philou Spuijbroek Kievid', 'Philou'),
  ('camp-p33', 'Olivia Spuijbroek Kievid', 'Olivia S'),
  ('camp-p34', 'Esmee Weeda', 'Esmee'),
  ('camp-p35', 'Niilo Baars', 'Niilo'),
  ('camp-p36', 'Just Baars', 'Just'),
  ('camp-p37', 'Sev Onderdijk', 'Sev'),
  ('camp-p38', 'Jadie menheere', 'Jadie'),
  ('camp-p39', 'Naud Bal', 'Naud'),
  ('camp-p40', 'Dieuwertje Meijer', 'Dieuwertje'),
  ('camp-p41', 'Puck Wouters', 'Puck'),
  ('camp-p42', 'Floor Kruit', 'Floor K'),
  ('camp-p43', 'Senna', 'Senna'),
  ('camp-p44', 'Benthe Steenbergen', 'Benthe'),
  ('camp-p45', 'Thijm de Cocq', 'Thijm'),
  ('camp-p46', 'Vince Frentzen', 'Vince'),
  ('camp-p47', 'Julie Frentzen', 'Julie'),
  ('camp-p48', 'Kaelynn Langbroek', 'Kaelynn'),
  ('camp-p49', 'Dede van Nieuwenhoven', 'Dede'),
  ('camp-p50', 'Jits Timmerman', 'Jits'),
  ('camp-p51', 'Marie-Lou Klootwijk', 'Marie-Lou'),
  ('camp-p52', 'Sophie Rozemulder', 'Sophie'),
  ('camp-p53', 'Floris Vinks', 'Floris'),
  ('camp-p54', 'Olivia van den Berg', 'Olivia v'),
  ('camp-p55', 'Valerie van den Berg', 'Valerie'),
  ('camp-p56', 'Lily van der Heijden', 'Lily'),
  ('camp-p57', 'Vere Mol', 'Vere'),
  ('camp-p58', 'Youp Dijkman', 'Youp'),
  ('camp-p59', 'Tijn van Es', 'Tijn E'),
  ('camp-p60', 'Georgina Jones', 'Georgina')
ON CONFLICT (id) DO NOTHING;
