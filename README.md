# Fintech CFO

Plataforma financiera para cierre contable, consolidacion multi-sociedad,
planificacion (presupuesto y forecast) y reporting ejecutivo.

## Stack

- Next.js 16 (App Router)
- React 19
- Prisma 7 + PostgreSQL
- Tailwind CSS 4
- Auth propia con cookies firmadas (jose) + bcryptjs

## Setup local

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Variables minimas:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fintech?schema=public"
SESSION_SECRET="<32+ caracteres>"
```

## Credenciales demo (seed)

- Email: `demo@fintech.io`
- Password: `Demo1234!`

## Scripts

- `npm run dev` — Next dev server
- `npm run build` — build de produccion
- `npm run db:generate` — regenerar Prisma Client
- `npm run db:migrate` — crear migracion en dev
- `npm run db:deploy` — aplicar migraciones (prod)
- `npm run db:seed` — sembrar empresa + usuario demo
- `npm run db:ensure-demo` — reconciliar usuario demo en una BD existente
- `npm run db:studio` — Prisma Studio

## Estructura

- `app/(auth)/` — login y registro publicos
- `app/(dashboard)/cfo/` — cockpit, consolidacion, planificacion, reporting
- `app/actions/` — Server Actions (`cfo.ts`, `auth.ts`)
- `lib/` — utilidades server (db, session, cfo helpers, csv)
- `prisma/schema.prisma` — modelo de datos
