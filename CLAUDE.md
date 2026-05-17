# App ARQ — CLAUDE.md

## O que é este projeto
App de descoberta de arquitetura pelo mundo. Usuários veem obras em um mapa (Mapbox), compram coleções por cidade/região (Stripe), e recebem acesso ao conteúdo detalhado. Apenas admins adicionam lugares.

## Stack
- **Next.js 16** (App Router, Turbopack) — `src/` dir
- **Supabase** — Auth, PostgreSQL, Storage (RLS ativado)
- **Mapbox GL JS** via `react-map-gl`
- **Stripe** — compras avulsas por coleção
- **Resend** — emails transacionais
- **Tailwind CSS** — tema escuro (stone-950 base, amber-400 accent)

## Estrutura de rotas
```
/                     → Landing page pública
/(auth)/login         → Login
/(auth)/register      → Registro
/(auth)/reset-password → Recuperação de senha
/(protected)/map      → Mapa principal (requer login)
/(protected)/collections → Listagem de coleções para compra
/(admin)/admin        → Painel admin (requer role=admin)
/(admin)/admin/collections → CRUD coleções
/(admin)/admin/places → CRUD lugares
/api/auth/signout     → POST logout
/api/stripe/webhook   → Webhook Stripe (M4)
/api/stripe/checkout  → Criar session Stripe (M4)
```

## Proteção de rotas
`src/proxy.ts` (Next.js 16 — substitui middleware) intercepta todas as rotas:
- Não autenticado → redireciona para `/login?next=<path>`
- Admin em rota `/admin` → valida `profiles.role = 'admin'`

## Banco de dados
Schema completo em `supabase/schema.sql`. Tabelas principais:
- `profiles` — sincronizado via trigger com `auth.users`
- `collections` — cidades/regiões com preço e `stripe_price_id`
- `places` — obras arquitetônicas com lat/lng e categoria
- `place_images`, `place_facts` — conteúdo de cada lugar
- `user_purchases` — quais coleções cada user desbloqueou

## Variáveis de ambiente
Veja `.env.local` — todas com comentários explicativos.

## Milestones
- **M1** ✅ Fundação: setup, auth, roles, rotas protegidas
- **M2** Mapa Mapbox com pins, página de detalhe de lugar
- **M3** CMS admin: CRUD coleções e lugares com upload de fotos
- **M4** Stripe: compra avulsa, webhook, liberação de acesso
- **M5** Busca e filtros
- **M6** Polish, SEO, emails, deploy

## Convenções
- Componentes server por padrão; `'use client'` só quando necessário
- `useSearchParams()` sempre dentro de `<Suspense>`
- Clientes Supabase: `src/lib/supabase/client.ts` (browser), `server.ts` (RSC/Route), `admin.ts` (service role — nunca expor ao cliente)
- Formatação BRL: `formatCurrency()` em `src/lib/utils.ts`
