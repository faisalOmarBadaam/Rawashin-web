import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { toEntityListKeyPart } from '@/libs/react-query/queryKeys'
import { normalizeListQuery, type ListEndpointKey } from '@/shared/api/listQuery'

type PaginatedResult<TItem> = {
  items?: TItem[]
  totalCount: number
}

export const usePaginatedQuery = <TItem, TQuery extends Record<string, unknown>>(params: {
  entity: ListEndpointKey
  query: TQuery
  queryKeyRoot: readonly unknown[]
  queryFn: (query: TQuery) => Promise<PaginatedResult<TItem>>
  options?: Omit<
    UseQueryOptions<PaginatedResult<TItem>, unknown, PaginatedResult<TItem>, readonly unknown[]>,
    'queryKey' | 'queryFn'
  >
}) => {
  const normalized = normalizeListQuery(params.entity, params.query)

  return useQuery({
    queryKey: [...params.queryKeyRoot, toEntityListKeyPart(normalized)],
    queryFn: () => params.queryFn(params.query),
    ...params.options,
  })
}
