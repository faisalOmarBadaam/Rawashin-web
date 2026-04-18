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
  clientId: string
  clientName: string
  open: boolean
  onClose: () => void
}

const depositSchema = z.object({
  amount: z
    .number()
    .refine(v => !Number.isNaN(v), { message: 'المبلغ مطلوب' })
    .refine(v => v > 0, { message: 'المبلغ يجب أن يكون أكبر من صفر' }),
  note: z.string().optional().nullable(),
})

type FormInputs = z.input<typeof depositSchema>
type DepositValues = z.output<typeof depositSchema>

const DepositDialog = ({ open, onClose, clientId, clientName }: Props) => {
  const { deposit } = useTransactionsStore()

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormInputs, any, DepositValues>({
    resolver: zodResolver(depositSchema),
    mode: 'onChange',
    defaultValues: {
      amount: 0,
      note: '',
    },
  })

  const { loading, confirmOpen, requestConfirm, cancelConfirm, closeFlow, confirmAndRun } =
    useDialogConfirmFlow({
      onClose,
      onReset: () => reset(),
    })

  const submitDisabled = useMemo(() => loading || !isValid, [loading, isValid])

  const confirmDeposit = async (values: DepositValues) => {
    await confirmAndRun(async () => {
      try {
        await deposit(clientId, {
          amount: values.amount,
          note: values.note ?? null,
        })

        toast.success('تمت إضافة الرصيد بنجاح')
      } catch (e) {
        toast.error(getErrorMessage(e, 'فشلت عملية إضافة الرصيد'))
        throw e
      }
    })
  }

  return (
    <>
      <GenericDialog
        open={open && !confirmOpen}
        title="إضافة رصيد"
        onClose={closeFlow}
        onSubmit={handleSubmit(requestConfirm)}
        submitText="إضافة"
        loading={loading}
        submitDisabled={submitDisabled}
        maxWidth="sm"
      >
        <Box dir="rtl" className="flex flex-col gap-4">
          <TextField label="اسم الحساب" value={clientName} fullWidth disabled />

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="المبلغ"
                fullWidth
                error={!!errors.amount}
                helperText={errors.amount?.message}
                onChange={e => field.onChange(Number(e.target.value))}
              />
            )}
          />

          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="ملاحظة" fullWidth multiline minRows={2} />
            )}
          />
        </Box>
      </GenericDialog>

      <AlertDialog
        open={confirmOpen}
        title="تأكيد إضافة الرصيد"
        description={
          <Box dir="rtl" className="flex flex-col gap-2">
            <div>
              العميل: <b>{clientName}</b>
            </div>
            <div>
              المبلغ: <b>{getValues('amount')}</b>
            </div>
            {getValues('note') && (
              <div>
                الملاحظة: <b>{getValues('note')}</b>
              </div>
            )}
          </Box>
        }
        confirmText="تأكيد"
        cancelText="إلغاء"
        loading={loading}
        onClose={cancelConfirm}
        onConfirm={handleSubmit(confirmDeposit)}
      />
    </>
  )
}

export default DepositDialog
