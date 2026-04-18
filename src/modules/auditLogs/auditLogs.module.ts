import { createEntityModule } from '@/core/entity/createEntityModule'
import { AuditLogsApi } from '@/libs/api/modules/auditLogs.api'
import { QueryKeys } from '@/libs/react-query/queryKeys'
import { normalizeListQuery } from '@/shared/api/listQuery'
import type { AuditLogsQueryParams } from '@/types/api/auditLogs'
import { auditLogsColumnsAdapter } from './auditLogs.columns.adapter'

export const auditLogsModule = createEntityModule({
  name: 'auditLogs',
  entity: 'auditLogs',
  endpoints: {
    list: AuditLogsApi.getAll,
    details: async () => undefined,
    create: async () => undefined,
    update: async () => undefined,
    remove: async () => undefined,
  },
  queryKeys: {
    all: QueryKeys.auditLogs.all,
    list: (query?: AuditLogsQueryParams) =>
      QueryKeys.auditLogs.list(normalizeListQuery('auditLogs', query) as Record<string, unknown>),
    details: (id: string) => QueryKeys.auditLogs.list({ id }),
    detail: (id: string) => QueryKeys.auditLogs.list({ id }),
  },
  permissions: {
    view: 'read',
  },
  columns: {
    list: auditLogsColumnsAdapter.list,
  },
  filters: {
    key: 'auditLogs.filters',
    fields: ['Search', 'Action', 'TableName', 'FromDate', 'ToDate'],
  },
  defaults: {
    query: {
      PageNumber: 1,
      PageSize: 20,
      SortBy: 'eventTime',
      SortDir: 'desc',
    },
  },
  routes: {
    list: '/audit-logs',
  },
})
