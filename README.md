# PayMe

Split restaurant bills with friends. Snap a receipt, share a link, everyone picks what they ordered and pays you via Venmo, Cash App, PayPal, or Zelle.

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the following SQL in the Supabase SQL editor:

```sql
create table sessions (
  id uuid primary key default gen_random_uuid(),
  organizer_name text not null,
  payment_methods jsonb default '[]',
  subtotal numeric(10,2),
  tax numeric(10,2) default 0,
  tip numeric(10,2) default 0,
  created_at timestamptz default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  quantity int default 1
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  name text not null,
  color text not null,
  is_organizer boolean default false,
  joined_at timestamptz default now()
);

create table selections (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  item_id uuid references items(id) on delete cascade,
  unique(participant_id, item_id)
);

-- Enable realtime
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table selections;
```

3. In **Project Settings → API**, copy your Project URL and anon key.

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

1. **Upload** — Take a photo of your receipt. Tesseract.js (free, runs in your browser) reads the text.
2. **Review** — Edit the extracted items, add tax and tip if needed.
3. **Share** — Set your payment handles (Venmo, Cash App, PayPal, Zelle) and share the link.
4. **Claim** — Friends open the link, enter their name, and tap the items they ordered.
5. **Pay** — Everyone sees exactly what they owe and pays you in one tap.
