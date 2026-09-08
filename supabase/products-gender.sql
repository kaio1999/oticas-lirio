-- Gênero do modelo (feminino / masculino / unissex)
-- Rode no SQL Editor do Supabase (DEV e PROD)

alter table public.products
  add column if not exists gender text;

update public.products
set gender = 'unissex'
where gender is null or gender = '';

alter table public.products
  alter column gender set default 'unissex';

alter table public.products
  alter column gender set not null;

alter table public.products
  drop constraint if exists products_gender_check;

alter table public.products
  add constraint products_gender_check
  check (gender in ('feminino', 'masculino', 'unissex'));

comment on column public.products.gender is
  'Público do modelo: feminino, masculino ou unissex.';
