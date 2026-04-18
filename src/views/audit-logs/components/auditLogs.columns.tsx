import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { GridColDef } from '@mui/x-data-grid'

import type { AuditLogDto } from '@/types/api/auditLogs'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

type GetAuditLogsColumnsOptions = {
  onViewDetails?: (row: AuditLogDto) => void
}

export const getAuditLogsColumns = (
  options?: GetAuditLogsColumnsOptions,
): GridColDef<AuditLogDto>[] => [
  {
    field: 'id',
    headerName: 'ID',
    width: 100,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'action',
    headerName: 'الإجراء',
    minWidth: 140,
    flex: 0.8,
    valueGetter: (_value, row) => row.action ?? '—',
    renderCell: params => <Typography variant="body2">{params.value as string}</Typography>,
  },
  {
    field: 'fullName',
    headerName: 'الاسم الكامل',
    minWidth: 200,
    flex: 1,
    valueGetter: (_value, row) => row.fullName ?? '—',
    renderCell: params => <Typography variant="body2">{params.value as string}</Typography>,
  },
  {
    field: 'entityName',
    headerName: 'الجدول',
    minWidth: 180,
    flex: 1,
    valueGetter: (_value, row) => row.entityName ?? '—',
    renderCell: params => <Typography variant="body2">{params.value as string}</Typography>,
  },
  {
    field: 'eventTime',
    headerName: 'الوقت',
    width: 200,
    valueGetter: (_value, row) => row.eventTime ?? null,
    renderCell: params => {
      const value = params.value as string | null | undefined
      if (!value) return <Typography variant="body2">—</Typography>
      const date = new Date(value)
      return (
        <Typography variant="body2">
          {Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)}
        </Typography>
      )
    },
  },
  {
    field: 'details',
    headerName: 'التفاصيل',
    minWidth: 150,
    sortable: false,
    filterable: false,
    align: 'center',
    headerAlign: 'center',
    renderCell: params => (
      <Button variant="outlined" size="small" onClick={() => options?.onViewDetails?.(params.row)}>
        عرض التغييرات
      </Button>
    ),
  },
]
