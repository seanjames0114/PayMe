-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  organizer_name text not null,
  payment_methods jsonb default '[]'::jsonb,
  subtotal numeric(10,2),
  tax numeric(10,2) not null default 0,
  tip numeric(10,2) not null default 0,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- If the table already exists, run this migration:
-- alter table sessions add column if not exists user_id uuid references auth.users(id) on delete set null;
-- create index if not exists sessions_user_id_idx on sessions(user_id);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  quantity int not null default 1
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  name text not null,
  color text not null,
  is_organizer boolean not null default false,
  joined_at timestamptz not null default now()
);

create table if not exists selections (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  unique(participant_id, item_id)
);

-- Indexes for fast lookups
create index if not exists sessions_user_id_idx on sessions(user_id);
create index if not exists items_session_id_idx on items(session_id);
create index if not exists participants_session_id_idx on participants(session_id);
create index if not exists selections_participant_id_idx on selections(participant_id);
create index if not exists selections_item_id_idx on selections(item_id);

-- Enable Row Level Security (open read/write for now — tighten later with auth)
alter table sessions enable row level security;
alter table items enable row level security;
alter table participants enable row level security;
alter table selections enable row level security;

create policy "Public read sessions" on sessions for select using (true);
create policy "Public insert sessions" on sessions for insert with check (true);

create policy "Public read items" on items for select using (true);
create policy "Public insert items" on items for insert with check (true);

create policy "Public read participants" on participants for select using (true);
create policy "Public insert participants" on participants for insert with check (true);

create policy "Public read selections" on selections for select using (true);
create policy "Public insert selections" on selections for insert with check (true);
create policy "Public delete selections" on selections for delete using (true);

-- Enable Realtime for live table updates
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table selections;
