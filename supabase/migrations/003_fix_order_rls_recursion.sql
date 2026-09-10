-- Fixes "infinite recursion detected in policy for relation orders" from
-- 002_marketplace.sql. Cause: orders' seller-visibility policy queried
-- order_items, whose buyer-visibility policy queried back into orders —
-- a cycle Postgres's RLS planner refuses to evaluate.
--
-- Fix: denormalize buyer_id onto order_items (so its own policies never
-- need to query `orders`), and move the one remaining cross-table check
-- (orders -> order_items, for seller visibility) into a `security definer`
-- helper function, which runs with RLS bypassed internally and so can't
-- recurse back into the calling policy.

alter table public.order_items add column if not exists buyer_id uuid references auth.users (id);

create or replace function public.seller_has_order_item(target_order_id bigint, seller uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.order_items oi
    where oi.order_id = target_order_id and oi.seller_id = seller
  );
$$;

create or replace function public.user_owns_order(target_order_id bigint, buyer uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.orders o
    where o.id = target_order_id and o.user_id = buyer
  );
$$;

drop policy if exists "Sellers view orders containing their items" on public.orders;
create policy "Sellers view orders containing their items"
  on public.orders for select
  using (public.seller_has_order_item(id, auth.uid()));

drop policy if exists "Sellers update status of orders containing their items" on public.orders;
create policy "Sellers update status of orders containing their items"
  on public.orders for update
  using (public.seller_has_order_item(id, auth.uid()));

drop policy if exists "Buyers view their own order items" on public.order_items;
create policy "Buyers view their own order items"
  on public.order_items for select
  using (auth.uid() = buyer_id);

drop policy if exists "Sellers view their own order items" on public.order_items;
create policy "Sellers view their own order items"
  on public.order_items for select
  using (auth.uid() = seller_id);

drop policy if exists "Buyers create order items on their own orders" on public.order_items;
create policy "Buyers create order items on their own orders"
  on public.order_items for insert
  with check (
    buyer_id = auth.uid()
    and public.user_owns_order(order_id, auth.uid())
    and (
      seller_id is null
      or seller_id = (select p.seller_id from public.products p where p.id = product_id)
    )
  );
