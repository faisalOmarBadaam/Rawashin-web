import { useMemo } from 'react'
import type { GridColDef } from '@mui/x-data-grid'

import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

import type { AccountStatus } from '../types'
import type { ClientListResponse } from '../types/responses'

import {
  createClientActionsColumn,
  createClientAccountStatusColumn,
} from './CommonColumns'
import type { RowAction } from '../components/RowActionsMenuButton'

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
        renderCell: (params) => (
          <Typography component="span">
            <Switch
              checked={Boolean(params.row.isReceivedCard)}
              color="success"
              onClick={(event) => event.stopPropagation()}
            />
          </Typography>
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