import { useMemo, useState } from 'react'
import type { GridColDef } from '@mui/x-data-grid'
import { useNavigate, useSearchParams } from 'react-router'
import dayjs from 'dayjs'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import GenericDataGrid, {
  type DataGridQueryState,
} from '@/shared/components/dataGrid/GenericDataGrid'
import QueryFiltersBar from '@/shared/components/filters/QueryFiltersBar'
import QuerySelectFilter from '@/shared/components/filters/QuerySelectFilter'
import RowActionsMenuButton, {
  type RowAction,
} from '@/features/client/components/RowActionsMenuButton'

import { SettlementStatsCards } from '../components/SettlementStatsCards'
import { useSettlements } from '../hooks'
import {
  getSettlementStatusMeta,
  settlementStatusOptions,
  type SettlementListItem,
} from '../types'
import { formatCurrency, formatDate } from '@/shared/utils'

type SettlementQueryState = DataGridQueryState & {
  Status?: string
  FromDate?: string
  ToDate?: string
}

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
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <DatePicker
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
          setSearchParams(nextParams, { replace: true })
        }}
        slotProps={{
          textField: {
            size: 'small',
            sx: { width: { xs: '100%', sm: 170 } },
          },
        }}
      />
    </LocalizationProvider>
  )
}

export default function SettlementsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const urlSearch = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? ''
  const fromDate = searchParams.get('fromDate') ?? ''
  const toDate = searchParams.get('toDate') ?? ''

  const [query, setQuery] = useState<SettlementQueryState>({
    PageNumber: 1,
    PageSize: 10,
    SortBy: 'createdAt',
    SortDir: 'desc',
    Search: urlSearch,
    Status: status !== '' ? status : undefined,
    FromDate: fromDate || undefined,
    ToDate: toDate || undefined,
  })

  const apiParams = useMemo(() => {
  const selectedStatus = status !== '' ? status : query.Status

  return {
    PageNumber: query.PageNumber,
    PageSize: query.PageSize,
    SortBy: query.SortBy,
    IsDesc: query.SortDir === 'desc',
    Search: urlSearch || query.Search,
    Status:
      selectedStatus !== undefined && selectedStatus !== ''
        ? selectedStatus
        : undefined,
    FromDate: fromDate || query.FromDate,
    ToDate: toDate || query.ToDate,
  }
}, [query, urlSearch, status, fromDate, toDate])

  const settlements = useSettlements(apiParams)

  const rows = settlements.data?.items ?? []
  const totalCount = settlements.data?.totalCount ?? 0

  const actions = useMemo<RowAction<SettlementListItem>[]>(
    () => [
      {
        label: 'عرض التفاصيل',
        onClick: row => navigate(String(row.id)),
      },
    ],
    [navigate],
  )

  const columns = useMemo<GridColDef<SettlementListItem>[]>(
    () => [
      {
        field: 'merchantName',
        headerName: 'اسم التاجر',
        flex: 1,
        minWidth: 220,
        valueGetter: (_value, row) => row.merchantName ?? row.clientName ?? '—',
      },
      {
        field: 'amount',
        headerName: 'مبلغ التسوية',
        width: 170,
        align: 'center',
        headerAlign: 'center',
        valueGetter: (_value, row) => row.grossAmount,
        renderCell: (params) => formatCurrency(params.row.grossAmount),
      },
      {
        field: 'status',
        headerName: 'الحالة',
        width: 180,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          const statusChip = getSettlementStatusMeta(params.row.status)

          return (
            <Chip
              size="small"
              label={statusChip.label}
              color={statusChip.color}
            />
          )
        },
      },
      {
        field: 'requestedAt',
        headerName: 'تاريخ الطلب',
        width: 190,
        valueGetter: (_value, row) => row.requestedAt ?? row.createdAt ?? null,
        renderCell: (params) =>
          formatDate(params.row.requestedAt ?? params.row.createdAt),
      },
      {
        field: 'actions',
        headerName: 'الإجراءات',
        width: 90,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <RowActionsMenuButton row={params.row} actions={actions} />
        ),
      },
    ],
    [actions],
  )

  return (
    <Stack spacing={3}>
      <SettlementStatsCards />

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
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              التسويات المالية
            </Typography>

            <Typography variant="body2" color="text.secondary">
              عرض وإدارة طلبات التسوية مع البحث والفلترة حسب الحالة والتاريخ.
            </Typography>
          </Box>

          <QueryFiltersBar resetKeys={['status', 'fromDate', 'toDate']}>
            <QuerySelectFilter
              queryKey="status"
              label="الحالة"
              options={settlementStatusOptions}
              width={170}
            />

            <DateFilterField label="من تاريخ" queryKey="fromDate" />
            <DateFilterField label="إلى تاريخ" queryKey="toDate" />
          </QueryFiltersBar>

          <GenericDataGrid<SettlementListItem, SettlementQueryState>
            rows={rows}
            showToolbar={false}
            columns={columns}
            loading={settlements.isLoading}
            totalCount={totalCount}
            query={query}
            setQuery={setQuery}
            getRowId={(row) => row.id}
            onRowDoubleClick={row => navigate(String(row.id))}
            defaultDescFields={['createdAt', 'requestedAt']}
          />
        </Stack>
      </Paper>
    </Stack>
  )
}