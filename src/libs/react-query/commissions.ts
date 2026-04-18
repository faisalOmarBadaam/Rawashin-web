import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { CommissionsApi } from '@/libs/api/modules'
import type { CommissionsDto } from '@/types/api/finance'
import { QueryKeys } from './queryKeys'

export const commissionsQueryKeys = {
  all: QueryKeys.commissions.all,
  client: (clientId: string) => QueryKeys.commissions.byClient(clientId),
}

export const useClientCommissionQuery = (
  clientId: string,
  options?: Omit<
    UseQueryOptions<
      CommissionsDto,
      unknown,
      CommissionsDto,
      ReturnType<typeof commissionsQueryKeys.client>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: commissionsQueryKeys.client(clientId),
    queryFn: () => CommissionsApi.getByClientId(clientId),
    enabled: Boolean(clientId) && (options?.enabled ?? true),
    ...options,
  })
}
