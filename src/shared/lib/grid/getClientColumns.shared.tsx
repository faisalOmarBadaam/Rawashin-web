import type { ReactNode } from 'react'

import Typography from '@mui/material/Typography'

import type { GridColDef } from '@mui/x-data-grid'

import RowActionsMenu from '@/components/datagrid/RowActionsMenu'
import { getClientStatus } from '@/domains/clients/utils/clientStatus'
import type { ClientDto } from '@/types/api/clients'
import { ClientType } from '@/types/api/clients'

type ClientColumnsHandlers = {
  onView?: (client: ClientDto) => void
  onPrint?: (client: ClientDto) => void
  onEdit?: (client: ClientDto) => void
  onDelete?: (client: ClientDto) => void
  onCharge?: (client: ClientDto) => void
  onAssign?: (client: ClientDto) => void
  onCommission?: (client: ClientDto) => void
  onPassRest?: (client: ClientDto) => void
}

type StatusCellRenderer = (client: ClientDto) => ReactNode

type CardStatusCellRenderer = (client: ClientDto) => ReactNode

type BuildClientColumnsParams = {
  type: ClientType
  handlers: ClientColumnsHandlers
  renderStatusCell: StatusCellRenderer
  renderCardStatusCell: CardStatusCellRenderer
}

export const buildClientColumns = ({
  type,
  handlers,
  renderStatusCell,
  renderCardStatusCell,
}: BuildClientColumnsParams): GridColDef<ClientDto>[] => {
  const nameColumn: GridColDef<ClientDto> =
    type === ClientType.Client
      ? {
          field: 'fullName',
          headerName: 'الاسم الكامل',
          flex: 1,
          minWidth: 200,
        }
      : {
          field: 'organizationName',
          headerName: type === ClientType.Merchant ? 'نقطة البيع' : 'اسم الجهة',
          flex: 1,
          minWidth: 200,
        }

  const base: GridColDef<ClientDto>[] = [
    {
      field: 'asn',
      headerName: '#',
      width: 70,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
    },
    nameColumn,
    { field: 'phoneNumber', headerName: 'رقم الهاتف', flex: 1, minWidth: 160 },
  ]

  const parentClient: GridColDef<ClientDto> = {
    field: 'parentClientName',
    headerName: 'الجهة',
    flex: 1,
    minWidth: 180,
    renderCell: params => <Typography variant="body2">{params.value || '—'}</Typography>,
  }

  const status: GridColDef<ClientDto> = {
    field: 'status',
    headerName: 'الحالة',
    width: 220,
    align: 'center',
    headerAlign: 'center',
    valueGetter: (_, row) => getClientStatus(row),
    renderCell: params => renderStatusCell(params.row),
  }

  const receivedCard: GridColDef<ClientDto> = {
    field: 'isReceivedCard',
    headerName: 'حالة البطاقة',
    width: 160,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    renderCell: params => renderCardStatusCell(params.row),
  }

  const actions: GridColDef<ClientDto> = {
    field: 'actions',
    headerName: 'الإجراءات',
    width: 120,
    sortable: false,
    align: 'center',
    headerAlign: 'center',
    renderCell: params => (
      <RowActionsMenu
        module="clients"
        entityId={params.row.id}
        onView={() => handlers.onView?.(params.row)}
        onEdit={() => handlers.onEdit?.(params.row)}
        onPrint={type === ClientType.Client ? () => handlers.onPrint?.(params.row) : undefined}
        onDelete={() => handlers.onDelete?.(params.row)}
        onAssign={type === ClientType.Client ? () => handlers.onAssign?.(params.row) : undefined}
        onCommission={
          type === ClientType.Merchant ? () => handlers.onCommission?.(params.row) : undefined
        }
        onPassRest={() => handlers.onPassRest?.(params.row)}
      />
    ),
  }

  if (type === ClientType.Client) {
    return [...base, parentClient, status, receivedCard, actions]
  }

  return [...base, status, actions]
}
