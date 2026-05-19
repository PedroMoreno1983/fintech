import { Rol } from "@/app/generated/prisma";

export const ADMIN_ROLES: readonly Rol[] = [
  Rol.SUPERADMIN,
  Rol.EMPRESA_ADMIN,
] as const;

export const CFO_ROLES: readonly Rol[] = [
  Rol.SUPERADMIN,
  Rol.EMPRESA_ADMIN,
  Rol.ADMIN_FINANZAS,
] as const;

export function isAdmin(rol: Rol): boolean {
  return ADMIN_ROLES.includes(rol);
}

export function canAccessCfo(rol: Rol): boolean {
  return CFO_ROLES.includes(rol);
}
