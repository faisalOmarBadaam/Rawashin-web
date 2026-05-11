import type { GridColDef } from '@mui/x-data-grid'

import RowActionsMenu from '@/components/datagrid/RowActionsMenu'
import { getClientStatus } from '@/domains/clients/utils/clientStatus'
import type { ClientDto } from '@/types/api/clients'
import { ClientType } from '@/types/api/clients'

import ClientStatusSwitch from './ClientStatusSwitch'

export const getClientColumns = (
  type: ClientType,
  handlers: {
    onView?: (client: ClientDto) => void
    onPrint?: (client: ClientDto) => void
    onEdit?: (client: ClientDto) => void
    onDelete?: (client: ClientDto) => void
    onChargeCharger?: (client: ClientDto) => void
    onDeposit?: (client: ClientDto) => void
    onPassRest?: (client: ClientDto) => void
    onRoles?: (client: ClientDto) => void
  },
): GridColDef<ClientDto>[] => {
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

    {
      field: 'fullName',
      headerName: 'الاسم الكامل',
      flex: 1,
      minWidth: 200,
    },

    { field: 'phoneNumber', headerName: 'رقم الهاتف', flex: 1, minWidth: 160 },
  ]

  const status: GridColDef<ClientDto> = {
    field: 'status',
    headerName: 'الحالة',
    width: 220,
    align: 'center',
    headerAlign: 'center',
    valueGetter: (_, row) => getClientStatus(row),
    renderCell: params => <ClientStatusSwitch client={params.row} />,
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
        module="users"
        entityId={params.row.id}
        onView={() => handlers.onView?.(params.row)}
        onEdit={() => handlers.onEdit?.(params.row)}
        onDelete={() => handlers.onDelete?.(params.row)}
        onDeleteDisabled
        onChargeCharger={
          type === ClientType.Charger ? () => handlers.onChargeCharger?.(params.row) : undefined
        }
        onDeposit={type === ClientType.Admin ? () => handlers.onDeposit?.(params.row) : undefined}
        onRoles={() => handlers.onRoles?.(params.row)}
        onPassRest={() => handlers.onPassRest?.(params.row)}
      />
    ),
  }

  if (type === ClientType.Admin) {
    return [...base, status, actions]
  }

  return [...base, status, actions]
}
