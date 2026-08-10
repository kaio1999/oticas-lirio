# Supabase — Óticas Lírio

## Dois ambientes

| Ambiente | Projeto Supabase | Onde configura |
|----------|------------------|----------------|
| **DEV** | `jdfcsnaqzllhhrjzeybq` | `.env.local` + Vercel Development |
| **PRODUÇÃO** | `tmjnksgwrysxjqamwcsi` | Vercel Production / Preview |

Testar criação de produto no `npm run dev` **não** altera o site no ar.

### Comandos (sempre no banco do `.env.local`)
```bash
npm run db:seed                 # sobe mocks (DEV)
CONFIRM=YES npm run db:clear-products   # apaga produtos
```

### SQL em projeto novo
Ordem no SQL Editor: `schema.sql` → `grants.sql` → `admin-schema.sql`  
(+ `products-admin-fields.sql` / `products-promo.sql` se o schema base ainda não tiver).

Bucket Storage: `products` (leitura pública).

Admin: ver `ADMIN.md` (criar usuário + profile no projeto correspondente).
