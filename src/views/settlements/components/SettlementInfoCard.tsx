'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { SettlementDto } from '@/types/api/settlements'
import { PaymentMethod } from '@/types/api/settlements'

import { getSettlementStatusLabel } from './SettlementStatusChip'

type Props = {
  settlement: SettlementDto
}

export default function SettlementInfoCard({ settlement }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">معلومات التسوية</Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={3}>
          <Row
            left={<Info label="اسم نقطة البيع" value={settlement.clientName} />}
            right={<Info label="الحالة" value={getSettlementStatusLabel(settlement.status)} />}
          />

          <Row
            left={<Info label="المبلغ الإجمالي" value={formatAmount(settlement.grossAmount)} />}
            right={<Info label="نسبة العمولة" value={`${settlement.commissionPercentage}%`} />}
          />

          <Row
            left={<Info label="قيمة العمولة" value={formatAmount(settlement.commissionAmount)} />}
            right={<Info label="المبلغ الصافي" value={formatAmount(settlement.netAmount)} />}
          />

          <Row
            left={<Info label="تاريخ الطلب" value={formatDate(settlement.requestedAt)} />}
            right={<Info label="تاريخ التسوية" value={formatDate(settlement.settlementDate)} />}
          />

          {settlement.processingStartedAt && (
            <Info label="تاريخ بدء المعالجة" value={formatDate(settlement.processingStartedAt)} />
          )}

          {settlement.completedAt && (
            <Info label="تاريخ الإكمال" value={formatDate(settlement.completedAt)} />
          )}

          {settlement.method && (
            <Info label="طريقة الدفع" value={resolvePaymentMethod(settlement.method)} />
          )}

          {settlement.paymentReference && (
            <Info label="مرجع الدفع" value={settlement.paymentReference} />
          )}

          {settlement.description && <Info label="الوصف" value={settlement.description} />}

          {settlement.adminNote && <Info label="ملاحظة إدارية" value={settlement.adminNote} />}
        </Stack>
      </CardContent>
    </Card>
  )
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      <Box flex={1}>{left}</Box>
      <Box flex={1}>{right}</Box>
    </Stack>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value || '—'}</Typography>
    </Stack>
  )
}

function formatDate(date?: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleString()
}

function formatAmount(amount?: number | null) {
  if (amount === undefined || amount === null) return '—'
  return amount.toLocaleString()
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  [PaymentMethod.Cash]: 'نقدًا',
  [PaymentMethod.BankTransfer]: 'تحويل بنكي',
  [PaymentMethod.Check]: 'شيك',
  [PaymentMethod.InternalTransfer]: 'تحويل داخلي',
  cash: 'نقدًا',
  banktransfer: 'تحويل بنكي',
  bank_transfer: 'تحويل بنكي',
  check: 'شيك',
  internaltransfer: 'تحويل داخلي',
  internal_transfer: 'تحويل داخلي',
}

const resolvePaymentMethod = (method?: string | number | null) => {
  if (method === null || method === undefined) return '—'

  const key = typeof method === 'number' ? method.toString() : method.toString().toLowerCase()
  return PAYMENT_METHOD_LABELS[key] ?? method.toString()
}
