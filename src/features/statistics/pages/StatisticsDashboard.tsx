
import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'

import { KpiSection } from '../components/KpiSection'
import { ChartsSection } from '../components/ChartsSection'
import { EmptyState } from '../components/EmptyState'

import { ClientType } from '@/shared/types/ClientType'
import ClientsCounters from '../components/ClientsCounters'
import DashboardHeader from '../components/DashboardHeader'
import { useTransactionsCount, useTransactionsTotalSum } from '../hooks'
import type { DistributionPoint } from '../components/DistributionDonutChart'

function toNumber(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function normalizeTotalBalances(val: unknown): number {
  return toNumber(val);
}

function buildBalanceTrend(baseBalance: number, days: number = 14) {
  const points = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateLabel = d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    const noise = (Math.sin(i) * 0.15 + (Math.random() - 0.5) * 0.1);
    const balance = Math.max(0, Math.round(baseBalance * (1 - (i / days) * 0.3 + noise)));
    points.push({ dateLabel, balance });
  }
  return points;
}

function buildCashFlowTrend(incomingBase: number, outgoingBase: number, days: number = 14) {
  const points = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateLabel = d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    const noiseInc = Math.max(0, 0.8 + (Math.random() - 0.5) * 0.4);
    const noiseOut = Math.max(0, 0.8 + (Math.random() - 0.5) * 0.4);
    points.push({
      dateLabel,
      incoming: Math.round((incomingBase / days) * noiseInc),
      outgoing: Math.round((outgoingBase / days) * noiseOut),
    });
  }
  return points;
}

function computeTrendPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

const TREND_DAYS = 14
const EMPTY_BALANCES = { balanceAvailable: 0, incomingBalance: 0, outgoingBalance: 0 }

export default function StatisticsDashboard() {
  const theme = useTheme()
  const [clientType, setClientType] = useState<ClientType>(ClientType.Client)

  // Fetch count hook
  const transactionsCountQuery = useTransactionsCount(clientType)
  // Fetch total sum hook
  const transactionsTotalSumQuery = useTransactionsTotalSum(clientType)

  const count = transactionsCountQuery.data ?? 0
  const normalizedSum = normalizeTotalBalances(transactionsTotalSumQuery.data?? 0)

  // Calculate balances format used by KpiSection
  const balances = {
    balanceAvailable: normalizedSum,
    incomingBalance: Math.round(normalizedSum * 0.6), // Mock standard ratios based on aggregate
    outgoingBalance: Math.round(normalizedSum * 0.4),
  }

  // Calculate loading & error states
  const loading = transactionsCountQuery.isLoading || transactionsTotalSumQuery.isLoading
  const hasError = transactionsCountQuery.isError || transactionsTotalSumQuery.isError
  const error = hasError ? 'حدث خطأ أثناء تحميل البيانات من الخادم.' : null

  // Trends representation
  const prevCount = 100
  const trendPercent = computeTrendPercent(count, prevCount)
  const trends = {
    transactions: trendPercent || 12,
    incoming: 8,
    outgoing: -5,
  }

  const isEmpty = count === 0 && balances.balanceAvailable === 0 && balances.incomingBalance === 0 && balances.outgoingBalance === 0

  // Build chart specific data using helpers
  const trendLineData = buildBalanceTrend(balances.balanceAvailable, TREND_DAYS)
  const cashFlowData = buildCashFlowTrend(balances.incomingBalance, balances.outgoingBalance, TREND_DAYS)

  // Distribution chart dynamic dataset based on client type
  const distributionData: DistributionPoint[] = [
    { label: 'العملاء', value: clientType === ClientType.Client ? (count || 120) : 120, color: 'primary' },
    { label: 'نقاط البيع', value: clientType === ClientType.Merchant ? (count || 45) : 45, color: 'success' },
    { label: 'الشركاء', value: clientType === ClientType.Partner ? (count || 15) : 15, color: 'warning' },
    { label: 'حسابات الشحن', value: clientType === ClientType.Charger ? (count || 30) : 30, color: 'info' },
    { label: 'حسابات الموظفين', value: clientType === ClientType.Employee ? (count || 10) : 10, color: 'secondary' },
  ]

  const refetchAll = () => {
    transactionsCountQuery.refetch()
    transactionsTotalSumQuery.refetch()
  }

  const _empty = EMPTY_BALANCES

  return (
    <Stack spacing={theme.spacing(3)} data-empty={JSON.stringify(_empty)}>
      

      <ClientsCounters />
      <DashboardHeader clientType={clientType} onTabChange={setClientType} />

      {error && (
        <Alert severity="error" action={<Button size="small" color="inherit" onClick={refetchAll}>إعادة المحاولة</Button>}>
          {error}
        </Alert>
      )}

      <KpiSection 
        clientType={clientType} 
        count={count} 
        balances={balances} 
        trends={trends} 
        loading={loading} 
      />

      {isEmpty && !loading ? (
        <EmptyState />
      ) : (
        <ChartsSection 
          trendLineData={trendLineData} 
          cashFlowData={cashFlowData} 
          distributionData={distributionData} 
          loading={loading} 
          trendDays={TREND_DAYS} 
        />
      )}
    </Stack>
  )
}

