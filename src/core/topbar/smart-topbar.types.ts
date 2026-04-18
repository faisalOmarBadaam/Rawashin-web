import type { PermissionKey, ResourceKey } from '@/core/rbac/policy'

import type { ClientType } from '@/types/api/clients'

export type SmartTopbarMode = 'add' | 'edit' | 'view'

export type SmartActionKey =
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

export type SmartActionPermissionMap = Partial<Record<SmartActionKey, PermissionKey>>

export type SmartTopBarConfig = {
  mode: SmartTopbarMode
  roles?: string[]
  resource?: ResourceKey
  permissionsMap?: SmartActionPermissionMap
  disabledActions?: Partial<Record<SmartActionKey, boolean>>
  dirty?: boolean
  loading?: boolean
  status?: string
  clientType?: ClientType
  pathname?: string
  actions: Partial<Record<SmartActionKey, () => void>>
}

export type SmartActionTone = 'primary' | 'default' | 'danger'

export type SmartActionGroup = 'primary' | 'secondary' | 'danger'

export type ResolvedTopbarAction = {
  key: SmartActionKey
  label: string
  icon: string
  tone: SmartActionTone
  group: SmartActionGroup
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}
