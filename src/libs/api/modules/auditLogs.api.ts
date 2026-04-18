import { api } from '../service'
import { endpoints } from '../endpoints'
import { normalizeListQuery } from '@/shared/api/listQuery'

import type { AuditLogsPagedResult, AuditLogsQueryParams } from '@/types/api/auditLogs'

export const AuditLogsApi = {
  getAll(params?: AuditLogsQueryParams) {
    return api.get<AuditLogsPagedResult>(
      endpoints.auditLogs.list,
      normalizeListQuery('auditLogs', params)
    )
  }
}
