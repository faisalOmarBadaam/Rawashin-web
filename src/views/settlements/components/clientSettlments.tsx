import Typography from '@mui/material/Typography'
import type { GridColDef } from '@mui/x-data-grid'

import type { SettlementDto } from '@/types/api/settlements'
import SettlementRowActions from './SettlementRowActions'
import SettlementStatusChip from './SettlementStatusChip'

const formatAmount = (value?: number | null) =>
  value === null || value === undefined ? '—' : value.toLocaleString()

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—')

export const clientSettlments = (handlers: {
  onView?: (settlement: SettlementDto) => void
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
    field: 'clientName',
    headerName: 'نقطة البيع',
    minWidth: 220,
    flex: 1,
    renderCell: params => (
      <Typography variant="body2" noWrap>
        {params.value || '—'}
      </Typography>
    ),
  },
  {
    field: 'description',
    headerName: 'الوصف',
    minWidth: 200,
    flex: 1,
    renderCell: params => (
      <Typography variant="body2" noWrap>
        {params.value || '—'}
      </Typography>
    ),
  },
  {
    field: 'settlementDate',
    headerName: 'تاريخ التسوية',
    width: 180,
    renderCell: params => formatDate(params.value),
  },
  {
    field: 'grossAmount',
    headerName: 'مبلغ التسوية',
    width: 160,
    align: 'right',
    headerAlign: 'right',
    renderCell: params => formatAmount(params.value),
  },
  {
    field: 'commissionPercentage',
    headerName: 'نسبة العمولة',
    width: 140,
    align: 'center',
    headerAlign: 'center',
    renderCell: params => `${params.value ?? 0}%`,
  },
  {
    field: 'commissionAmount',
    headerName: 'قيمة العمولة',
    width: 160,
    align: 'right',
    headerAlign: 'right',
    renderCell: params => formatAmount(params.value),
  },
  {
    field: 'netAmount',
    headerName: 'صافي المبلغ',
    width: 160,
    align: 'right',
    headerAlign: 'right',
    renderCell: params => formatAmount(params.value),
  },
  {
    field: 'method',
    headerName: 'طريقة الدفع',
    width: 140,
    align: 'center',
    headerAlign: 'center',
    renderCell: params => params.value ?? '—',
  },
  {
    field: 'paymentReference',
    headerName: 'مرجع الدفع',
    width: 160,
    renderCell: params => params.value || '—',
  },
  {
    field: 'adminNote',
    headerName: 'ملاحظة إدارية',
    minWidth: 200,
    flex: 1,
    renderCell: params => (
      <Typography variant="body2" noWrap>
        {params.value || '—'}
      </Typography>
    ),
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
    field: 'requestedAt',
    headerName: 'تاريخ الطلب',
    width: 180,
    renderCell: params => formatDate(params.value),
  },
  {
    field: 'processingStartedAt',
    headerName: 'بدء المعالجة',
    width: 180,
    renderCell: params => formatDate(params.value),
  },
  {
    field: 'completedAt',
    headerName: 'تاريخ الإكمال',
    width: 180,
    renderCell: params => formatDate(params.value),
  },
  {
    field: 'actions',
    headerName: 'الإجراءات',
    width: 120,
    sortable: false,
    align: 'center',
    headerAlign: 'center',
    renderCell: params => <SettlementRowActions settlement={params.row} onView={handlers.onView} />,
  },
]
