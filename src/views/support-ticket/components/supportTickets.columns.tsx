import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import type { GridColDef } from '@mui/x-data-grid'

import type { SupportTicketDto } from '@/types/api/supportTickets'
import { SupportTicketCategory, SupportTicketStatus } from '@/types/api/supportTickets'

const categoryLabel = (category?: SupportTicketCategory | null) => {
  switch (category) {
    case SupportTicketCategory.Issue:
      return 'مشكلة'
    case SupportTicketCategory.Suggestion:
      return 'اقتراح'
    case SupportTicketCategory.Complaint:
      return 'شكوى'
    case SupportTicketCategory.Other:
      return 'أخرى'
    default:
      return '—'
  }
}

const statusConfig = (
  status?: SupportTicketStatus | null,
): { label: string; color: 'default' | 'info' | 'warning' | 'success' } => {
  switch (status) {
    case SupportTicketStatus.Open:
      return { label: 'جديدة', color: 'info' }
    case SupportTicketStatus.InProgress:
      return { label: 'قيد المعالجة', color: 'warning' }
    case SupportTicketStatus.Complete:
      return { label: 'مغلقة', color: 'success' }
    default:
      return { label: '—', color: 'default' }
  }
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export const getSupportTicketColumns = (): GridColDef<SupportTicketDto>[] => [
  {
    field: 'asn',
    headerName: '#',
    width: 70,
    sortable: false,
    align: 'center',
    headerAlign: 'center',
    renderCell: params => params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
  },
  {
    field: 'title',
    headerName: 'العنوان',
    flex: 1,
    minWidth: 220,
    valueGetter: (_, row) => row.title ?? row.subject ?? '—',
    renderCell: params => <Typography variant="body2">{params.value || '—'}</Typography>,
  },
  {
    field: 'clientName',
    headerName: 'مقدم الطلب',
    flex: 1,
    minWidth: 180,
    renderCell: params => <Typography variant="body2">{params.value || '—'}</Typography>,
  },
  {
    field: 'category',
    headerName: 'التصنيف',
    width: 140,
    renderCell: params => (
      <Typography variant="body2">{categoryLabel(params.value as any)}</Typography>
    ),
  },
  {
    field: 'status',
    headerName: 'الحالة',
    width: 160,
    align: 'center',
    headerAlign: 'center',
    renderCell: params => {
      const cfg = statusConfig(params.value as any)
      return <Chip size="small" label={cfg.label} color={cfg.color} />
    },
  },
  {
    field: 'createdAt',
    headerName: 'تاريخ الإنشاء',
    width: 170,
    valueGetter: (_, row) => row.createdAt ?? null,
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
]
