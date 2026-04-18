'use client'

import { useEffect, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import ServerDataGrid from '@/components/datagrid/ServerDataGrid'
import SettlementsStatsCards from '@/components/SettlementsStatsCards'

import { useSettlementsStore } from '@/contexts/settlements/settlements.store'

import type { SettlementDto } from '@/types/api/settlements'

import type { StatItem } from '@/components/SettlementsStatsCards'
import { normalizeListQuery } from '@/shared/listing/listQuery.normalize'
import { getSettlementColumns } from './components/settlements.columns'
import SettlementsFiltersBar from './components/SettlementsFiltersBar'
import { normalizeSettlementStatus } from './components/SettlementStatusChip'

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

export default function SettlementsPage() {
  const router = useRouter()

  const { list, totalCount, loading, error, query, setQuery, fetchSettlements } =
    useSettlementsStore()

  useEffect(() => {
    fetchSettlements()
  }, [
    fetchSettlements,
    query.PageNumber,
    query.PageSize,
    query.Search,
    query.Status,
    query.FromDate,
    query.ToDate,
    query.SortBy,
    query.IsDesc,
  ])

  const columns = useMemo(
    () =>
      getSettlementColumns({
        onView: settlement => router.push(`/settlements/${settlement.id}?mode=view`),
      }),
    [router],
  )

  const statsCards = useMemo(
    () =>
      [
        {
          id: 'total',
          label: 'إجمالي التسويات',
          value: totalCount,
          icon: 'ri-stack-line',
          color: 'primary',
        },
        {
          id: 'new',
          label: 'تسويات جديدة',
          value: list.filter(i => normalizeSettlementStatus(i.status) === 'New').length,
          icon: 'ri-notification-3-line',
          color: 'warning',
        },
        {
          id: 'inProcess',
          label: 'قيد المعالجة',
          value: list.filter(i => normalizeSettlementStatus(i.status) === 'InProcess').length,
          icon: 'ri-loader-4-line',
          color: 'info',
        },
        {
          id: 'completed',
          label: 'مكتملة',
          value: list.filter(i => normalizeSettlementStatus(i.status) === 'Completed').length,
          icon: 'ri-checkbox-circle-line',
          color: 'success',
        },
        {
          id: 'closedWithoutCompletion',
          label: 'مغلقة بدون إتمام',
          value: list.filter(i => normalizeSettlementStatus(i.status) === 'ClosedWithoutCompletion')
            .length,
          icon: 'ri-close-circle-line',
          color: 'error', // أو 'warning' لو تبغى لون مختلف
        },
        {
          id: 'amount',
          label: 'إجمالي المبالغ',
          value: numberFormatter.format(list.reduce((sum, item) => sum + (item.netAmount ?? 0), 0)),
          icon: 'ri-money-dollar-circle-line',
          color: 'secondary',
        },
      ] satisfies StatItem[],
    [list, totalCount],
  )

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <SettlementsStatsCards items={statsCards} loading={loading} />

          <Box>
            <Typography variant="h5" fontWeight={700}>
              التسويات
            </Typography>
            <Typography variant="body2" color="text.secondary">
              متابعة وإدارة التسويات بشكل واضح وسريع
            </Typography>
          </Box>

          <SettlementsFiltersBar />

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
            onRowDoubleClick={row => {
              router.push(`/settlements/${row.id}?mode=view`)
            }}
            error={error ? 'تعذر تحميل التسويات. يرجى المحاولة مرة أخرى.' : undefined}
            onRetry={fetchSettlements}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
