import { AppRole } from '@/configs/roles'

const normalizeRoles = (roles: string[] | undefined | null): string[] => {
  if (!Array.isArray(roles)) return []

  return roles.filter(Boolean)
}

export const hasRole = (roles: string[] | undefined | null, role: AppRole): boolean => {
  return normalizeRoles(roles).includes(role)
}

export const hasAnyRole = (roles: string[] | undefined | null, checkRoles: AppRole[]): boolean => {
  const safeRoles = normalizeRoles(roles)

  return checkRoles.some(role => safeRoles.includes(role))
}

export const hasAllRoles = (roles: string[] | undefined | null, checkRoles: AppRole[]): boolean => {
  const safeRoles = normalizeRoles(roles)

  return checkRoles.every(role => safeRoles.includes(role))
}

export const isAdmin = (roles: string[] | undefined | null): boolean => hasRole(roles, AppRole.Admin)
export const isEmployee = (roles: string[] | undefined | null): boolean => hasRole(roles, AppRole.Employee)
export const isCharger = (roles: string[] | undefined | null): boolean => hasRole(roles, AppRole.Charger)
