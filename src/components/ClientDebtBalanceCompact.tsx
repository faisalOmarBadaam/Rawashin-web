'use client'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { Icon } from '@iconify/react'

import { useClientDebtBalance } from '@/hooks/useClientDebtBalance'

type Props = {
  clientId: string
}

export default function ClientDebtBalanceCompact({ clientId }: Props) {
  const { debtBalance, loading, refreshDebtBalance } = useClientDebtBalance(clientId)
  const balance = Number(debtBalance?.totalDebt ?? 0)

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
          <Icon icon="mdi:credit-card-outline" width={18} />
          <Typography variant="body2" fontWeight={600}>
            رصيد الدين
          </Typography>
        </Stack>

        {loading ? (
          <CircularProgress size={16} />
        ) : (
          <>
            <Typography
              variant="body2"
              fontWeight={700}
              color={balance > 0 ? 'error.main' : 'text.primary'}
            >
              {balance.toLocaleString('en-US')} YR
            </Typography>
          </>
        )}

        <IconButton size="small" onClick={refreshDebtBalance} disabled={loading}>
          <Icon icon="mdi:refresh" width={16} />
        </IconButton>
      </Stack>
    </Box>
  )
}
