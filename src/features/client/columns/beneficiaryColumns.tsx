import { useMemo } from 'react'
import type { GridColDef } from '@mui/x-data-grid'

import type { AccountStatus } from '../types'
import type { ClientListResponse } from '../types/responses'


import type { RowAction } from '../components/RowActionsMenuButton'
import CardReceiptStatusSwitch from '../components/CardReceiptStatusSwitch'
import { createClientAccountStatusColumn, createClientActionsColumn } from './commonColumns'

type BeneficiaryColumnsOptions = {
  onAccountStatusChange?: (
    row: ClientListResponse,
    value: AccountStatus
  ) => void

  extraActions?: RowAction<ClientListResponse>[]
  editPath?: string | ((row: ClientListResponse) => string)
}

export function useBeneficiaryColumns({
  onAccountStatusChange,
  extraActions,
  editPath,
}: BeneficiaryColumnsOptions = {}) {
  return useMemo<GridColDef<ClientListResponse>[]>(
    () => [
      {
        field: 'fullName',
        headerName: 'الاسم',
        flex: 1,
      },
      {
        field: 'phoneNumber',
        headerName: 'رقم الجوال',
        width: 120,
      },
      createClientAccountStatusColumn<ClientListResponse>({
        onChanged: onAccountStatusChange,
      }),
      {
        field: 'isReceivedCard',
        headerName: 'حالة البطاقة',
        width: 160,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <CardReceiptStatusSwitch
            id={String(params.row.id)}
            value={Boolean(params.row.isReceivedCard)}
          />
        ),
      },
      createClientActionsColumn<ClientListResponse>({
        extraActions,
        editPath,
      }),
    ],
    [onAccountStatusChange, extraActions, editPath]
  )
}