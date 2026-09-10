-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- for your bestmart project, after 001_profiles.sql.

-- Products: publicly readable, only the owning seller can write.
-- Identity starts at 1000 so real product ids never collide with the
-- static demo catalog's ids (1-12), since both lists get merged client-side.
create table if not exists public.products (
  id bigint generated always as identity (start with 1000) primary key,
  seller_id uuid references auth.users (id) on delete cascade,
  seller text not null,
  name text not null,
  category text not null,
  price numeric not null,
  old_price numeric,
  images jsonb not null default '[]'::jsonb,
  rating numeric,
  is_new boolean not null default false,
  best_seller boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view products"
  on public.products for select
  using (true);

create policy "Sellers manage their own products"
  on public.products for all
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

-- Cart: private per user. product_snapshot holds the display fields at
-- add-time (name/price/category/images/seller) so rendering never needs a
-- join back to products - same "snapshot, don't re-sync" behavior the
-- current localStorage cart already has. No FK on product_id: it may point
-- at a static demo product that was never inserted into `products`.
create table if not exists public.cart_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id bigint not null,
  product_snapshot jsonb not null,
  qty int not null default 1,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "Users manage their own cart"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Orders: header row per checkout, owned by the buyer.
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  total numeric not null,
  status text not null default 'Processing',
  created_at timestamptz not null default now()
);

-- Order items: one row per product per order. seller_id can't be forged by
-- the buyer's client - the insert check cross-references the real product
-- row (or requires null, for a static demo product with no real seller).
create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders (id) on delete cascade,
  product_id bigint not null,
  seller_id uuid references auth.users (id),
  price numeric not null,
  qty int not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Buyers view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Buyers create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Sellers view orders containing their items"
  on public.orders for select
  using (exists (
    select 1 from public.order_items oi where oi.order_id = orders.id and oi.seller_id = auth.uid()
  ));

create policy "Sellers update status of orders containing their items"
  on public.orders for update
  using (exists (
    select 1 from public.order_items oi where oi.order_id = orders.id and oi.seller_id = auth.uid()
  ));

create policy "Buyers view their own order items"
  on public.order_items for select
  using (exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
  ));

create policy "Sellers view their own order items"
  on public.order_items for select
  using (auth.uid() = seller_id);

create policy "Buyers create order items on their own orders"
  on public.order_items for insert
  with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
    and (
      seller_id is null
      or seller_id = (select p.seller_id from public.products p where p.id = product_id)
    )
  );

-- Storage: product photos, publicly viewable, seller can only write into
-- their own uid-named folder.
insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Sellers manage their own product image files"
  on storage.objects for all
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
