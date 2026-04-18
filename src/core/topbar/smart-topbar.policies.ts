import { can } from '@/shared/lib/rbac/can'
import { isActionAllowedByClientTypeMatrix } from '@/core/policy/clientType.matrix'
import { DEFAULT_ACTION_PERMISSIONS } from '@/core/policy/resource.permissions'

import type { ResourceKey } from '@/core/rbac/policy'
import type { ClientType } from '@/types/api/clients'

import type { SmartActionKey, SmartActionPermissionMap } from './smart-topbar.types'

export const isActionAllowedByClientType = (action: SmartActionKey, clientType?: ClientType): boolean => {
  return isActionAllowedByClientTypeMatrix(action, clientType)
}

export const isActionAllowedByRBAC = (
  action: SmartActionKey,
  roles: string[] | undefined,
  resource: ResourceKey | undefined,
  permissionsMap?: SmartActionPermissionMap
): boolean => {
  if (!resource) return true

  const permission =
    permissionsMap?.[action] ??
    (action in DEFAULT_ACTION_PERMISSIONS
      ? DEFAULT_ACTION_PERMISSIONS[action as keyof typeof DEFAULT_ACTION_PERMISSIONS]
      : undefined)

  if (!permission) return true

  return can(roles, resource, permission)
}
