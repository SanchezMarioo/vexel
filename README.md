# Seller Landing Page

Landing page + authenticated private area built with Next.js 16.

## Stack

- Next.js 16 (App Router)
- NextAuth (credentials + Google OAuth)
- Supabase Postgres (users + projects)
- Tailwind CSS 4

## Auth and Private Area

Implemented routes:

- `/auth/login`
- `/auth/register`
- `/cuenta`
- `/cuenta/proyectos`
- `/cuenta/proyectos/[projectId]`
- `/cuenta/perfil`

Protection is handled in `proxy.ts` for Next.js 16.

## Local Setup

1. Install dependencies:

```bash
pnpm.cmd install
```

1. Create env file from template:

```bash
copy .env.example .env.local
```

1. Run SQL in Supabase:

- Open Supabase SQL editor
- Execute `supabase/schema.sql`

1. Start dev server:

```bash
pnpm.cmd dev
```

1. Open <http://localhost:3000>

## Required Environment Variables

See `.env.example`.

Minimum required for credentials login + private area:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`

Optional (Google OAuth):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Migration Strategy

The implementation is split by contract and adapters to reduce lock-in:

- Contract: `lib/auth/contracts.ts`
- Service entrypoint: `lib/auth/service.ts`
- Provider adapter: `lib/auth/options.ts`

Migration guide:

- `docs/auth-migration.md`

## Quality Commands

```bash
pnpm.cmd lint
pnpm.cmd build
```
