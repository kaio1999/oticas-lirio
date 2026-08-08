-- Preço promocional (de/para) — visível na vitrine
-- Rode no SQL Editor do Supabase

alter table public.products
  add column if not exists promo_price numeric(10, 2);

comment on column public.products.promo_price is
  'Preço promocional (para). Se preenchido e menor que price, exibe de/para na vitrine.';

alter table public.products
  drop constraint if exists products_promo_price_check;

alter table public.products
  add constraint products_promo_price_check
  check (promo_price is null or promo_price >= 0);
