import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'

import { formatCurrency } from '@/shared/utils'

import {
  useClientCreditAccountDebtAmount,
  useClientCreditAccountTotalAmount,
} from '../hooks'

type SummaryCardProps = {
  label: string
  value?: number
  loading: boolean
  icon: ReactNode
  iconSx: SxProps<Theme>
  cardSx: SxProps<Theme>
}

function SummaryCard({
  label,
  value,
  loading,
  icon,
  iconSx,
  cardSx,
}: SummaryCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        ...cardSx,
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            ...iconSx,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {label}
          </Typography>

          {loading ? (
            <Skeleton width={140} height={40} />
          ) : (
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {formatCurrency(value)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

type ClientCreditAccountSummaryProps = {
  clientId: string
}

export default function ClientCreditAccountSummary({
  clientId,
}: ClientCreditAccountSummaryProps) {
  const totalAmountQuery = useClientCreditAccountTotalAmount(clientId)
  const debtAmountQuery = useClientCreditAccountDebtAmount(clientId)

  const hasError = totalAmountQuery.isError || debtAmountQuery.isError

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {hasError ? (
        <Alert severity="warning">
          تعذر جلب رصيد الحساب أو رصيد الدين حاليًا.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        <SummaryCard
          label="رصيد الحساب"
          value={totalAmountQuery.data}
          loading={totalAmountQuery.isLoading}
          icon={<AccountBalanceWalletIcon />}
          iconSx={{
            bgcolor: 'success.light',
            color: 'success.dark',
          }}
          cardSx={{
            borderColor: 'success.light',
            background:
              'linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(255, 255, 255, 1) 100%)',
          }}
        />

        <SummaryCard
          label="رصيد الدين"
          value={debtAmountQuery.data}
          loading={debtAmountQuery.isLoading}
          icon={<MoneyOffIcon />}
          iconSx={{
            bgcolor: 'warning.light',
            color: 'warning.dark',
          }}
          cardSx={{
            borderColor: 'warning.light',
            background:
              'linear-gradient(135deg, rgba(237, 108, 2, 0.08) 0%, rgba(255, 255, 255, 1) 100%)',
          }}
        />
      </Box>
    </Box>
  )
}