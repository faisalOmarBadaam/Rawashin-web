import type { ReactNode } from 'react'

import Typography from '@mui/material/Typography'
import type { GridColDef } from '@mui/x-data-grid'

import RowActionsMenu from '@/components/datagrid/RowActionsMenu'

import type { SettlementDto } from '@/types/api/settlements'
import SettlementStatusChip, { normalizeSettlementStatus } from './SettlementStatusChip'

const formatAmount = (value?: number | null) =>
  value === null || value === undefined ? '—' : value.toLocaleString()

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—')

export const MarchentColumn = (handlers: {
  onView?: (settlement: SettlementDto) => void
  onEdit?: (settlement: SettlementDto) => void
}): GridColDef<SettlementDto>[] => [
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
    field: 'id',
    headerName: 'المرجع',
    minWidth: 220,
    flex: 1,
    renderCell: params => (
      <Typography variant="body2" noWrap>
        {params.value || '—'}
      </Typography>
    ),
  },

  {
    field: 'netAmount',
    headerName: 'صافي المبلغ',
    width: 160,

    renderCell: params => formatAmount(params.value),
  },
  {
    field: 'requestedAt',
    headerName: 'تاريخ الطلب',
    width: 180,
    renderCell: params => formatDate(params.value),
  },
  {
    field: 'status',
    headerName: 'الحالة',
    width: 140,
    align: 'center',
    headerAlign: 'center',
    renderCell: params => <SettlementStatusChip status={params.value} />,
  },
  {
    field: 'actions',
    headerName: 'الإجراءات',
    width: 120,
    sortable: false,
    align: 'center',
    headerAlign: 'center',
    renderCell: params => {
      const isNew = normalizeSettlementStatus(params.row.status) === 'New'
      const canView = Boolean(handlers.onView)

      if (!isNew && !canView) return null

      const items = [] as {
        label: string
        actionKey: string
        icon: ReactNode
        onClick: () => void
      }[]

      if (canView) {
        items.push({
          label: 'عرض التسوية',
          actionKey: 'view_settlement',
          icon: <i className="ri-eye-line" />,
          onClick: () => handlers.onView?.(params.row),
        })
      }

      if (isNew) {
        items.push({
          label: 'تعديل',
          actionKey: 'edit',
          icon: <i className="ri-edit-line" />,
          onClick: () => handlers.onEdit?.(params.row),
        })
      }

      return <RowActionsMenu items={items} />
    },
  },
]
