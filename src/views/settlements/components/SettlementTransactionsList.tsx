'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import type { SettlementTransactionDto } from '@/types/api/settlements'

type Props = {
  transactions: SettlementTransactionDto[]
}

export default function SettlementTransactionsList({ transactions }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">العمليات المرتبطة</Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={1}>
          {transactions.map(tx => (
            <Stack
              key={tx.id}
              direction="row"
              justifyContent="space-between"
            >
              <Typography variant="body2">
                {tx.description || '—'}
              </Typography>

              <Typography variant="body2" fontWeight={600}>
                {tx.amount.toLocaleString()}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
