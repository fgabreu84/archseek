-- ============================================================
-- APP ARQ — Database Schema
-- Execute no Supabase: Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile; admins can read all
create policy "profiles: own read" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: own update" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- COLLECTIONS (cities / regions)
-- ============================================================
create table public.collections (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  country text not null,
  city text not null,
  cover_image_url text,
  price_brl numeric(10,2) not null default 0,
  stripe_price_id text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.collections enable row level security;

-- Anyone can see published collections
create policy "collections: public read" on public.collections
  for select using (is_published = true);

-- Admins can do everything
create policy "collections: admin all" on public.collections
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  slug        text primary key,
  label       text not null,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories: public read" on public.categories
  for select using (true);

create policy "categories: admin all" on public.categories
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

insert into public.categories (slug, label, order_index) values
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
on conflict (slug) do nothing;

-- ============================================================
-- PLACES
-- ============================================================
create table public.places (
  id uuid primary key default uuid_generate_v4(),
  collection_id uuid references public.collections(id) on delete cascade not null,
  name text not null,
  description text,
  architect text,
  year_built integer,
  category text not null default 'other',
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  cover_image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.places enable row level security;

-- Anyone sees published places (but content is gated in app layer by purchase)
create policy "places: public read" on public.places
  for select using (is_published = true);

create policy "places: admin all" on public.places
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- PLACE IMAGES
-- ============================================================
create table public.place_images (
  id uuid primary key default uuid_generate_v4(),
  place_id uuid references public.places(id) on delete cascade not null,
  url text not null,
  caption text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.place_images enable row level security;

create policy "place_images: public read" on public.place_images
  for select using (true);

create policy "place_images: admin all" on public.place_images
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- PLACE FACTS
-- ============================================================
create table public.place_facts (
  id uuid primary key default uuid_generate_v4(),
  place_id uuid references public.places(id) on delete cascade not null,
  content text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.place_facts enable row level security;

create policy "place_facts: public read" on public.place_facts
  for select using (true);

create policy "place_facts: admin all" on public.place_facts
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- USER PURCHASES
-- ============================================================
create table public.user_purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  collection_id uuid references public.collections(id) on delete cascade not null,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  unique(user_id, collection_id)
);

alter table public.user_purchases enable row level security;

create policy "purchases: own read" on public.user_purchases
  for select using (auth.uid() = user_id);

create policy "purchases: service insert" on public.user_purchases
  for insert with check (true); -- controlled by service role in webhook

create policy "purchases: admin read" on public.user_purchases
  for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- STORAGE BUCKET
-- Execute no Supabase: Dashboard → Storage → New bucket
-- Nome: "images" | Public: true
-- Ou via SQL:
-- ============================================================
insert into storage.buckets (id, name, public) values ('images', 'images', true)
  on conflict (id) do nothing;

-- Admins podem fazer upload
create policy "images: admin upload" on storage.objects
  for insert with check (
    bucket_id = 'images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins podem deletar
create policy "images: admin delete" on storage.objects
  for delete using (
    bucket_id = 'images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Leitura pública (imagens são URLs públicas)
create policy "images: public read" on storage.objects
  for select using (bucket_id = 'images');
