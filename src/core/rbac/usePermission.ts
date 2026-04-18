'use client'

import { useMemo } from 'react'

import { useAuthStore } from '@/contexts/auth/auth.store'
import {
  can as canByPolicyEngine,
  cannot as cannotByPolicyEngine,
  type CanParams,
} from './policyEngine'

export const usePermission = () => {
  const roles = useAuthStore(state => state.session?.roles ?? [])

  return useMemo(
    () => ({
      can: (params: Omit<CanParams, 'context'> & { context?: CanParams['context'] }) =>
        canByPolicyEngine({
          ...params,
          context: {
            ...params.context,
            roles: params.context?.roles ?? roles,
          },
        }),
      cannot: (params: Omit<CanParams, 'context'> & { context?: CanParams['context'] }) =>
        cannotByPolicyEngine({
          ...params,
          context: {
            ...params.context,
            roles: params.context?.roles ?? roles,
          },
        }),
    }),
    [roles],
  )
}
