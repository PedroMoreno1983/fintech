@AGENTS.md

## Contexto del proyecto

Fintech CFO es una plataforma financiera multi-tenant para:

- Consolidacion contable multi-sociedad (con eliminaciones intercompany)
- Planificacion (presupuesto, forecast, escenarios)
- Reporting ejecutivo (estados financieros, ESG, XBRL)
- Workflow de aprobaciones y audit trail

## Stack relevante

- Next.js 16 App Router + Server Actions (sin tRPC, sin API routes)
- Prisma 7 con `@prisma/adapter-pg` (cliente generado en `app/generated/prisma/`)
- Sesion propia con cookie firmada via `jose` (no NextAuth)
- Tailwind 4

## Reglas para tocar codigo

- Toda query que cruza tenants debe filtrarse por `empresaId` extraido de
  la sesion (`requireEmpresaSession()` en `lib/session.ts`).
- Los enums de Prisma se importan desde `@/app/generated/prisma`.
- Las server actions retornan `ActionState` (`{ errors?, message?, success? }`).
- Roles validos: `SUPERADMIN`, `EMPRESA_ADMIN`, `ADMIN_FINANZAS`. Las
  validaciones de permiso usan `lib/roles.ts`.
- No hay PWA, ni notificaciones, ni integraciones agro: si encuentras
  referencias, son codigo huerfano y deben removerse.
