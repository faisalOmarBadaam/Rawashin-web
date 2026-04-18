import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { alpha, useTheme } from '@mui/material/styles'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type CashFlowPoint = {
  dateLabel: string
  incoming: number
  outgoing: number
}

type CashFlowAreaChartProps = {
  data: CashFlowPoint[]
  loading?: boolean
  locale?: string
}

const formatAmount = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)

export default function CashFlowAreaChart({
  data,
  loading = false,
  locale = 'ar-SA',
}: CashFlowAreaChartProps) {
  const theme = useTheme()

  if (loading) {
    return <Skeleton variant="rounded" height={280} />
  }

  return (
    <Box sx={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 10, left: 10, bottom: 6 }}>
          <defs>
            <linearGradient id="incomingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.45} />
              <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.06} />
            </linearGradient>
            <linearGradient id="outgoingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.38} />
              <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.06} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.7)} />
          <XAxis
            dataKey="dateLabel"
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickMargin={8}
            reversed={theme.direction === 'rtl'}
          />
          <YAxis
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={value => formatAmount(Number(value), locale)}
            width={72}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              borderRadius: 12,
              color: theme.palette.text.primary,
            }}
            formatter={value => formatAmount(Number(value), locale)}
            labelStyle={{ color: theme.palette.text.secondary }}
          />
          <Legend wrapperStyle={{ color: theme.palette.text.secondary }} />
          <Area
            type="monotone"
            dataKey="incoming"
            name="الرصيد الداخل"
            stroke={theme.palette.success.main}
            fill="url(#incomingGradient)"
            strokeWidth={2}
            isAnimationActive
            animationDuration={900}
          />
          <Area
            type="monotone"
            dataKey="outgoing"
            name="الرصيد الخارج"
            stroke={theme.palette.error.main}
            fill="url(#outgoingGradient)"
            strokeWidth={2}
            isAnimationActive
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}
