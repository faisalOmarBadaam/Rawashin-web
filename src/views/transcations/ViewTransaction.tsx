'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useTransactionDetailsQuery } from '@/libs/react-query'

type Props = {
  transactionId: string
}

export default function ViewTransaction({ transactionId }: Props) {
  const { data: transaction, isLoading: loading } = useTransactionDetailsQuery(transactionId)

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>
          تفاصيل العملية
        </Typography>

        {loading ? (
          <Stack spacing={2}>
            <Skeleton variant="text" width={240} />
            <Skeleton variant="text" width={200} />
            <Skeleton variant="text" width={180} />
            <Skeleton variant="rectangular" height={120} />
          </Stack>
        ) : transaction ? (
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                رقم العملية
              </Typography>
              <Typography variant="body1">{transaction.referenceId ?? transaction.id}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                المبلغ
              </Typography>
              <Typography variant="body1">{transaction.amount.toLocaleString()}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                الوصف
              </Typography>
              <Typography variant="body1">{transaction.description ?? '—'}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                تاريخ العملية
              </Typography>
              <Typography variant="body1">
                {new Date(transaction.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Typography color="text.secondary">لم يتم العثور على العملية</Typography>
        )}
      </CardContent>
    </Card>
  )
}
