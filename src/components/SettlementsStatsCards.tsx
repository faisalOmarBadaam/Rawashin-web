'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export type StatItem = {
  id: string
  label: string
  value: string | number
  icon: string
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'
}

interface Props {
  items: StatItem[]
  loading?: boolean
}

function StatCard({ label, value, icon, color, loading }: StatItem & { loading?: boolean }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        transition: '0.2s',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.main`,
              color: '#fff',
            }}
          >
            <i className={icon} style={{ fontSize: 22 }} />
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700}>
              {loading ? '—' : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function SettlementsStatsCards({ items, loading }: Props) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(6, 1fr)',
        },
        gap: 2,
      }}
    >
      {items.map(item => (
        <StatCard key={item.id} {...item} loading={loading} />
      ))}
    </Box>
  )
}
