-- Add new place categories to existing enum
ALTER TYPE public.place_category ADD VALUE 'art_installation' BEFORE 'other';
ALTER TYPE public.place_category ADD VALUE 'landmark' BEFORE 'other';
ALTER TYPE public.place_category ADD VALUE 'office' BEFORE 'other';
