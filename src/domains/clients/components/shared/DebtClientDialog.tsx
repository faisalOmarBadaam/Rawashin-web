'use client'

import { useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Box, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import AlertDialog from '@/components/dialogs/AlertDialog'
import GenericDialog from '@/components/dialogs/GenericDialog'
import useDialogConfirmFlow from '@/components/dialogs/useDialogConfirmFlow'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'
import { getErrorMessage } from '@/libs/api/getErrorMessage'

type Props = {
  phoneNumber: string
  clientId: string
  clientName: string
  onClose: () => void
  onSuccess?: () => void
  open: boolean
}

const debtSchema = z.object({
  amount: z
    .number('الحقل مطلوب')
    .refine(n => Number.isFinite(n), 'أدخل مبلغ صحيح')
    .refine(n => n > 0, 'يجب أن يكون المبلغ أكبر من صفر'),
  note: z.string().max(500, 'الحد الأقصى 500 حرف').optional().nullable(),
})

type DebtFormValues = z.infer<typeof debtSchema>
type FormInputs = { amount: number; note?: string | null }

const DebtClientDialog = ({
  open,
  onClose,
  clientId,
  phoneNumber,
  clientName,
  onSuccess,
}: Props) => {
  const { debtCreditAccount } = useTransactionsStore()

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormInputs, any, DebtFormValues>({
    resolver: zodResolver(debtSchema),
    mode: 'onChange',
    defaultValues: {
      amount: undefined as unknown as number,
      note: '',
    },
  })

  const { loading, confirmOpen, requestConfirm, cancelConfirm, closeFlow, confirmAndRun } =
    useDialogConfirmFlow({
      onClose,
      onReset: () => reset(),
    })

  const submitDisabled = useMemo(
    () => loading || !isValid || !phoneNumber,
    [loading, isValid, phoneNumber],
  )

  const doDebt = async () => {
    await confirmAndRun(async () => {
      try {
        const { amount, note } = getValues()

        await debtCreditAccount(clientId, {
          phoneNumber,
          amount,
          note: note?.trim() ? note.trim() : null,
        })

        toast.success('تم تديين العميل بنجاح')
        onSuccess?.()
      } catch (e) {
        console.error(e)
        toast.error(getErrorMessage(e, 'فشلت عملية التديين'))
        throw e
      }
    })
  }

  return (
    <>
      <GenericDialog
        open={open && !confirmOpen}
        title="تديين العميل"
        onClose={closeFlow}
        onSubmit={handleSubmit(requestConfirm)}
        submitText="تديين"
        loading={loading}
        submitDisabled={submitDisabled}
        maxWidth="sm"
      >
        <Box className="flex flex-col gap-4" dir="rtl">
          <TextField label="اسم العميل" fullWidth disabled value={clientName} />
          <TextField label="رقم الهاتف" fullWidth disabled value={phoneNumber} />

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextField
                label="مبلغ الدين"
                type="number"
                placeholder="مثال: 100"
                inputMode="decimal"
                fullWidth
                error={Boolean(errors.amount)}
                helperText={errors.amount?.message}
                value={Number.isFinite(field.value) ? field.value : ''}
                onChange={e => {
                  const value = e.target.value
                  field.onChange(value === '' ? undefined : Number(value))
                }}
              />
            )}
          />

          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <TextField
                label="ملاحظة"
                fullWidth
                multiline
                minRows={3}
                error={Boolean(errors.note)}
                helperText={errors.note?.message}
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            )}
          />
        </Box>
      </GenericDialog>

      <AlertDialog
        open={confirmOpen}
        title="تأكيد عملية التديين"
        description={
          <Box dir="rtl" className="flex flex-col gap-2">
            <div>
              العميل: <b>{clientName}</b>
            </div>
            <div>
              رقم الهاتف: <b>{phoneNumber}</b>
            </div>
            <div>
              مبلغ الدين: <b>{Number(getValues('amount') || 0).toLocaleString()}</b>
            </div>
          </Box>
        }
        confirmText="تأكيد التديين"
        cancelText="إلغاء"
        loading={loading}
        onClose={cancelConfirm}
        onConfirm={doDebt}
      />
    </>
  )
}

export default DebtClientDialog
