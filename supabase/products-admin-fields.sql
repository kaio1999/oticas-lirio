-- Campos internos (admin) — não usar na vitrine pública
-- Rode no SQL Editor do Supabase após o schema base.

alter table public.products
  add column if not exists sku text,
  add column if not exists lens_width_mm numeric(6, 1),
  add column if not exists bridge_mm numeric(6, 1),
  add column if not exists temple_mm numeric(6, 1),
  add column if not exists frame_width_mm numeric(6, 1);

comment on column public.products.sku is 'SKU interno — apenas admin';
comment on column public.products.lens_width_mm is 'Largura da lente (mm) — admin / try-on';
comment on column public.products.bridge_mm is 'Ponte (mm) — admin / try-on';
comment on column public.products.temple_mm is 'Haste (mm) — admin / try-on';
comment on column public.products.frame_width_mm is 'Largura total da armação (mm) — admin / try-on';

create unique index if not exists products_sku_unique_idx
  on public.products (sku)
  where sku is not null and sku <> '';
