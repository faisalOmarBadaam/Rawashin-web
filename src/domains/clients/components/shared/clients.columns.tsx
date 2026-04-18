import type { GridColDef } from '@mui/x-data-grid'

import { buildClientColumns } from '@/shared/lib/grid/getClientColumns.shared'
import type { ClientDto, ClientType } from '@/types/api/clients'

import ClientCardStatusSwitch from './ClientCardStatusSwitch'
import ClientStatusSwitch from './ClientStatusSwitch'

export const getClientColumns = (
  type: ClientType,
  handlers: {
    onView?: (client: ClientDto) => void
    onPrint?: (client: ClientDto) => void
    onEdit?: (client: ClientDto) => void
    onDelete?: (client: ClientDto) => void
    onCharge?: (client: ClientDto) => void
    onAssign?: (client: ClientDto) => void
    onCommission?: (client: ClientDto) => void
    onPassRest?: (client: ClientDto) => void
  },
): GridColDef<ClientDto>[] => {
  return buildClientColumns({
    type,
    handlers,
    renderStatusCell: client => <ClientStatusSwitch client={client} />,
    renderCardStatusCell: client => <ClientCardStatusSwitch client={client} />,
  })
}
