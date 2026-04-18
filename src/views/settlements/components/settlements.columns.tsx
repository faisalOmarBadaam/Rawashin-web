import Typography from '@mui/material/Typography'
import type { GridColDef } from '@mui/x-data-grid'

import type { SettlementDto } from '@/types/api/settlements'

import SettlementRowActions from './SettlementRowActions'
import SettlementStatusChip from './SettlementStatusChip'

export const getSettlementColumns = (handlers: {
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
    headerName: 'اسم نقطة البيع',
    flex: 1,
    minWidth: 200,
    renderCell: params => <Typography variant="body2">{params.value || '—'}</Typography>,
  },
  {
    field: 'grossAmount',
    headerName: 'مبلغ التسوية',
    width: 160,
    align: 'center',
    headerAlign: 'center',
    renderCell: params => params.value.toLocaleString(),
  },
  // {
  //   field: 'commissionAmount',
  //   headerName: 'العمولة',
  //   width: 140,
  //   align: 'center',
  //   headerAlign: 'center',
  //   renderCell: params => params.value.toLocaleString()
  // },
  // {
  //   field: 'netAmount',
  //   headerName: 'الصافي',
  //   width: 160,
  //   align: 'center',
  //   headerAlign: 'center',
  //   renderCell: params => params.value.toLocaleString()
  // },
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
    renderCell: params => new Date(params.value).toLocaleDateString(),
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
