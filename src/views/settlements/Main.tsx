'use client'

import { useCallback, useEffect, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import ServerDataGrid from '@/components/datagrid/ServerDataGrid'

import { useSettlementsStore } from '@/contexts/settlements/settlements.store'
import { normalizeListQuery } from '@/shared/listing/listQuery.normalize'

import type { SettlementDto } from '@/types/api/settlements'
import { normalizeSettlementStatus } from './components/SettlementStatusChip'
import { getSettlementColumns } from './components/settlements.columns'

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

export default function SettlementsPage() {
  const router = useRouter()

  const { list, totalCount, loading, error, query, setQuery, fetchSettlements } =
    useSettlementsStore()

  const goToView = useCallback(
    (settlement: SettlementDto) => {
      router.push(`/settlements/${settlement.id}`)
    },
    [router],
  )

  const columns = useMemo(
    () =>
      getSettlementColumns({
        onView: goToView,
      }),
    [goToView],
  )

  useEffect(() => {
    fetchSettlements()
  }, [
    fetchSettlements,
    query.PageNumber,
    query.PageSize,
    query.Search,
    query.Status,
    query.SortBy,
    query.IsDesc,
    query.FromDate,
    query.ToDate,
  ])

  return (
    <Card>
      <CardContent>
        <ServerDataGrid<SettlementDto>
          rows={list}
          columns={columns}
          loading={loading}
          totalCount={totalCount}
          query={query}
          filters={{
            Status: query.Status,
            FromDate: query.FromDate,
            ToDate: query.ToDate,
          }}
          onQueryChange={nextQuery =>
            setQuery(normalizeListQuery(nextQuery, 'settlements') as Partial<typeof query>, {
              resetPage: false,
            })
          }
          getRowId={row => row.id}
          error={error}
          onRetry={fetchSettlements}
          onRowDoubleClick={row => goToView(row)}
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
      </CardContent>
    </Card>
  )
}
