'use client'

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import { useTransactionsStore } from '@/contexts/transactions/transactions.store'
import { ClientType } from '@/types/api/clients'

const CLIENT_TYPE_TABS = [
  { value: ClientType.Client, label: 'العملاء' },
  { value: ClientType.Merchant, label: 'نقاط البيع' },
  { value: ClientType.Partner, label: 'الشركاء' }
]

const formatNumber = (value: number) => value.toLocaleString()

export default function StatisticsDashboard() {
  const { fetchStatisticsCount, fetchStatisticsTotalSum } = useTransactionsStore()

  const [clientType, setClientType] = useState<ClientType>(ClientType.Client)
  const [count, setCount] = useState<number | null>(null)
  const [totalSum, setTotalSum] = useState<number | null>(null)
  const [countLoading, setCountLoading] = useState(false)
  const [sumLoading, setSumLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    setCountLoading(true)
    fetchStatisticsCount(clientType)
      .then(result => {
        if (mounted) setCount(result)
      })
      .finally(() => {
        if (mounted) setCountLoading(false)
      })

    setSumLoading(true)
    fetchStatisticsTotalSum(clientType)
      .then(result => {
        if (mounted) setTotalSum(result)
      })
      .finally(() => {
        if (mounted) setSumLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [clientType, fetchStatisticsCount, fetchStatisticsTotalSum])

  const chartData = useMemo(
    () => [
      { label: 'عدد العمليات', value: count ?? 0 },
      { label: 'إجمالي المبلغ', value: totalSum ?? 0 }
    ],
    [count, totalSum]
  )

  const maxValue = Math.max(...chartData.map(item => item.value), 1)
  const isChartEmpty = chartData.every(item => item.value === 0)

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h5" mb={2}>
            لوحة الإحصائيات
          </Typography>

          <Tabs
            value={clientType}
            onChange={(_, value) => setClientType(value as ClientType)}
          >
            {CLIENT_TYPE_TABS.map(tab => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2
        }}
      >
        <Card>
          <CardContent>
            <Typography color="text.secondary" variant="subtitle2">
              إجمالي عدد العمليات
            </Typography>
            {countLoading ? (
              <Skeleton variant="text" width={120} height={36} />
            ) : (
              <Typography variant="h4" mt={1}>
                {count !== null ? formatNumber(count) : '--'}
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary" variant="subtitle2">
              إجمالي المبالغ
            </Typography>
            {sumLoading ? (
              <Skeleton variant="text" width={140} height={36} />
            ) : (
              <Typography variant="h4" mt={1}>
                {totalSum !== null ? formatNumber(totalSum) : '--'}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            نظرة عامة على الأداء
          </Typography>

          {countLoading || sumLoading ? (
            <Skeleton variant="rectangular" height={220} />
          ) : isChartEmpty ? (
            <Box
              sx={{
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary'
              }}
            >
              لا توجد بيانات كافية لعرض الرسم البياني
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 220 }}>
              {chartData.map(item => (
                <Box key={item.label} sx={{ flex: 1, textAlign: 'center' }}>
                  <Box
                    sx={{
                      height: `${(item.value / maxValue) * 100}%`,
                      minHeight: 24,
                      backgroundColor: 'primary.main',
                      borderRadius: 1,
                      transition: 'height 0.3s ease'
                    }}
                  />
                  <Typography variant="body2" mt={1} color="text.secondary">
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}
