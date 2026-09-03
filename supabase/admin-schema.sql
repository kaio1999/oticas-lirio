-- Admin: perfis, permissões e RLS (rode no SQL Editor após o schema.sql)
-- Óticas Lírio

-- Perfis da equipe (1:1 com auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role text not null default 'staff'
    check (role in ('owner', 'staff')),
  can_manage_products boolean not null default true,
  can_manage_team boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_active_idx on public.profiles (active);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper: perfil ativo do usuário atual
create or replace function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.profiles
  where id = auth.uid()
    and active = true
  limit 1;
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and active = true
  );
$$;

create or replace function public.can_manage_products()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and active = true
      and (role = 'owner' or can_manage_products = true)
  );
$$;

create or replace function public.can_manage_team()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and active = true
      and (role = 'owner' or can_manage_team = true)
  );
$$;

-- RLS profiles
alter table public.profiles enable row level security;

drop policy if exists "profiles_read_own_or_team" on public.profiles;
create policy "profiles_read_own_or_team"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or public.can_manage_team()
  );

drop policy if exists "profiles_update_team" on public.profiles;
create policy "profiles_update_team"
  on public.profiles for update
  to authenticated
  using (public.can_manage_team())
  with check (public.can_manage_team());

drop policy if exists "profiles_insert_team" on public.profiles;
create policy "profiles_insert_team"
  on public.profiles for insert
  to authenticated
  with check (public.can_manage_team());

-- Trocar políticas de escrita de produtos/loja
drop policy if exists "products_auth_write" on public.products;
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write"
  on public.products for all
  to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

drop policy if exists "store_auth_write" on public.store_settings;
drop policy if exists "store_admin_write" on public.store_settings;
create policy "store_admin_write"
  on public.store_settings for all
  to authenticated
  using (public.can_manage_team() or public.can_manage_products())
  with check (public.can_manage_team() or public.can_manage_products());

-- Storage: upload só quem gerencia produtos
drop policy if exists "products_images_auth_upload" on storage.objects;
create policy "products_images_auth_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products' and public.can_manage_products());

drop policy if exists "products_images_auth_update" on storage.objects;
create policy "products_images_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products' and public.can_manage_products());

drop policy if exists "products_images_auth_delete" on storage.objects;
create policy "products_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products' and public.can_manage_products());

grant select, insert, update on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

-- ============================================================
-- BOOTSTRAP DA DONA (rode DEPOIS de criar o usuário no Auth):
-- 1. Authentication → Users → Add user → e-mail + senha
-- 2. Copie o UUID do usuário
-- 3. Descomente e ajuste o insert abaixo:
--
-- insert into public.profiles (id, email, full_name, role, can_manage_products, can_manage_team, active)
-- values (
--   'COLE-O-UUID-AQUI',
--   'juliana@email.com',
--   'Juliana Sandanielo Galante',
--   'owner',
--   true,
--   true,
--   true
-- )
-- on conflict (id) do update set
--   role = 'owner',
--   can_manage_products = true,
--   can_manage_team = true,
--   active = true;
-- ============================================================
