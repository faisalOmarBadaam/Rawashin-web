import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid'

import ClientRowActionsMenuButton from '@/features/client/components/ClientRowActionsMenuButton'
import AccountStatusSelect from '@/features/client/components/AccountStatusSelect'

import type { AccountStatus } from '../types'
import type { RowAction } from '../components/RowActionsMenuButton'

type RowWithId = GridValidRowModel & {
  id: string
}

type RowWithAccountStatus = RowWithId & {
  accountStatus: AccountStatus
}


type CreateClientActionsColumnOptions<TRow extends RowWithId> = {
  extraActions?: RowAction<TRow>[]
  editPath?: string | ((row: TRow) => string)
}

export function createClientActionsColumn<TRow extends RowWithId>({
  extraActions,
  editPath,
}: CreateClientActionsColumnOptions<TRow> = {}): GridColDef<TRow> {
  return {
    field: 'actions',
    headerName: 'إجراءات',
    width: 90,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <ClientRowActionsMenuButton
        row={params.row}
        editPath={editPath}
        extraActions={extraActions}
      />
    ),
  }
}


type CreateClientAccountStatusColumnOptions<
  TRow extends RowWithAccountStatus
> = {
  headerName?: string
  width?: number
  disabled?: boolean | ((row: TRow) => boolean)
  onChanged?: (row: TRow, value: AccountStatus) => void
}

export function createClientAccountStatusColumn<
  TRow extends RowWithAccountStatus
>({
  headerName = 'حالة الحساب',
  width = 150,
  disabled = false,
  onChanged,
}: CreateClientAccountStatusColumnOptions<TRow> = {}): GridColDef<TRow> {
  return {
    field: 'accountStatus',
    headerName,
    width,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const row = params.row

      const isDisabled =
        typeof disabled === 'function' ? disabled(row) : disabled

      return (
        <AccountStatusSelect
          id={row.id}
          value={row.accountStatus}
          disabled={isDisabled}
          onChanged={(value) => {
            onChanged?.(row, value)
          }}
        />
      )
    },
  }
}