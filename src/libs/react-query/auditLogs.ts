import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { AuditLogsApi } from '@/libs/api/modules/auditLogs.api'
import { normalizeListQuery } from '@/shared/api/listQuery'
import type { AuditLogsPagedResult, AuditLogsQueryParams } from '@/types/api/auditLogs'

import { QueryKeys } from './queryKeys'

const normalizeAuditLogsQuery = (query?: AuditLogsQueryParams) =>
  normalizeListQuery('auditLogs', query)

export const auditLogsQueryKeys = {
  all: QueryKeys.auditLogs.all,
  list: (query?: AuditLogsQueryParams) =>
    QueryKeys.auditLogs.list(normalizeAuditLogsQuery(query) as Record<string, unknown>),
}

export const useAuditLogsListQuery = (
  query?: AuditLogsQueryParams,
  options?: Omit<
    UseQueryOptions<
      AuditLogsPagedResult,
      unknown,
      AuditLogsPagedResult,
      ReturnType<typeof auditLogsQueryKeys.list>
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: auditLogsQueryKeys.list(query),
    queryFn: () => AuditLogsApi.getAll(query),
    ...options,
  })
