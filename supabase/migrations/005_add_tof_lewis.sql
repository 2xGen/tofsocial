-- TOF kamp: speler Lewis toevoegen
INSERT INTO camp_players (id, full_name, nickname, group_id, camp_id)
VALUES ('camp-p61', 'Lewis', 'Lewis', NULL, 'tof')
ON CONFLICT (id) DO NOTHING;
