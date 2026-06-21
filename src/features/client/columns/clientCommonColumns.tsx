// import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid'

// import type { AccountStatus } from '../types'
// import AccountStatusSelect from '../components/AccountStatusSelect'

// type RowWithAccountStatus = GridValidRowModel & {
//   id: string
//   accountStatus: AccountStatus
// }

// type CreateAccountStatusColumnOptions<TRow extends RowWithAccountStatus> = {
//   width?: number
//   headerName?: string
//   disabled?: boolean | ((row: TRow) => boolean)
//   onChanged?: (row: TRow, value: AccountStatus) => void
// }

// export function createAccountStatusColumn<TRow extends RowWithAccountStatus>({
//   width = 120,
//   headerName = 'حالة الحساب',
//   disabled = false,
//   onChanged,
// }: CreateAccountStatusColumnOptions<TRow> = {}): GridColDef<TRow> {
//   return {
//     field: 'accountStatus',
//     headerName,
//     width,
//     sortable: false,
//     filterable: false,
//     renderCell: (params) => {
//       const row = params.row

//       const isDisabled =
//         typeof disabled === 'function' ? disabled(row) : disabled

//       return (
//         <AccountStatusSelect
//           id={row.id}
//           value={row.accountStatus}
//           disabled={isDisabled}
//           onChanged={(value) => {
//             onChanged?.(row, value)
//           }}
//         />
//       )
//     },
//   }
// }