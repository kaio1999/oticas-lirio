# Óticas Lírio

Site da Óticas Lírio — catálogo e páginas institucionais.

## Stack

- **Next.js 16** (App Router) + TypeScript
- Tailwind CSS 4
- **Supabase** (Postgres + Storage) — com fallback para mocks locais

## Começar

```bash
npm install
cp supabase/.env.example .env.local   # opcional até configurar o Supabase
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Sem as variáveis do Supabase, o site usa os dados em `src/data/`.

## Supabase

Guia completo: [`supabase/README.md`](./supabase/README.md)

1. Criar projeto no Supabase  
2. Rodar `supabase/schema.sql` no SQL Editor  
3. Preencher `.env.local`  
4. `npm run db:seed`

## Rotas

| Rota | Página |
|---|---|
| `/` | Home |
| `/produtos` | Catálogo |
| `/produtos/[id]` | Detalhe |
| `/sobre` | A loja |
| `/fundadora` | Fundadora |
| `/contato` | Contato |

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm start` — servir build
- `npm run lint` — ESLint
- `npm run db:seed` — popular Supabase com os mocks

## Admin

Painel em `/admin/login` (e-mail + senha).  
Guia: [`supabase/ADMIN.md`](./supabase/ADMIN.md)
