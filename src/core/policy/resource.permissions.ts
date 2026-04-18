import type { PermissionKey } from '@/core/rbac/policy'

import type { EntityActionKey } from '@/core/engine/action.types'

export type ActionPermissionMap = Partial<Record<EntityActionKey, PermissionKey>>

export const DEFAULT_ACTION_PERMISSIONS: Record<EntityActionKey, PermissionKey> = {
  add: 'create',
  attachments: 'read',
  edit: 'update',
  save: 'update',
  delete: 'delete',
  undo: 'update',
  cancel: 'update',
  print: 'read',
  export: 'read',
  reprint: 'read',
  approve: 'update',
  reject: 'update',
  post: 'update',
  charge: 'update',
  assign: 'update',
  commission: 'update',
  passRest: 'update',
  chargeCharger: 'update',
  deposit: 'update',
  debt: 'update',
  roles: 'update',
}
