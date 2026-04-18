'use client'

import { useEffect, useMemo } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { toast } from 'react-toastify'

import { useSettlementsStore } from '@/contexts/settlements/settlements.store'
import type { SettlementDto } from '@/types/api/settlements'

import SettlementTimeline from '@/components/SettlementTimeline'
import SettlementStatusChip, { normalizeSettlementStatus } from './components/SettlementStatusChip'

const formatAmount = (amount?: number | null) =>
  amount === null || amount === undefined ? '—' : amount.toLocaleString()

const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—')

const buildTimeline = (settlement: SettlementDto) => {
  const status = normalizeSettlementStatus(settlement.status)

  return [
    {
      label: 'تم الطلب',
      date: settlement.requestedAt,
      icon: 'ri-send-plane-line',
      active: true,
    },
    {
      label: 'قيد المعالجة',
      date: settlement.processingStartedAt,
      icon: 'ri-loader-4-line',
      active: status === 'InProcess' || status === 'Completed',
    },
    {
      label: 'تم الإكمال',
      date: settlement.completedAt,
      icon: 'ri-checkbox-circle-line',
      active: status === 'Completed',
    },
    {
      label: 'تم الإغلاق بدون إتمام',
      date: settlement.completedAt,
      icon: 'ri-close-circle-line',
      active: status === 'ClosedWithoutCompletion',
    },
  ].filter(item => item.date)
}

type Props = {
  settlementId: string
}

export default function MarchentSettlementDetails({ settlementId }: Props) {
  const { selectedSettlement, loading, error, fetchSettlementById } = useSettlementsStore()

  useEffect(() => {
    fetchSettlementById(settlementId)
  }, [fetchSettlementById, settlementId])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const timeline = useMemo(
    () => (selectedSettlement ? buildTimeline(selectedSettlement) : []),
    [selectedSettlement],
  )

  if (loading && !selectedSettlement) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (!selectedSettlement) {
    return <Alert severity="error">{error || 'تعذر تحميل بيانات التسوية.'}</Alert>
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight={700}>
                تفاصيل التسوية
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {/* رقم التسوية: {selectedSettlement.id} */}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <SettlementStatusChip status={selectedSettlement.status} />
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            <InfoCard label="اسم نقطة البيع" value={selectedSettlement.clientName} />
            <InfoCard
              label="تاريخ التسوية"
              value={formatDateTime(selectedSettlement.settlementDate)}
            />
            <InfoCard label="تاريخ الطلب" value={formatDateTime(selectedSettlement.requestedAt)} />
          </Box>
        </CardContent>
      </Card>

      {/* Amounts */}
      <Card>
        <CardContent>
          <Typography variant="h6">تفاصيل المبالغ</Typography>
          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            <InfoCard label="إجمالي المبلغ" value={formatAmount(selectedSettlement.grossAmount)} />
            <InfoCard
              label="نسبة العمولة"
              value={`${selectedSettlement.commissionPercentage ?? 0}%`}
            />
            <InfoCard
              label="قيمة العمولة"
              value={formatAmount(selectedSettlement.commissionAmount)}
            />
            <InfoCard
              label="صافي المبلغ"
              value={formatAmount(selectedSettlement.netAmount)}
              highlight
            />
          </Box>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent>
          <Typography variant="h6">الخط الزمني</Typography>
          <Divider sx={{ my: 2 }} />

          <SettlementTimeline items={timeline} />
        </CardContent>
      </Card>
    </Stack>
  )
}

function InfoCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value?: string | null
  highlight?: boolean
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant={highlight ? 'h6' : 'body1'}
        fontWeight={highlight ? 700 : 500}
        color={highlight ? 'primary' : 'text.primary'}
      >
        {value || '—'}
      </Typography>
    </Box>
  )
}
