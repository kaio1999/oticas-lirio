-- Enquadramento das fotos (mesma ordem de products.images)
-- Rode no SQL Editor do Supabase (DEV e PROD quando for publicar).

alter table public.products
  add column if not exists image_crops jsonb not null default '[]'::jsonb;

comment on column public.products.image_crops is
  'Recortes normalizados por foto: [{x,y,width,height}] alinhados a images.';
