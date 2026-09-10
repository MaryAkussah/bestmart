-- Messages.jsx needs to show each conversation's other participant's
-- display name — but profiles' RLS (from 001_profiles.sql) deliberately
-- only allows viewing your OWN row, so a plain embedded join returns null
-- for the other participant. Rather than loosening profiles' row-level
-- policy (which would expose email/phone/business_address to anyone who
-- messages you, not just their name), this adds a narrow security-definer
-- function: it bypasses RLS internally but only returns name/business_name,
-- and only for profiles the caller actually has a conversation with.

create or replace function public.get_conversation_partner_names(profile_ids uuid[])
returns table (id uuid, name text, business_name text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.name, p.business_name
  from public.profiles p
  where p.id = any(profile_ids)
    and exists (
      select 1 from public.conversations c
      where (c.buyer_id = auth.uid() and c.seller_id = p.id)
         or (c.seller_id = auth.uid() and c.buyer_id = p.id)
    );
$$;

grant execute on function public.get_conversation_partner_names(uuid[]) to authenticated;
