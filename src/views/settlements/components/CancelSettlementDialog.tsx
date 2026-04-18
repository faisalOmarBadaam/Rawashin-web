'use client'

import { useEffect, useState } from 'react'

import TextField from '@mui/material/TextField'

import AlertDialog from '@/components/dialogs/AlertDialog'

export type CancelSettlementDialogProps = {
  open: boolean
  loading?: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

export default function CancelSettlementDialog({
  open,
  loading = false,
  onClose,
  onConfirm
}: CancelSettlementDialogProps) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) {
      setReason('')
    }
  }, [open])

  const isValidReason = reason.trim().length > 0

  return (
    <AlertDialog
      open={open}
      title="إغلاق التسوية بدون إتمام"
      confirmText="تأكيد الإغلاق"
      cancelText="تراجع"
      loading={loading}
      confirmDisabled={!isValidReason}
      onClose={onClose}
      onConfirm={() => {
        if (!isValidReason) return
        onConfirm(reason.trim())
      }}
      description={
        <TextField
          fullWidth
          label="سبب الإغلاق (مطلوب)"
          value={reason}
          onChange={e => setReason(e.target.value)}
          multiline
          rows={3}
          error={!isValidReason && reason.length > 0}
          helperText={!isValidReason && reason.length > 0 ? 'سبب الإغلاق مطلوب' : ' '}
        />
      }
    />
  )
}
