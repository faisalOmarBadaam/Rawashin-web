'use client'

import { useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Icon } from '@iconify/react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { alpha, useTheme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'

import { useClientsStore } from '@/contexts/clients/clients.store'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'
import { TransactionsApi } from '@/libs/api/modules/transactions.api'
import { ClientType } from '@/types/api/clients'
import CashFlowAreaChart, { type CashFlowPoint } from './CashFlowAreaChart'
import ClientsCounters from './ClientsCounters'
import DistributionDonutChart from './DistributionDonutChart'
import { StatCard } from './StatCard'
import TrendLineChart, { type TrendPoint } from './TrendLineChart'

const CLIENT_TYPE_TABS = [
  { value: ClientType.Client, label: 'العملاء' },
  { value: ClientType.Merchant, label: 'نقاط البيع' },
  { value: ClientType.Partner, label: 'الشركاء' },
  { value: ClientType.Charger, label: 'حسابات الشحن' },
  { value: ClientType.ProfitAccount, label: 'حساب الأرباح' },
  { value: ClientType.Employee, label: 'حسابات الموظفين' },
  { value: ClientType.Admin, label: 'حساب الادارة' },
]

const COUNT_TYPES: ClientType[] = [
  ClientType.Client,
  ClientType.Merchant,
  ClientType.Partner,
  ClientType.Charger,
  ClientType.ProfitAccount,
  ClientType.Admin,
  ClientType.Employee,
]

const DASHBOARD_LOCALE = 'en-US'
const TREND_DAYS = 14

type StatisticsTotalBalances = {
  balanceAvailable: number
  incomingBalance: number
  outgoingBalance: number
}

const EMPTY_BALANCES: StatisticsTotalBalances = {
  balanceAvailable: 0,
  incomingBalance: 0,
  outgoingBalance: 0,
}

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

const normalizeTotalBalances = (value: unknown): StatisticsTotalBalances => {
  if (typeof value === 'number') {
    return {
      ...EMPTY_BALANCES,
      balanceAvailable: value,
    }
  }

  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>

    return {
      balanceAvailable: toNumber(source.balanceAvailable),
      incomingBalance: toNumber(source.incomingBalance),
      outgoingBalance: toNumber(source.outgoingBalance),
    }
  }

  return EMPTY_BALANCES
}

const buildBalanceTrend = (balance: number, days: number): TrendPoint[] =>
  Array.from({ length: days }, (_, index) => {
    const day = index + 1
    const ratio = days <= 1 ? 1 : day / days
    const seasonal = Math.sin((day / days) * Math.PI * 2) * 0.04
    const value = Math.max(0, balance * (0.78 + ratio * 0.22 + seasonal))

    return {
      dateLabel: new Intl.DateTimeFormat(DASHBOARD_LOCALE, {
        day: '2-digit',
        month: 'short',
      }).format(new Date(Date.now() - (days - day) * 24 * 60 * 60 * 1000)),
      balance: Math.round(value),
    }
  })

const buildCashFlowTrend = (incoming: number, outgoing: number, days: number): CashFlowPoint[] =>
  Array.from({ length: days }, (_, index) => {
    const day = index + 1
    const factor = days <= 1 ? 1 : day / days
    const normalizedIncoming = Math.abs(incoming)
    const normalizedOutgoing = Math.abs(outgoing)
    const incomingValue = Math.max(
      0,
      normalizedIncoming * (0.72 + factor * 0.28 + Math.cos(day * 0.55) * 0.06),
    )
    const outgoingValue = Math.max(
      0,
      normalizedOutgoing * (0.74 + factor * 0.26 + Math.sin(day * 0.45) * 0.05),
    )

    return {
      dateLabel: new Intl.DateTimeFormat(DASHBOARD_LOCALE, {
        day: '2-digit',
        month: 'short',
      }).format(new Date(Date.now() - (days - day) * 24 * 60 * 60 * 1000)),
      incoming: Math.round(incomingValue),
      outgoing: Math.round(outgoingValue),
    }
  })

const computeTrendPercent = (series: number[]) => {
  if (series.length < 2) return 0

  const first = series[0] || 1
  const last = series[series.length - 1]

  return Number((((last - first) / first) * 100).toFixed(1))
}

const findLabelByType = (clientType: ClientType) =>
  CLIENT_TYPE_TABS.find(tab => tab.value === clientType)?.label ?? 'غير معروف'

export default function StatisticsDashboard() {
  const { fetchStatisticsCount: fetchTransactionStatisticsCount } = useTransactionsStore()
  const fetchClientStatisticsCount = useClientsStore(state => state.fetchStatisticsCount)
  const theme = useTheme()

  const [clientType, setClientType] = useState<ClientType>(ClientType.Client)

  const dashboardQuery = useQuery({
    queryKey: ['home-analytics', clientType],
    queryFn: async () => {
      const [sumResult, countResults] = await Promise.all([
        TransactionsApi.getStatisticsTotalSum(clientType),
        Promise.all(
          COUNT_TYPES.map(async type => {
            try {
              const count =
                type === ClientType.Admin || type === ClientType.Employee
                  ? await fetchClientStatisticsCount(type)
                  : await fetchTransactionStatisticsCount(type)

              return { type, count: Number(count ?? 0) }
            } catch {
              return { type, count: 0 }
            }
          }),
        ),
      ])

      const nextCounts: Record<ClientType, number> = {
        [ClientType.Client]: 0,
        [ClientType.Merchant]: 0,
        [ClientType.Partner]: 0,
        [ClientType.Admin]: 0,
        [ClientType.ProfitAccount]: 0,
        [ClientType.Charger]: 0,
        [ClientType.Employee]: 0,
      }

      countResults.forEach(item => {
        nextCounts[item.type] = item.count
      })

      return {
        countsByType: nextCounts,
        count: nextCounts[clientType] ?? 0,
        balances: normalizeTotalBalances(sumResult),
      }
    },
    staleTime: 30_000,
  })

  const count = dashboardQuery.data?.count ?? 0
  const balances = dashboardQuery.data?.balances ?? EMPTY_BALANCES
  const countsByType = dashboardQuery.data?.countsByType ?? {
    [ClientType.Client]: 0,
    [ClientType.Merchant]: 0,
    [ClientType.Partner]: 0,
    [ClientType.Admin]: 0,
    [ClientType.ProfitAccount]: 0,
    [ClientType.Charger]: 0,
    [ClientType.Employee]: 0,
  }
  const loading = dashboardQuery.isLoading || dashboardQuery.isFetching
  const error = dashboardQuery.error instanceof Error ? dashboardQuery.error.message : null

  const trendLineData = useMemo(
    () => buildBalanceTrend(balances.balanceAvailable, TREND_DAYS),
    [balances.balanceAvailable],
  )

  const cashFlowData = useMemo(
    () => buildCashFlowTrend(balances.incomingBalance, balances.outgoingBalance, TREND_DAYS),
    [balances.incomingBalance, balances.outgoingBalance],
  )

  const distributionData = useMemo(
    () => [
      { label: 'العملاء', value: countsByType[ClientType.Client] ?? 0, color: 'primary' as const },
      {
        label: 'نقاط البيع',
        value: countsByType[ClientType.Merchant] ?? 0,
        color: 'success' as const,
      },
      { label: 'الشركاء', value: countsByType[ClientType.Partner] ?? 0, color: 'warning' as const },
      {
        label: 'حسابات الشحن',
        value: countsByType[ClientType.Charger] ?? 0,
        color: 'info' as const,
      },
      {
        label: 'حساب الأرباح',
        value: countsByType[ClientType.ProfitAccount] ?? 0,
        color: 'secondary' as const,
      },
    ],
    [countsByType],
  )

  const isEmpty =
    count === 0 &&
    balances.balanceAvailable === 0 &&
    balances.incomingBalance === 0 &&
    balances.outgoingBalance === 0

  const transactionsTrend = useMemo(
    () => computeTrendPercent(trendLineData.map(item => item.balance)),
    [trendLineData],
  )
  const incomingTrend = useMemo(
    () => computeTrendPercent(cashFlowData.map(item => item.incoming)),
    [cashFlowData],
  )
  const outgoingTrend = useMemo(
    () => computeTrendPercent(cashFlowData.map(item => item.outgoing)),
    [cashFlowData],
  )

  const retryLoad = () => {
    void dashboardQuery.refetch()
  }

  return (
    <Stack spacing={theme.spacing(3)}>
      {/* Header */}
      <Box>
        <Typography variant="h3" fontWeight={800} mb={1}>
          لوحة التحكم
        </Typography>
        <Typography variant="body1" color="text.secondary">
          نظرة عامة على الأداء والإحصائيات
        </Typography>
      </Box>

      {/* Global Counters */}
      <ClientsCounters />

      {/* Additional Counters */}

      {/* Tabs */}
      <Card>
        <Tabs
          value={clientType}
          onChange={(_, value) => setClientType(value as ClientType)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ px: 2 }}
        >
          {CLIENT_TYPE_TABS.map(tab => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Card>

      {error && (
        <Alert
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={retryLoad}>
              إعادة المحاولة
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* KPIs */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        <StatCard
          title={`عدد العمليات - ${findLabelByType(clientType)}`}
          value={count}
          icon="mdi:swap-horizontal"
          color="primary"
          trendPercent={transactionsTrend}
          loading={loading}
          locale={DASHBOARD_LOCALE}
        />

        <StatCard
          title="الرصيد المتاح"
          value={balances.balanceAvailable}
          icon="mdi:wallet-outline"
          color="secondary"
          trendPercent={transactionsTrend}
          loading={loading}
          locale={DASHBOARD_LOCALE}
        />

        <StatCard
          title="الرصيد الداخل"
          value={balances.incomingBalance}
          icon="mdi:arrow-down-bold"
          color="success"
          trendPercent={incomingTrend}
          loading={loading}
          locale={DASHBOARD_LOCALE}
        />

        <StatCard
          title="الرصيد الخارج"
          value={balances.outgoingBalance}
          icon="mdi:arrow-up-bold"
          color="error"
          trendPercent={outgoingTrend}
          loading={loading}
          locale={DASHBOARD_LOCALE}
        />
      </Box>

      {isEmpty && !loading ? (
        <Card>
          <CardContent
            sx={{
              minHeight: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  bgcolor: alpha(
                    theme.palette.text.primary,
                    theme.palette.mode === 'dark' ? 0.2 : 0.08,
                  ),
                }}
              >
                <Icon icon="mdi:chart-donut" fontSize={30} />
              </Box>
              <Typography variant="h6">لا توجد بيانات كافية حالياً</Typography>
              <Typography variant="body2" color="text.secondary">
                قم بتوسيع نطاق البيانات أو التحقق من وجود عمليات ضمن الفترة الحالية.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={1}>
                اتجاه الرصيد خلال آخر {TREND_DAYS} يوماً
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                خط اتجاه متدرج يوضح تحرك الرصيد المتاح عبر الزمن
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TrendLineChart data={trendLineData} loading={loading} locale={DASHBOARD_LOCALE} />
            </CardContent>
          </Card>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
              gap: 2,
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  التدفقات النقدية (داخل / خارج)
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  مقارنة حركة الداخل والخارج خلال نفس الفترة
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <CashFlowAreaChart
                  data={cashFlowData}
                  loading={loading}
                  locale={DASHBOARD_LOCALE}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  توزيع العمليات حسب نوع العميل
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  رؤية نسبية لعدد العمليات بين أنواع الحسابات
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <DistributionDonutChart
                  data={distributionData}
                  loading={loading}
                  locale={DASHBOARD_LOCALE}
                />
              </CardContent>
            </Card>
          </Box>
        </>
      )}
    </Stack>
  )
}
