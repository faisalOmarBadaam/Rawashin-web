'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import GenericDataGrid from '@/components/datagrid/GenericDataGrid'
import { useAuditLogsStore } from '@/contexts/audit-logs/auditLogs.store'
import AuditLogDetailsDialog from '@/views/audit-logs/components/AuditLogDetailsDialog'

import type { AuditLogDto } from '@/types/api/auditLogs'

import AuditLogsFiltersBar from './components/AuditLogsFiltersBar'
import { getAuditLogsColumns } from './components/auditLogs.columns'

export default function AuditLogsPage() {
  const { list, totalCount, loading, error, query, setQuery, fetchAuditLogs } = useAuditLogsStore()
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogDto | null>(null)

  useEffect(() => {
    fetchAuditLogs()
  }, [
    fetchAuditLogs,
    query.PageNumber,
    query.PageSize,
    query.SortBy,
    query.SortDir,
    query.Search,
    query.Action,
    query.TableName,
    query.FromDate,
    query.ToDate,
  ])

  const columns = useMemo(
    () =>
      getAuditLogsColumns({
        onViewDetails: row => setSelectedAuditLog(row),
      }),
    [],
  )

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h5">سجل التدقيق</Typography>

          <AuditLogsFiltersBar />

          <GenericDataGrid<AuditLogDto>
            rows={list}
            columns={columns}
            loading={loading}
            totalCount={totalCount}
            query={query}
            setQuery={setQuery}
            getRowId={row =>
              (row.id as string | number | undefined) ??
              `${row.eventTime ?? 'row'}-${row.action ?? ''}-${row.entityName ?? ''}-${row.fullName ?? ''}`
            }
            error={error}
            onRetry={fetchAuditLogs}
          />

          <AuditLogDetailsDialog
            open={Boolean(selectedAuditLog)}
            auditLog={selectedAuditLog}
            onClose={() => setSelectedAuditLog(null)}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
