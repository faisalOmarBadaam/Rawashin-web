import { can } from '@/shared/lib/rbac/can'

import type { ResourceKey } from '@/core/rbac/policy'
import type { ActionPermissionMap } from '@/core/policy/resource.permissions'

import { DEFAULT_ACTION_PERMISSIONS } from '@/core/policy/resource.permissions'

import type { EntityActionKey } from './action.types'

export const isActionAllowedByPermissions = (
  action: EntityActionKey,
  roles: string[] | undefined,
  resource: ResourceKey | undefined,
  permissionsMap?: ActionPermissionMap
): boolean => {
  if (!resource) return true

  const permission = permissionsMap?.[action] ?? DEFAULT_ACTION_PERMISSIONS[action]

  return can(roles, resource, permission)
}
