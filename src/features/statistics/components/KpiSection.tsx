import Box from '@mui/material/Box'
import { CLIENT_TYPE_TABS, type ClientType } from '@/shared/types/ClientType'
import { StatCard } from '@/shared/components/ui/StatCard'

interface KpiSectionProps {
  clientType: ClientType
  count: number
  balances: { balanceAvailable: number; incomingBalance: number; outgoingBalance: number }
  trends: { transactions: number; incoming: number; outgoing: number }
  loading: boolean
}

export function KpiSection({ clientType, count, balances, trends, loading }: KpiSectionProps) {

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
        width: '100%'
      }}
    >
      <StatCard
        title={`عدد العمليات - ${CLIENT_TYPE_TABS.find(tab => tab.value === clientType)?.label || ''}`}
        value={count}
        icon="mdi:swap-horizontal"
        color="primary"
        trendPercent={trends.transactions}
        loading={loading}
      />
      <StatCard
        title="الرصيد المتاح"
        value={balances.balanceAvailable}
        icon="mdi:wallet-outline"
        color="secondary"
        trendPercent={trends.transactions}
        loading={loading}
      />
      <StatCard
        title="الرصيد الداخل"
        value={balances.incomingBalance}
        icon="mdi:arrow-down-bold"
        color="success"
        trendPercent={trends.incoming}
        loading={loading}
      />
      <StatCard
        title="الرصيد الخارج"
        value={balances.outgoingBalance}
        icon="mdi:arrow-up-bold"
        color="error"
        trendPercent={trends.outgoing}
        loading={loading}
      />
    </Box>
  )
}