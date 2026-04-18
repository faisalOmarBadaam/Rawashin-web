import { can as canByPolicyEngine } from '@/core/rbac/policyEngine'
import type { FeatureKey } from './permissions'
import { permissions } from './permissions'

export function canAccess(feature: FeatureKey, roles: string[]) {
  const legacyPermission = permissions[feature]

  return canByPolicyEngine({
    resource: legacyPermission.resource,
    action: legacyPermission.action,
    context: { roles },
  })
}
