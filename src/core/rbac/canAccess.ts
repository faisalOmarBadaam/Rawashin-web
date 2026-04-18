import { i18n } from '@/configs/i18n'
import { AppRole } from '@/configs/roles'

import {
  BLOCKED_DASHBOARD_ROLES,
  CHARGER_ALLOWED_PRIVATE_PATHS,
  RBAC_POLICY,
  type PermissionKey,
  type ResourceKey,
} from './policy'

export type AccessResource = ResourceKey | 'menu'
export type AccessAction = PermissionKey | 'read'

export type AccessParams = {
  roles: string[] | undefined | null
  resource: AccessResource
  action: AccessAction
  variant?: 'clients' | 'employees' | 'users' | 'merchants'
  route?: string
  acl?: string[]
}

const normalizeRoles = (roles: string[] | undefined | null): string[] => {
  if (!Array.isArray(roles)) return []

  return roles.filter(Boolean)
}

export const normalizeRoutePath = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return '/'

  const [firstSegment, ...restSegments] = segments
  const withoutLocale = i18n.locales.includes(firstSegment as (typeof i18n)['locales'][number])
    ? restSegments
    : segments

  return withoutLocale.length > 0 ? `/${withoutLocale.join('/')}` : '/'
}

export const getLocaleFromPath = (pathname: string): string => {
  const segment = pathname.split('/').filter(Boolean)[0]

  return i18n.locales.includes(segment as (typeof i18n)['locales'][number])
    ? segment
    : i18n.defaultLocale
}

const isRouteAllowedForRestrictedCharger = (normalizedPath: string) => {
  return CHARGER_ALLOWED_PRIVATE_PATHS.some(
    route => normalizedPath === route || normalizedPath.startsWith(`${route}/`),
  )
}

const hasAnyBlockedDashboardRole = (roles: string[]) => {
  return roles.some(role => BLOCKED_DASHBOARD_ROLES.includes(role as AppRole))
}

const isRestrictedCharger = (roles: string[]) => {
  const isCharger = roles.includes(AppRole.Charger)
  const hasElevatedRole = roles.includes(AppRole.Admin) || roles.includes(AppRole.Employee)

  return isCharger && !hasElevatedRole
}

export const hasBlockedDashboardRole = (roles: string[] | undefined | null): boolean => {
  return hasAnyBlockedDashboardRole(normalizeRoles(roles))
}

export const isRestrictedChargerRoleSet = (roles: string[] | undefined | null): boolean => {
  return isRestrictedCharger(normalizeRoles(roles))
}

export const isRestrictedChargerAllowedRoute = (route: string): boolean => {
  return isRouteAllowedForRestrictedCharger(normalizeRoutePath(route))
}

export const canAccess = ({ roles, resource, action, route, acl }: AccessParams): boolean => {
  const safeRoles = normalizeRoles(roles)

  if (safeRoles.length === 0) return false

  if (acl && acl.length > 0 && !acl.some(role => safeRoles.includes(role))) {
    return false
  }

  const normalizedPath = route ? normalizeRoutePath(route) : null

  if (resource === 'dashboard' && hasAnyBlockedDashboardRole(safeRoles)) {
    return false
  }

  if (
    normalizedPath &&
    isRestrictedCharger(safeRoles) &&
    !isRouteAllowedForRestrictedCharger(normalizedPath)
  ) {
    return false
  }

  if (resource === 'menu') {
    return true
  }

  return safeRoles.some(role => {
    const rolePolicy = RBAC_POLICY[role]

    if (!rolePolicy) return false

    const allowedPermissions = rolePolicy[resource] ?? []

    return allowedPermissions.includes(action as PermissionKey)
  })
}

export const canAccessRoute = (path: string, session?: { roles?: string[] | null }): boolean =>
  canAccess({
    roles: session?.roles,
    resource: 'menu',
    action: 'read',
    route: path,
  })

export const canAccessUI = (
  feature: { resource: AccessResource; action: AccessAction; acl?: string[] },
  session?: { roles?: string[] | null },
): boolean =>
  canAccess({
    roles: session?.roles,
    resource: feature.resource,
    action: feature.action,
    acl: feature.acl,
  })
