import type { ResourceKey } from '@/core/rbac/policy'
import type { ClientType } from '@/types/api/clients'

import type { ActionPermissionMap } from '@/core/policy/resource.permissions'

export type EntityPageMode = 'add' | 'edit' | 'view'

export type EntityActionKey =
  | 'add'
  | 'attachments'
  | 'edit'
  | 'save'
  | 'delete'
  | 'undo'
  | 'cancel'
  | 'print'
  | 'export'
  | 'reprint'
  | 'approve'
  | 'reject'
  | 'post'
  | 'charge'
  | 'assign'
  | 'commission'
  | 'passRest'
  | 'chargeCharger'
  | 'deposit'
  | 'debt'
  | 'roles'

export type ActionHandlers = Partial<Record<EntityActionKey, () => void>>

export type EntityActionTone = 'primary' | 'default' | 'danger'
export type EntityActionGroup = 'primary' | 'secondary' | 'danger'

export type ActionDescriptor = {
  key: EntityActionKey
  label: string
  icon: string
  tone: EntityActionTone
  group: EntityActionGroup
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export type ResolveEntityActionsInput = {
  entity?: string
  mode: EntityPageMode
  roles?: string[]
  resource?: ResourceKey
  permissionsMap?: ActionPermissionMap
  disabledActions?: Partial<Record<EntityActionKey, boolean>>
  clientType?: ClientType
  status?: string
  handlers: ActionHandlers
  dirty?: boolean
  loading?: boolean
}
