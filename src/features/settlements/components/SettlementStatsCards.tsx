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
        label: 'اجمالي التسويات',
        value: stats.total,
        icon: 'mdi:format-list-bulleted',
        color: 'primary',
      },
      {
        id: 'new',
        label: 'التسويات الجديدة',
        value: stats.new,
        icon: 'mdi:plus-box',
        color: 'info',
      },
      {
        id: 'inProcess',
        label: 'قيد المعالجة',
        value: stats.inProcess,
        icon: 'mdi:progress-clock',
        color: 'warning',
      },
      {
        id: 'completed',
        label: 'تم الانتهاء',
        value: stats.completed,
        icon: 'mdi:check-circle',
        color: 'success',
      },
      {
        id: 'closedWithoutCompletion',
        label: 'تم الإغلاق بدون إكمال',
        value: stats.closedWithoutCompletion,
        icon: 'mdi:close-circle',
        color: 'error',
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
          lg: 'repeat(4, minmax(0, 1fr))',
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