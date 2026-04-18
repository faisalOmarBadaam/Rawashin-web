'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import GenericDialog from '@/components/dialogs/GenericDialog'
import type { SettlementDto } from '@/types/api/settlements'

export type ProcessSettlementDialogProps = {
  open: boolean
  loading?: boolean
  settlement: SettlementDto
  onClose: () => void
  onSubmit: () => void
}

export default function ProcessSettlementDialog({
  open,
  loading = false,
  settlement,
  onClose,
  onSubmit,
}: ProcessSettlementDialogProps) {
  return (
    <GenericDialog
      open={open}
      title="بدء معالجة التسوية"
      submitText="بدء المعالجة"
      cancelText="إلغاء"
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          ملخص أمر الصرف
        </Typography>

        <Stack spacing={1}>
          {/* <InfoRow label="رقم التسوية" value={String(settlement.id)} /> */}
          <InfoRow label="اسم نقطة البيع" value={settlement.clientName || '—'} />
          <InfoRow label="إجمالي المبلغ" value={formatAmount(settlement.grossAmount)} />
          <InfoRow label="قيمة العمولة" value={formatAmount(settlement.commissionAmount)} />
          <InfoRow label="صافي مبلغ التسوية" value={formatAmount(settlement.netAmount)} highlight />
        </Stack>

        <Typography variant="caption" color="text.secondary">
          سيتم تحديث قيم العمولة والصافي بعد بدء المعالجة وفقًا لسياسات النظام.
        </Typography>
      </Stack>
    </GenericDialog>
  )
}

const formatAmount = (amount?: number | null) =>
  amount === null || amount === undefined ? '—' : amount.toLocaleString()

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="baseline">
      <Typography variant="body2" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant={highlight ? 'h6' : 'body1'} fontWeight={highlight ? 700 : 500}>
        {value}
      </Typography>
    </Box>
  )
}
