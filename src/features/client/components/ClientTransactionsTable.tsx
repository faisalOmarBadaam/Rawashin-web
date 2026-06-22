import { useMemo, useState } from 'react'
import type { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSearchParams } from 'react-router'

import CustomDatePicker from '@/shared/components/ui/CustomDatePicker'
import GenericDataGrid, {
  type DataGridQueryState,
} from '@/shared/components/dataGrid/GenericDataGrid'
import QueryFiltersBar from '@/shared/components/filters/QueryFiltersBar'
import QuerySelectFilter from '@/shared/components/filters/QuerySelectFilter'
import { formatCurrency, formatDate } from '@/shared/utils'

import { useClientTransactions } from '../hooks'
import type { ClientTransactionResponse } from '../types/responses'

type ClientTransactionsTableProps = {
  clientId: string
  title?: string
  description?: string
}

type ClientTransactionsQueryState = DataGridQueryState & {
  Type?: string
  FromDate?: string
  ToDate?: string
}

const transactionTypeOptions = [
  {
    label: 'استرجاع مبلغ',
    value: '0',
  },
  {
    label: 'دفع مشتريات',
    value: '1',
  },
  {
    label: 'تسوية',
    value: '2',
  },
  {
    label: 'شحن حساب ائتماني',
    value: '3',
  },
  {
    label: 'دين',
    value: '4',
  },
]

function DateFilterField({
  label,
  queryKey,
}: {
  label: string
  queryKey: 'fromDate' | 'toDate'
}) {
  const [searchParams, setSearchParams] = useSearchParams()

  const value = searchParams.get(queryKey)
  const dateValue = value ? dayjs(value) : null

  return (
    <Box sx={{ width: { xs: '100%', sm: 170 } }}>
      <CustomDatePicker
        label={label}
        value={dateValue}
        onChange={(nextValue) => {
          const nextParams = new URLSearchParams(searchParams)

          if (nextValue?.isValid()) {
            nextParams.set(queryKey, nextValue.format('YYYY-MM-DD'))
          } else {
            nextParams.delete(queryKey)
          }

          nextParams.delete('page')

          setSearchParams(nextParams, {
            replace: true,
          })
        }}
      />
    </Box>
  )
}

export default function ClientTransactionsTable({
  clientId,
  title = 'سجل المعاملات',
}: ClientTransactionsTableProps) {
  const [searchParams] = useSearchParams()

  const urlSearch = searchParams.get('search') ?? ''
  const transactionType = searchParams.get('type') ?? ''
  const fromDate = searchParams.get('fromDate') ?? ''
  const toDate = searchParams.get('toDate') ?? ''

  const [query, setQuery] = useState<ClientTransactionsQueryState>({
    PageNumber: 1,
    PageSize: 10,
    SortBy: 'createdAt',
    SortDir: 'desc',
    Search: urlSearch,
    transactionType: transactionType || undefined,
    FromDate: fromDate || undefined,
    ToDate: toDate || undefined,
  })

  const apiParams = useMemo(
    () => {
      const typeValue = transactionType || query.Type
      const parsedType =
        typeValue !== undefined && typeValue !== ''
          ? Number(typeValue)
          : undefined

      return {
      PageNumber: query.PageNumber,
      PageSize: query.PageSize,
      SortBy: query.SortBy,
      IsDesc: query.SortDir === 'desc',
      Search: urlSearch || query.Search,
      transactionType: parsedType !== undefined && !Number.isNaN(parsedType)
        ? parsedType
        : undefined,
      FromDate: fromDate || query.FromDate,
      ToDate: toDate || query.ToDate,
    }
    },
    [fromDate, query, toDate, transactionType, urlSearch],
  )

  const transactionsQuery = useClientTransactions(clientId, apiParams)

  const rows = useMemo(
    () => transactionsQuery.data?.items ?? [],
    [transactionsQuery.data?.items],
  )

  const totalCount = transactionsQuery.data?.totalCount ?? 0

  const columns = useMemo<GridColDef<ClientTransactionResponse>[]>(
    () => [
      {
        field: 'reference',
        headerName: 'المرجع',
        flex: 1,
        minWidth: 190,
        sortable: false,
        valueGetter: (_value, row) => row.referenceId,
      },
      {
        field: 'amount',
        headerName: 'المبلغ',
        width: 160,
        align: 'center',
        headerAlign: 'center',
        valueGetter: (_value, row) => row.amount,
        renderCell: (params) => formatCurrency(params.row.amount),
      },
      {
        field: 'description',
        headerName: 'الوصف',
        flex: 1.4,
        minWidth: 240,
        sortable: false,
        valueGetter: (_value, row) => row.description ?? '—',
      },
      {
        field: 'createdAt',
        headerName: 'التاريخ',
        width: 190,
        valueGetter: (_value, row) => row.createdAt,
        renderCell: (params) => formatDate(params.row.createdAt),
      },
    ],
    [],
  )

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h5">{title}</Typography>
        </Stack>

        <QueryFiltersBar resetKeys={['type', 'fromDate', 'toDate']}>
          <QuerySelectFilter
            queryKey="type"
            label="نوع العملية"
            options={transactionTypeOptions}
            width={180}
          />

          <DateFilterField label="من تاريخ" queryKey="fromDate" />

          <DateFilterField label="إلى تاريخ" queryKey="toDate" />
        </QueryFiltersBar>

        <GenericDataGrid<
          ClientTransactionResponse,
          ClientTransactionsQueryState
        >
          rows={rows}
          showToolbar={false}
          columns={columns}
          loading={transactionsQuery.isLoading}
          totalCount={totalCount}
          query={query}
          setQuery={setQuery}
          getRowId={(row) => row.id}
          defaultDescFields={['createdAt']}
        />
      </Stack>
    </Paper>
  )
}