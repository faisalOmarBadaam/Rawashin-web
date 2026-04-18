import type { AppRole } from '@/configs/roles'
import {
  hasAllRoles as hasAllRolesCore,
  hasAnyRole as hasAnyRoleCore,
  hasRole as hasRoleCore,
} from '@/core/auth/roles'
import {
  canAccess,
  isRestrictedChargerAllowedRoute,
  isRestrictedChargerRoleSet,
} from '@/core/rbac/canAccess'

/**
 * Checks if a user has a specific role.
 */
export const hasRole = (userRoles: string[], role: AppRole): boolean => {
  return hasRoleCore(userRoles, role)
}

/**
 * Checks if a user has ANY of the specified roles.
 */
export const hasAnyRole = (userRoles: string[], roles: AppRole[]): boolean => {
  return hasAnyRoleCore(userRoles, roles)
}

/**
 * Checks if a user has ALL of the specified roles.
 */
export const hasAllRoles = (userRoles: string[], roles: AppRole[]): boolean => {
  return hasAllRolesCore(userRoles, roles)
}

/**
 * Determines if a user can access the dashboard.
 * Rules:
 * - Must have at least one of DASHBOARD_ALLOWED_ROLES (Admin, Employee, Charger).
 * - If user has restricted roles (Partner, Merchant, Customer, Profit, ProfitAccount),
 *   they are ONLY allowed if they ALSO have an allowed role (Admin, Employee, Charger).
 */
export const canAccessDashboard = (userRoles: string[]): boolean => {
  return canAccess({
    roles: userRoles,
    resource: 'dashboard',
    action: 'read',
  })
}

/**
 * Checks if the user is a "Charger Only" user suitable for restriction.
 * This effectively means they DO NOT have Admin or Employee roles.
 */
export const isRestrictedCharger = (userRoles: string[]): boolean => {
  return isRestrictedChargerRoleSet(userRoles)
}

/**
 * Checks if a specific route is allowed for a restricted Charger user.
 */
export const isRouteAllowedForCharger = (path: string): boolean => {
  return isRestrictedChargerAllowedRoute(path)
}

/**
 * Start of an audit log entry.
 */
export const logSecurityEvent = (
  userRoles: string[],
  action: string,
  target: string,
  allowed: boolean,
  meta?: any,
) => {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  console.log(`[SECURITY AUDIT]`, {
    timestamp: new Date().toISOString(),
    roles: userRoles,
    action,
    target,
    allowed,
    meta,
  })
}
