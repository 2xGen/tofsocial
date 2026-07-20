-- Kampfoto's: video ondersteuning + grotere uploads
-- Run in Supabase SQL Editor

ALTER TABLE camp_media
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image';

ALTER TABLE camp_media
  DROP CONSTRAINT IF EXISTS camp_media_media_type_check;

ALTER TABLE camp_media
  ADD CONSTRAINT camp_media_media_type_check
  CHECK (media_type IN ('image', 'video'));

-- Bestaande rijen: afleiden uit bestandsextensie
UPDATE camp_media
SET media_type = 'video'
WHERE media_type = 'image'
  AND (
    lower(storage_path) LIKE '%.mp4'
    OR lower(storage_path) LIKE '%.webm'
    OR lower(storage_path) LIKE '%.mov'
    OR lower(storage_path) LIKE '%.m4v'
    OR lower(public_url) LIKE '%.mp4%'
    OR lower(public_url) LIKE '%.webm%'
    OR lower(public_url) LIKE '%.mov%'
  );

-- Max 100 MB per bestand in de camp-media bucket
UPDATE storage.buckets
SET file_size_limit = 104857600
WHERE id = 'camp-media';
