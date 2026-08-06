-- Óticas Lírio — schema inicial (rode no SQL Editor do Supabase)
-- Dashboard → SQL → New query → cole e Execute

create extension if not exists "pgcrypto";

-- Produtos do catálogo
create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text not null default 'Óticas Lírio',
  category text not null check (category in ('grau', 'sol', 'infantil', 'acessorio')),
  price numeric(10, 2) not null check (price >= 0),
  images text[] not null default '{}',
  model_3d_url text,
  shape text not null check (
    shape in ('aviador', 'redondo', 'quadrado', 'gatinho', 'retangular', 'outro')
  ),
  material text not null,
  colors text[] not null default '{}',
  in_stock boolean not null default true,
  description text not null default '',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_featured_idx on public.products (featured) where featured = true;
create index if not exists products_in_stock_idx on public.products (in_stock);

-- Configuração da loja (uma linha)
create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  name text not null,
  legal_name text not null,
  cnpj text not null,
  slogan text not null,
  founder jsonb not null,
  story text not null,
  value_items jsonb not null default '[]',
  differentials text[] not null default '{}',
  address jsonb not null,
  phone text not null,
  phone_e164 text not null,
  email text not null,
  instagram text not null,
  instagram_handle text not null,
  hours jsonb not null default '[]',
  opened_at date not null,
  updated_at timestamptz not null default now()
);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists store_settings_set_updated_at on public.store_settings;
create trigger store_settings_set_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();

-- RLS: leitura pública; escrita só autenticada (admin futuro)
alter table public.products enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "products_auth_write" on public.products;
create policy "products_auth_write"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "store_public_read" on public.store_settings;
create policy "store_public_read"
  on public.store_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "store_auth_write" on public.store_settings;
create policy "store_auth_write"
  on public.store_settings for all
  to authenticated
  using (true)
  with check (true);

-- Storage para fotos de produto (rode depois de criar o bucket no painel, ou via SQL abaixo)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "products_images_public_read" on storage.objects;
create policy "products_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'products');

drop policy if exists "products_images_auth_upload" on storage.objects;
create policy "products_images_auth_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products');

drop policy if exists "products_images_auth_update" on storage.objects;
create policy "products_images_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products');

drop policy if exists "products_images_auth_delete" on storage.objects;
create policy "products_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products');

-- Privileges para a Data API (necessário se "auto expose tables" estiver off)
grant usage on schema public to anon, authenticated, service_role;

grant select on table public.products to anon, authenticated;
grant all on table public.products to service_role;
grant insert, update, delete on table public.products to authenticated;

grant select on table public.store_settings to anon, authenticated;
grant all on table public.store_settings to service_role;
grant insert, update, delete on table public.store_settings to authenticated;
