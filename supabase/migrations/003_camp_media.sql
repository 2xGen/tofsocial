-- TOF Social · Kampfoto's op de kampwand
-- Run in Supabase SQL Editor (run all, or step by step)

-- 1. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('camp-media', 'camp-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Media table
CREATE TABLE IF NOT EXISTS camp_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS camp_media_created ON camp_media (created_at DESC);

-- 3. Realtime (skip this line if you get "already member of publication")
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE camp_media;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 4. RLS on camp_media (must be exactly: ROW LEVEL SECURITY)
ALTER TABLE camp_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS camp_media_all ON camp_media;
CREATE POLICY camp_media_all ON camp_media FOR ALL USING (true) WITH CHECK (true);

-- 5. Storage policies
DROP POLICY IF EXISTS camp_media_storage_read ON storage.objects;
CREATE POLICY camp_media_storage_read ON storage.objects
  FOR SELECT USING (bucket_id = 'camp-media');

DROP POLICY IF EXISTS camp_media_storage_insert ON storage.objects;
CREATE POLICY camp_media_storage_insert ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'camp-media');

DROP POLICY IF EXISTS camp_media_storage_delete ON storage.objects;
CREATE POLICY camp_media_storage_delete ON storage.objects
  FOR DELETE USING (bucket_id = 'camp-media');
