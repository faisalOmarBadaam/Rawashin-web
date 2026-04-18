'use client'

import { useEffect, useMemo, useState } from 'react'

import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

import GenericDialog from '@/components/dialogs/GenericDialog'

import { PaymentMethod } from '@/types/api/settlements'

export type CompleteSettlementPayload = {
  method: PaymentMethod
  paymentReference: string
  adminNote?: string
}

export type CompleteSettlementDialogProps = {
  open: boolean
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: CompleteSettlementPayload) => void
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: 'نقدًا',
  [PaymentMethod.BankTransfer]: 'تحويل بنكي',
  [PaymentMethod.Check]: 'شيك',
  [PaymentMethod.InternalTransfer]: 'تحويل داخلي'
}

export default function CompleteSettlementDialog({
  open,
  loading = false,
  onClose,
  onSubmit
}: CompleteSettlementDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.Cash)
  const [paymentReference, setPaymentReference] = useState('')
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    if (open) {
      setMethod(PaymentMethod.Cash)
      setPaymentReference('')
      setAdminNote('')
    }
  }, [open])

  const methodOptions = useMemo(
    () =>
      Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
        value: Number(value) as PaymentMethod,
        label
      })),
    []
  )

  const canSubmit = paymentReference.trim().length > 0

  return (
    <GenericDialog
      open={open}
      title="إكمال التسوية"
      submitText="إكمال"
      cancelText="إلغاء"
      loading={loading}
      submitDisabled={!canSubmit}
      onClose={onClose}
      onSubmit={() => {
        if (!canSubmit) return
        onSubmit({
          method,
          paymentReference: paymentReference.trim(),
          adminNote: adminNote.trim() || undefined
        })
      }}
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          أدخل تفاصيل الدفع لإكمال التسوية.
        </Typography>
        <TextField
          select
          fullWidth
          label="طريقة الدفع"
          value={method}
          onChange={e => setMethod(Number(e.target.value) as PaymentMethod)}
        >
          {methodOptions.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="مرجع الدفع"
          value={paymentReference}
          onChange={e => setPaymentReference(e.target.value)}
          error={!canSubmit && paymentReference.length > 0}
          helperText={!canSubmit && paymentReference.length > 0 ? 'مرجع الدفع مطلوب' : ' '}
        />
        <TextField
          fullWidth
          label="ملاحظة إدارية (اختياري)"
          value={adminNote}
          onChange={e => setAdminNote(e.target.value)}
          multiline
          rows={3}
        />
        {!canSubmit && (
          <Typography variant="caption" color="text.secondary">
            يجب إدخال مرجع الدفع قبل الإكمال.
          </Typography>
        )}
      </Stack>
    </GenericDialog>
  )
}
