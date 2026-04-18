import type { AccessResource } from '@/core/rbac/canAccess'

/**
 * Legacy compatibility mapping (contexts/auth layer).
 * Source of truth is now core/rbac.
 */
export const permissions = {
  home: { resource: 'dashboard', action: 'read' },
  about: { resource: 'dashboard', action: 'read' },
  clients: { resource: 'clients', action: 'read' },
  transactions: { resource: 'transactions', action: 'read' },
  roles: { resource: 'users', action: 'read' },
} as const satisfies Record<string, { resource: AccessResource; action: 'read' }>

export type FeatureKey = keyof typeof permissions
