
-- Add new columns to nodes table
ALTER TABLE public.nodes 
  ADD COLUMN IF NOT EXISTS messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS is_expanded boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'linear',
  ADD COLUMN IF NOT EXISTS position_x double precision DEFAULT 0,
  ADD COLUMN IF NOT EXISTS position_y double precision DEFAULT 0;

-- Migrate existing data: convert content/role into messages array
UPDATE public.nodes 
SET messages = jsonb_build_array(jsonb_build_object('role', role, 'content', content))
WHERE messages = '[]'::jsonb AND content IS NOT NULL AND content != '';
