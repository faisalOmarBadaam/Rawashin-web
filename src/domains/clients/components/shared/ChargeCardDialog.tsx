'use client'

import { useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Box, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { getErrorMessage } from '@/libs/api/getErrorMessage'

import AlertDialog from '@/components/dialogs/AlertDialog'
import GenericDialog from '@/components/dialogs/GenericDialog'
import useDialogConfirmFlow from '@/components/dialogs/useDialogConfirmFlow'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'

type Props = {
  CardNumber: string
  clientName: string
  onClose: () => void
  open: boolean
}

const formatCardNumberGrouped = (input: string) => {
  const digits = input.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

const chargeCardSchema = z.object({
  amount: z
    .number('الحقل مطلوب')
    .refine(n => Number.isFinite(n), 'أدخل مبلغ صحيح')
    .refine(n => n > 0, 'يجب أن يكون المبلغ أكبر من صفر'),
})

type ChargeCardFormValues = z.infer<typeof chargeCardSchema>
type FormInputs = { amount: number }

const ChargeCardDialog = ({ open, onClose, CardNumber, clientName }: Props) => {
  const { chargeCreditAccount } = useTransactionsStore()

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormInputs, any, ChargeCardFormValues>({
    resolver: zodResolver(chargeCardSchema),
    mode: 'onChange',
    defaultValues: {
      amount: undefined as unknown as number,
    },
  })

  const { loading, confirmOpen, requestConfirm, cancelConfirm, closeFlow, confirmAndRun } =
    useDialogConfirmFlow({
      onClose,
      onReset: () => reset(),
    })

  const submitDisabled = useMemo(() => loading || !isValid, [loading, isValid])

  const doCharge = async () => {
    await confirmAndRun(async () => {
      try {
        const { amount } = getValues()
        const payload = { phoneNumber: CardNumber, amount }

        await chargeCreditAccount(payload)

        toast.success('تم شحن الحساب بنجاح')
      } catch (e) {
        console.error(e)
        toast.error(getErrorMessage(e, 'فشلت عملية الشحن'))
        throw e
      }
    })
  }

  return (
    <>
      {/* الحل الأول: لا تفتح Dialogين معاً */}
      <GenericDialog
        open={open && !confirmOpen}
        title="شحن رصيد لمستفيد"
        onClose={closeFlow}
        onSubmit={handleSubmit(requestConfirm)}
        submitText="شحن"
        loading={loading}
        submitDisabled={submitDisabled}
        maxWidth="sm"
      >
        <Box className="flex flex-col gap-4" dir="rtl">
          <TextField label="اسم المستفيد" fullWidth disabled value={clientName} />

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextField
                label="مقدار الشحن"
                type="number"
                placeholder="مثال: 100"
                inputMode="decimal"
                fullWidth
                error={Boolean(errors.amount)}
                helperText={errors.amount?.message}
                value={Number.isFinite(field.value) ? field.value : ''}
                onChange={e => {
                  const v = e.target.value
                  field.onChange(v === '' ? undefined : Number(v))
                }}
              />
            )}
          />
        </Box>
      </GenericDialog>

      <AlertDialog
        open={confirmOpen}
        title="تأكيد عملية الشحن"
        description={
          <Box dir="rtl" className="flex flex-col gap-2">
            <div>
              المستفيد: <b>{clientName}</b>
            </div>
            <div>
              هل أنت متأكد من شحن الحساب رقم: <b>{formatCardNumberGrouped(CardNumber)}</b>؟
            </div>
            <div>
              المبلغ: <b>{Number(getValues('amount') || 0).toLocaleString()}</b>
            </div>
          </Box>
        }
        confirmText="تأكيد الشحن"
        cancelText="إلغاء"
        loading={loading}
        onClose={cancelConfirm}
        onConfirm={doCharge}
      />
    </>
  )
}

export default ChargeCardDialog
