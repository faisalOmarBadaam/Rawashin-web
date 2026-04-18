import { canAccess } from '@/core/rbac/canAccess'
import type { PermissionKey, ResourceKey } from '@/core/rbac/policy'

export const can = (roles: string[] | undefined | null, resource: ResourceKey, permission: PermissionKey): boolean => {
  return canAccess({
    roles,
    resource,
    action: permission
  })
}
