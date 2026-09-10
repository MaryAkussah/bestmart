-- Fixes conversations/messages foreign keys that ended up pointing at
-- auth.users instead of public.profiles (diagnosed via pg_constraint —
-- the version of 004_messaging.sql that actually ran was an earlier draft
-- referencing auth.users). auth.users isn't reachable through PostgREST,
-- so the embedded-join queries in Messages.jsx (`buyer:buyer_id(name)`)
-- fail with "Could not find a relationship" until these point at profiles
-- instead, which IS exposed via the API.

alter table public.conversations drop constraint if exists conversations_buyer_id_fkey;
alter table public.conversations drop constraint if exists conversations_seller_id_fkey;
alter table public.messages drop constraint if exists messages_sender_id_fkey;

alter table public.conversations
  add constraint conversations_buyer_id_fkey foreign key (buyer_id)
  references public.profiles (id) on delete cascade;

alter table public.conversations
  add constraint conversations_seller_id_fkey foreign key (seller_id)
  references public.profiles (id) on delete cascade;

alter table public.messages
  add constraint messages_sender_id_fkey foreign key (sender_id)
  references public.profiles (id);

notify pgrst, 'reload schema';
