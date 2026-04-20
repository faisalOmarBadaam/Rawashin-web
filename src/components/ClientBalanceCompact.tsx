'use client'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { Icon } from '@iconify/react'

import { useClientBalance } from '@/hooks/useClientBalance'

type Props = {
  clientId: string
}

export default function ClientBalanceCompact({ clientId }: Props) {
  const { balanceData, loading, error, refreshBalance } = useClientBalance(clientId)

  const balance = Number(balanceData?.currentBalance ?? 0)

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Icon icon="mdi:wallet-outline" width={18} />
          <Typography variant="body2" fontWeight={600}>
            الرصيد الحالي
          </Typography>
        </Stack>

        {loading ? (
          <CircularProgress size={16} />
        ) : (
          <>
            <Typography
              variant="body2"
              fontWeight={700}
              color={balance < 0 ? 'error.main' : 'text.primary'}
            >
              {balance.toLocaleString('en-US')} {currency}
            </Typography>
          </>
        )}

        <IconButton size="small" onClick={refreshBalance} disabled={loading}>
          <Icon icon="mdi:refresh" width={16} />
        </IconButton>
      </Stack>
    </Box>
  )
}
