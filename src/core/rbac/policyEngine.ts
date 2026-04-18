import { useAuthStore } from '@/contexts/auth/auth.store'
import { canAccess, type AccessAction, type AccessResource } from './canAccess'

export type PermissionContext = {
  route?: string
  acl?: string[]
  roles?: string[]
}

export type CanParams = {
  resource: AccessResource
  action: AccessAction
  context?: PermissionContext
}

export const can = ({ resource, action, context }: CanParams): boolean => {
  const sessionRoles = useAuthStore.getState().session?.roles ?? []
  const roles = context?.roles ?? sessionRoles

  return canAccess({
    roles,
    resource,
    action,
    route: context?.route,
    acl: context?.acl,
  })
}

export const cannot = (params: CanParams): boolean => !can(params)
