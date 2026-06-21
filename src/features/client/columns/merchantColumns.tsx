import { useMemo } from 'react'
import type { GridColDef } from '@mui/x-data-grid'

import type { AccountStatus } from '../types'
import type { ClientListResponse } from '../types/responses'

import {
  createClientAccountStatusColumn,
  createClientActionsColumn,
} from './CommonColumns'
import type { RowAction } from '../components/RowActionsMenuButton'

type MerchantColumnsOptions = {
  onAccountStatusChanged?: (
    row: ClientListResponse,
    value: AccountStatus
  ) => void

  extraActions?: RowAction<ClientListResponse>[]
  editPath?: string | ((row: ClientListResponse) => string)
}

export function useMerchantColumns({
  onAccountStatusChanged,
  extraActions,
  editPath,
}: MerchantColumnsOptions = {}) {
  return useMemo<GridColDef<ClientListResponse>[]>(
    () => [
      {
        field: 'merchantName',
        headerName: 'نقطة البيع',
        flex: 1,
        valueGetter: (_value, row) => row.organizationName ?? row.fullName ?? '—',
      },
      {
        field: 'phoneNumber',
        headerName: 'رقم الهاتف',
        width: 140,
      },
      createClientAccountStatusColumn<ClientListResponse>({
        onChanged: onAccountStatusChanged,
      }),
      createClientActionsColumn<ClientListResponse>({
        extraActions,
        editPath,
      }),
    ],
    [onAccountStatusChanged, extraActions, editPath]
  )
}

export default useMerchantColumns