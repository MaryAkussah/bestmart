-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- for your bestmart project, after 001-003.

-- One conversation per (buyer, seller) pair -- every message between two
-- people lives in a single thread, like a normal chat app, not split per
-- product. A message can still reference which product prompted it.
--
-- buyer_id/seller_id/sender_id reference profiles (not auth.users directly)
-- so PostgREST can auto-embed each participant's name/business_name via a
-- normal FK join (`.select('*, buyer:buyer_id(name)')`) instead of a
-- separate round trip per conversation. Safe to assume a profiles row
-- always exists here: every path that reaches an authenticated state in
-- this app already created one (see AuthContext.jsx).
create table if not exists public.conversations (
  id bigint generated always as identity primary key,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  last_message_at timestamptz not null default now(),
  buyer_last_read_at timestamptz not null default now(),
  seller_last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (buyer_id, seller_id)
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  conversation_id bigint not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  body text not null,
  product_id bigint,
  product_name text,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Participants view their own conversations"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Participants create their own conversations"
  on public.conversations for insert
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Participants update their own conversations"
  on public.conversations for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Participants view messages in their conversations"
  on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  ));

create policy "Participants send messages in their conversations"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
