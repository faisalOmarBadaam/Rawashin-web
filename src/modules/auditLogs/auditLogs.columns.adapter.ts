import { getAuditLogsColumns } from '@/views/audit-logs/components/auditLogs.columns'

/** Legacy adapter to keep module layer view-agnostic. */
export const auditLogsColumnsAdapter = {
  list: getAuditLogsColumns,
}
