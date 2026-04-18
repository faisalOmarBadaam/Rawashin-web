import type { PermissionKey, ResourceKey } from './policy'

export type PermissionRegistry = Record<ResourceKey, readonly PermissionKey[]>

export const permissionRegistry: PermissionRegistry = {
  dashboard: ['read', 'create', 'update', 'delete'],
  clients: ['read', 'create', 'update', 'delete'],
  employees: ['read', 'create', 'update', 'delete'],
  settlements: ['read', 'create', 'update', 'delete'],
  transactions: ['read', 'create', 'update', 'delete'],
  users: ['read', 'create', 'update', 'delete'],
}
