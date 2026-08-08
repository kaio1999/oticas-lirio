# Admin — Óticas Lírio

Painel em `/admin` com login **e-mail + senha** (Supabase Auth).

## 1. Rodar o schema de admin

No SQL Editor do Supabase, execute:

`supabase/admin-schema.sql`

Se o catálogo já existir e ainda não tiver SKU/medidas, rode também:

`supabase/products-admin-fields.sql`

(campos internos: SKU e medidas em mm — só no admin)

Para promoções de/para na vitrine, rode:

`supabase/products-promo.sql`

(coluna `promo_price` — controlada no admin, aparece no catálogo e na home)

## 2. Criar a conta da dona

1. **Authentication → Users → Add user**
2. Informe e-mail + senha (marque e-mail como confirmado)
3. Copie o **UUID** do usuário
4. No SQL Editor:

```sql
insert into public.profiles (id, email, full_name, role, can_manage_products, can_manage_team, active)
values (
  'COLE-O-UUID-AQUI',
  'email-da-juliana@exemplo.com',
  'Juliana Sandanielo Galante',
  'owner',
  true,
  true,
  true
)
on conflict (id) do update set
  role = 'owner',
  can_manage_products = true,
  can_manage_team = true,
  active = true;
```

## 3. Variáveis

Além das keys públicas, o admin de equipe precisa da secret no `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=sb_secret_..._ou_service_role
```

(usada só no servidor para criar funcionárias)

## 4. Acessar

1. `npm run dev`
2. Abra http://localhost:3000/admin/login
3. Entre com o e-mail/senha da dona

## Permissões

| Papel | Produtos | Equipe |
|-------|----------|--------|
| **owner** (dona) | sim | sim |
| **staff** | conforme checkbox | conforme checkbox (só owner concede) |

A dona cadastra funcionárias em **Admin → Equipe**, define senha inicial e o que cada uma pode fazer.
