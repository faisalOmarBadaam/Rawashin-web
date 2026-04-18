import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { alpha, useTheme } from '@mui/material/styles'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type TrendPoint = {
  dateLabel: string
  balance: number
}

type TrendLineChartProps = {
  data: TrendPoint[]
  loading?: boolean
  locale?: string
}

const formatAmount = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)

export default function TrendLineChart({
  data,
  loading = false,
  locale = 'ar-SA',
}: TrendLineChartProps) {
  const theme = useTheme()

  if (loading) {
    return <Skeleton variant="rounded" height={280} />
  }

  return (
    <Box sx={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 10, left: 10, bottom: 6 }}>
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
          <Line
            type="monotone"
            dataKey="balance"
            name="الرصيد"
            stroke={theme.palette.primary.main}
            strokeWidth={2.5}
            dot={{ r: 2, fill: theme.palette.primary.main }}
            activeDot={{ r: 5 }}
            isAnimationActive
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}
