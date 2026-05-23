-- ============================================================
-- M: Convert place_category enum → categories table
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  slug        text PRIMARY KEY,
  label       text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories: public read" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "categories: admin all" ON public.categories
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- 2. Seed all existing categories + education
INSERT INTO public.categories (slug, label, order_index) VALUES
  ('art_installation', 'Art Installation', 0),
  ('bridge',           'Bridge',           1),
  ('commercial',       'Commercial',       2),
  ('education',        'Education',        3),
  ('landmark',         'Landmark',         4),
  ('landscape',        'Landscape',        5),
  ('museum',           'Museum',           6),
  ('office',           'Office',           7),
  ('other',            'Other',            8),
  ('public',           'Public Space',     9),
  ('religious',        'Religious',        10),
  ('residential',      'Residential',      11)
ON CONFLICT (slug) DO NOTHING;

-- 3. Change places.category from enum to text
ALTER TABLE public.places
  ALTER COLUMN category TYPE text USING category::text;

ALTER TABLE public.places
  ALTER COLUMN category SET DEFAULT 'other';

-- 4. Drop the old enum
DROP TYPE IF EXISTS public.place_category;
