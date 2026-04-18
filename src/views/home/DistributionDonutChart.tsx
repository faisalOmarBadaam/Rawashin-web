import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export type DistributionPoint = {
  label: string
  value: number
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
}

type DistributionDonutChartProps = {
  data: DistributionPoint[]
  loading?: boolean
  locale?: string
}

const formatAmount = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)

export default function DistributionDonutChart({
  data,
  loading = false,
  locale = 'ar-SA',
}: DistributionDonutChartProps) {
  const theme = useTheme()

  if (loading) {
    return <Skeleton variant="rounded" height={280} />
  }

  const total = data.reduce((acc, item) => acc + item.value, 0)

  return (
    <Box sx={{ height: 280, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              borderRadius: 12,
              color: theme.palette.text.primary,
            }}
            formatter={(value, _name, entry) => {
              const item = entry.payload as DistributionPoint
              const rawValue = Array.isArray(value) ? value[0] : value

              return `${formatAmount(Number(rawValue ?? 0), locale)} - ${item.label}`
            }}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={96}
            paddingAngle={3}
            isAnimationActive
            animationDuration={900}
          >
            {data.map(item => (
              <Cell key={item.label} fill={theme.palette[item.color].main} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <Stack
        spacing={0.5}
        alignItems="center"
        justifyContent="center"
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          الإجمالي
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          {formatAmount(total, locale)}
        </Typography>
      </Stack>
    </Box>
  )
}
