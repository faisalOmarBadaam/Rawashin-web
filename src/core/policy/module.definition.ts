import type { EntityActionKey } from '@/core/engine/action.types'
import type { PermissionKey } from '@/core/rbac/policy'

export type ModuleRoutes = {
  base: string
  add: string
  view: string
  edit: string
}

export type ModuleFeatureFlags = Partial<Record<'print' | 'charge' | 'attachments' | 'export', boolean>>

export type ModulePermissionMap = Partial<Record<EntityActionKey, PermissionKey>>

export type ModuleDefinition<TKey extends string = string, TResource extends string = string> = {
  key: TKey
  resource: TResource
  routes: ModuleRoutes
  clientTypeSupport?: boolean
  actions?: ModuleFeatureFlags
  permissions?: ModulePermissionMap
}

export const defineModule = <TKey extends string, TResource extends string>(
  definition: ModuleDefinition<TKey, TResource>
): ModuleDefinition<TKey, TResource> => definition
