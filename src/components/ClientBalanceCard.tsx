'use client'

import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'

import { Icon } from '@iconify/react'
import { format } from 'date-fns'

import { useClientBalance } from '@/hooks/useClientBalance'

type Props = {
  clientId: string
}

export default function ClientBalanceCard({ clientId }: Props) {
  const { balanceData, loading, error, refreshBalance } = useClientBalance(clientId)

  const isNegative = (balanceData?.currentBalance ?? 0) < 0

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1
      }}
    >
      <Stack spacing={1}>
        {/* Top row */}
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Stack direction='row' alignItems='center' spacing={0.5}>
            <Icon icon='mdi:cash' width={18} />
            <Typography variant='body2' fontWeight={600}>
              الرصيد الحالي
            </Typography>
          </Stack>

          <IconButton size='small' onClick={refreshBalance} disabled={loading}>
            <Icon icon='mdi:refresh' width={18} />
          </IconButton>
        </Stack>

        <Divider />

        {/* Content */}
        {error ? (
          <Typography color='error' variant='body2'>
            فشل تحميل الرصيد
          </Typography>
        ) : loading || !balanceData ? (
          <CircularProgress size={20} />
        ) : (
          <Stack direction='row' alignItems='baseline' spacing={1}>
            <Typography
              variant='h6'
              fontWeight={700}
              color={isNegative ? 'error.main' : 'text.primary'}
            >
              {balanceData.currentBalance.toLocaleString('en-US')}
            </Typography>

            <Typography variant='body2' color='text.secondary'>
              {balanceData.currency}
            </Typography>

            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ ml: 'auto' }}
            >
              {format(new Date(balanceData.lastUpdated), 'yyyy-MM-dd')}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
