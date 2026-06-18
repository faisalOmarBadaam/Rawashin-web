import { useMemo } from 'react'

import Box from '@mui/material/Box'

import { useSettlementsStatistics } from '../hooks'
import { StatCard } from '@/shared/components/ui/StatCard'


type SettlementStatItem = {
  id: string
  label: string
  value: number
  icon: string
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  precision?: number
  subtitle?: string
}




export function SettlementStatsCards() {
  const settlementsStatisticsQuery = useSettlementsStatistics()
  const statsCards = useMemo<SettlementStatItem[]>(() => {
    const stats = settlementsStatisticsQuery.data
    if (!stats) return []

    return [
      {
        id: 'total',
        label: 'Total Settlements',
        value: stats.total,
        icon: 'mdi:format-list-bulleted',
        color: 'primary',
      },
      {
        id: 'new',
        label: 'New Settlements',
        value: stats.new,
        icon: 'mdi:plus-box',
        color: 'info',
      },
      {
        id: 'inProcess',
        label: 'In Process',
        value: stats.inProcess,
        icon: 'mdi:progress-clock',
        color: 'warning',
      },
      {
        id: 'completed',
        label: 'Completed',
        value: stats.completed,
        icon: 'mdi:check-circle',
        color: 'success',
      },
      {
        id: 'closedWithoutCompletion',
        label: 'Closed w/o Completion',
        value: stats.closedWithoutCompletion,
        icon: 'mdi:close-circle',
        color: 'error',
      },
      {
        id: 'totalAmount',
        label: 'Total Amount',
        value: stats.totalAmount,
        icon: 'mdi:currency-usd',
        color: 'secondary',
        precision: 2,
      },
    ]
  }, [settlementsStatisticsQuery.data])

 
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(6, minmax(0, 1fr))',
        },
        gap: 2,
        mb: 3,
      }}
    >
      {statsCards.map((item) => (
        <StatCard
          key={item.id}
          title={item.label}
          value={item.value}
          icon={item.icon}
          color={item.color}
          precision={item.precision}
          subtitle={item.subtitle}
          loading={settlementsStatisticsQuery.isLoading}
        />
      ))}
    </Box>
  )
}