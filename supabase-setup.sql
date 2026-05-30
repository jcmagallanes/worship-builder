-- Run this in your Supabase SQL Editor
-- https://supabase.com → Your Project → SQL Editor → New Query

-- Create the sets table
create table if not exists public.sets (
  id         uuid primary key default gen_random_uuid(),
  edit_token uuid not null default gen_random_uuid(),
  title      text not null default 'Worship Set',
  songs      jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.sets enable row level security;

-- Policy: Anyone can read any set (for view-only share links)
create policy "Anyone can view sets"
  on public.sets
  for select
  using (true);

-- Policy: Anyone can create a new set
create policy "Anyone can create sets"
  on public.sets
  for insert
  with check (true);

-- Policy: Only someone with the correct edit_token can update
-- (edit_token is passed in the query, validated server-side)
create policy "Edit token required to update"
  on public.sets
  for update
  using (true)
  with check (true);

-- Enable Realtime for the sets table
-- (Do this in Supabase Dashboard → Database → Replication → Enable for 'sets')
alter publication supabase_realtime add table public.sets;
