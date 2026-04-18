'use client'

import { useMemo } from 'react'

import Typography from '@mui/material/Typography'

import type { GridColDef } from '@mui/x-data-grid'

import GenericDataGrid from '@/components/datagrid/GenericDataGrid'

import type { SettlementDto, SettlementsQueryParams } from '@/types/api/settlements'

import SettlementActions from './SettlementAction'
import SettlementStatusChip, { normalizeSettlementStatus } from './SettlementStatusChip'

const formatAmount = (amount?: number | null) =>
  amount === null || amount === undefined ? '—' : amount.toLocaleString()

const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString() : '—')

const HOURS_IN_MS = 60 * 60 * 1000
const DELAY_THRESHOLD_HOURS = 48

const isDelayedSettlement = (settlement: SettlementDto) => {
  const status = normalizeSettlementStatus(settlement.status)
  if (status !== 'New' && status !== 'InProcess') return false
  if (!settlement.requestedAt) return false
  const requestedAt = new Date(settlement.requestedAt).getTime()
  if (Number.isNaN(requestedAt)) return false
  return Date.now() - requestedAt > DELAY_THRESHOLD_HOURS * HOURS_IN_MS
}

type Props = {
  rows: SettlementDto[]
  loading: boolean
  totalCount: number
  query: SettlementsQueryParams
  setQuery: (q: SettlementsQueryParams) => void
  error?: string | null
  onRetry?: () => void
  onView: (settlement: SettlementDto) => void
}

export default function SettlementTable({
  rows,
  loading,
  totalCount,
  query,
  setQuery,
  error,
  onRetry,
  onView,
}: Props) {
  const columns = useMemo<GridColDef<SettlementDto>[]>(
    () => [
      {
        field: 'settlementDate',
        headerName: 'تاريخ التسوية',
        width: 150,
        renderCell: params => (
          <Typography variant="body2">{formatDate(params.row.settlementDate)}</Typography>
        ),
      },
      {
        field: 'clientName',
        headerName: 'اسم نقطة البيع',
        flex: 1,
        minWidth: 200,
        renderCell: params => <Typography variant="body2">{params.value || '—'}</Typography>,
      },
      {
        field: 'grossAmount',
        headerName: 'إجمالي المبلغ',
        width: 150,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => <Typography variant="body2">{formatAmount(params.value)}</Typography>,
      },
      {
        field: 'commissionPercentage',
        headerName: 'نسبة العمولة',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => <Typography variant="body2">{params.value ?? 0}%</Typography>,
      },
      {
        field: 'netAmount',
        headerName: 'صافي المبلغ',
        width: 150,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => (
          <Typography variant="body2" fontWeight={700} color="primary">
            {formatAmount(params.value)}
          </Typography>
        ),
      },
      {
        field: 'status',
        headerName: 'الحالة',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => <SettlementStatusChip status={params.value} />,
      },
      {
        field: 'actions',
        headerName: 'الإجراءات',
        width: 300,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => <SettlementActions settlement={params.row} onView={onView} />,
      },
    ],
    [onView],
  )

  return (
    <GenericDataGrid<SettlementDto>
      rows={rows}
      columns={columns}
      loading={loading}
      totalCount={totalCount}
      query={query}
      setQuery={setQuery}
      getRowId={row => row.id}
      error={error}
      onRetry={onRetry}
      onRowDoubleClick={row => onView(row)}
      getRowClassName={params => {
        const status = normalizeSettlementStatus(params.row.status)
        if (isDelayedSettlement(params.row)) return 'settlement-row--delayed'
        if (status === 'New') return 'settlement-row--new'
        return ''
      }}
      sx={theme => ({
        '& .settlement-row--new': {
          backgroundColor: theme.palette.warning.light,
          '&:hover': {
            backgroundColor: theme.palette.warning.light,
          },
        },
        '& .settlement-row--delayed': {
          backgroundColor: theme.palette.error.light,
          '&:hover': {
            backgroundColor: theme.palette.error.light,
          },
        },
      })}
    />
  )
}
