import Typography from '@mui/material/Typography'
import type { GridColDef } from '@mui/x-data-grid'

import type { TransactionForClientDto } from '@/types/api/transaction'

type BuildTransactionColumnsOptions = {
  includeMerchantColumn?: boolean
}

export const buildTransactionColumns = (
  clientsMap: Record<string, string | null>,
  options?: BuildTransactionColumnsOptions,
): GridColDef<TransactionForClientDto>[] => {
  const includeMerchantColumn = options?.includeMerchantColumn ?? true

  const base: GridColDef<TransactionForClientDto>[] = [
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
      field: 'referenceId',
      headerName: 'المرجع',
      minWidth: 160,
      flex: 1,
      renderCell: params => (
        <Typography variant="body2" noWrap>
          {(params.value as string) || '—'}
        </Typography>
      ),
    },
    {
      field: 'clientName',
      headerName: 'المستفيد',
      minWidth: 200,
      flex: 1,
      valueGetter: (_value, row) =>
        row.toClientName ?? (row.toClientId ? (clientsMap[row.toClientId] ?? '—') : '—'),
      renderCell: params => (
        <Typography variant="body2" noWrap>
          {params.value as string}
        </Typography>
      ),
    },
  ]

  if (includeMerchantColumn) {
    base.push({
      field: 'marchantName',
      headerName: 'نقطة البيع',
      minWidth: 180,
      flex: 1,
      valueGetter: (_value, row) => row.marchantName ?? row.clientName ?? '—',
      renderCell: params => (
        <Typography variant="body2" noWrap>
          {params.value as string}
        </Typography>
      ),
    })
  }

  base.push(
    {
      field: 'amount',
      headerName: 'المبلغ',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const value = params.value as number

        return (
          <Typography color={value >= 0 ? 'success.main' : 'error.main'} fontWeight={600}>
            {value.toLocaleString()}
          </Typography>
        )
      },
    },
    {
      field: 'description',
      headerName: 'الوصف',
      minWidth: 240,
      flex: 1,
      renderCell: params => (
        <Typography variant="body2" noWrap>
          {(params.value as string) || '—'}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ العملية',
      width: 180,
      valueFormatter: value => (value ? new Date(value as string).toLocaleString() : '-'),
    },
  )

  return base
}
