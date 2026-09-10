-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- for your bestmart project.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  is_seller boolean not null default false,
  business_name text,
  business_category text,
  business_address text,
  store_description text,
  business_logo text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone can only ever see/change their own row. Nothing today needs a
-- public storefront view of profiles — seller names are already copied
-- onto each product at creation time.
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);
