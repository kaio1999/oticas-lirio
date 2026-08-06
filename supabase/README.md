# Supabase — Óticas Lírio

## 1. Criar projeto
1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Em **Project Settings → API**, copie URL e keys

## 2. Schema
No **SQL Editor**, rode o arquivo `schema.sql` deste diretório.

## 3. Variáveis de ambiente
Na raiz do repo:

```bash
cp supabase/.env.example .env.local
```

Preencha `NEXT_PUBLIC_SUPABASE_URL`, a chave pública
(`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`) e
`SUPABASE_SERVICE_ROLE_KEY` / secret (esta última só para o seed).

## 4. Seed (dados iniciais)
```bash
npm run db:seed
```

Isso envia os produtos e dados da loja que estão em `src/data/`.

## 5. Rodar o site
```bash
npm run dev
```

Com as env vars configuradas, `src/services/*` lê do Supabase.
Sem elas, o site continua usando os mocks locais (fallback).

## Produção (Vercel)
- Conecte o repositório
- Adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Não** coloque `SUPABASE_SERVICE_ROLE_KEY` como variável pública
- Domínio custom opcional

## Próximos passos
- Painel `/admin` com Auth (e-mail/senha) — ver `ADMIN.md`
- Upload de fotos no bucket `products`
- Pedidos / pagamento (futuro)
