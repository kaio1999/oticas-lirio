-- Rode no SQL Editor se o seed der "permission denied"
-- (tabelas criadas sem grant automático para a Data API)

grant usage on schema public to anon, authenticated, service_role;

grant select on table public.products to anon, authenticated;
grant all on table public.products to service_role;
grant insert, update, delete on table public.products to authenticated;

grant select on table public.store_settings to anon, authenticated;
grant all on table public.store_settings to service_role;
grant insert, update, delete on table public.store_settings to authenticated;
