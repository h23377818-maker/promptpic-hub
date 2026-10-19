-- Run this in Supabase Dashboard > SQL Editor.
-- Community submissions are private to the public gallery until an admin approves them.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  prompt text not null check (char_length(prompt) between 1 and 3000),
  image_url text not null,
  storage_path text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

-- Visitors can only see approved entries.
create policy "Public can read approved posts"
on public.posts for select
using (status = 'approved');

-- Submissions are inserted as pending only; do not allow users to approve themselves.
create policy "Visitors can submit pending posts"
on public.posts for insert
with check (status = 'pending');

-- Create a public Storage bucket named community-images in Storage dashboard.
-- For a production site, add upload rate limits, file scanning, admin authentication,
-- takedown/report workflows, and stronger anti-abuse controls before opening to everyone.
