'use client'

import type { ReactNode } from 'react'

import type { AccessAction, AccessResource } from './canAccess'
import { usePermission } from './usePermission'

type Props = {
  action: AccessAction
  resource: AccessResource
  context?: {
    route?: string
    acl?: string[]
    roles?: string[]
  }
  fallback?: ReactNode
  children: ReactNode
}

export default function WithPermission({
  action,
  resource,
  context,
  fallback = null,
  children,
}: Props) {
  const { can } = usePermission()

  if (!can({ action, resource, context })) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
