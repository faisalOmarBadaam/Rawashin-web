'use client'

import { useEffect, useState } from 'react'

import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton
} from '@mui/material'

import { useTransactionsStore } from '@/contexts/transactions/transactions.store'
import type { ChargerStatisticsDto } from '@/types/api/transaction'

type Props = {
  clientId: string
  fromDate: string
  toDate: string
}

export default function ChargerSummaryCompact({
  clientId,
  fromDate,
  toDate
}: Props) {
  const { fetchChargerStatistics } = useTransactionsStore()

  const [data, setData] = useState<ChargerStatisticsDto | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!fromDate || !toDate) return

    setLoading(true)
    fetchChargerStatistics(clientId, {
      FromDate: fromDate,
      ToDate: toDate
    })
      .then(setData)
      .finally(() => setLoading(false))
  }, [clientId, fromDate, toDate, fetchChargerStatistics])

  if (loading) {
    return (
      <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rounded" height={80} />
        ))}
      </Box>
    )
  }

  if (!data) return null

  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={2}>
      <StatCard
        title="إجمالي الداخل"
        value={`${data.totalInAmount.toLocaleString()} ي`}
        icon="ri-arrow-down-circle-line"
        color="success"
      />

      <StatCard
        title="إجمالي الخارج"
        value={`${data.totalOutAmount.toLocaleString()} ي`}
        icon="ri-arrow-up-circle-line"
        color="error"
      />

      <StatCard
        title="عدد العمليات الداخلة"
        value={data.totalIntransactions}
        icon="ri-login-circle-line"
        color="primary"
      />

      <StatCard
        title="عدد العمليات الخارجة"
        value={data.totalOuttransactions}
        icon="ri-logout-circle-line"
        color="warning"
      />
    </Box>
  )
}

function StatCard({
  title,
  value,
  icon,
  color
}: {
  title: string
  value: string | number
  icon: string
  color: 'success' | 'error' | 'primary' | 'warning'
}) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <i
            className={icon}
            style={{
              fontSize: 20,
              color: `var(--mui-palette-${color}-main)`
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
        </Box>

        <Typography variant="h6" fontWeight={700}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}
