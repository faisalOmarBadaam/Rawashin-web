'use client'

import { useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Box, TextField, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import AlertDialog from '@/components/dialogs/AlertDialog'
import GenericDialog from '@/components/dialogs/GenericDialog'
import useDialogConfirmFlow from '@/components/dialogs/useDialogConfirmFlow'
import { AppRole } from '@/configs/roles'
import { useAuthStore } from '@/contexts/auth/auth.store'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'
import { getErrorMessage } from '@/libs/api/getErrorMessage'
import { hasRole } from '@/utils/rbac'

type Props = {
  clientId: string
  clientName: string
  open: boolean
  onClose: () => void
}

const refillSchema = z.object({
  amount: z
    .number()
    .refine(v => !Number.isNaN(v), {
      message: 'المبلغ مطلوب',
    })
    .refine(v => v > 0, {
      message: 'المبلغ يجب أن يكون أكبر من صفر',
    }),
})

type FormInputs = z.input<typeof refillSchema>
type RefillValues = z.output<typeof refillSchema>

const RefillChargerDialog = ({ open, onClose, clientId, clientName }: Props) => {
  const { refillCharger } = useTransactionsStore()
  const session = useAuthStore(s => s.session)

  const isAdmin = useMemo(() => hasRole(session?.roles || [], AppRole.Admin), [session?.roles])

  const chargerId = clientId
  const chargerName = clientName

  const adminLiquidityId = session?.userId ?? ''
  const adminName = session?.name ?? session?.email ?? '—'

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormInputs, any, RefillValues>({
    resolver: zodResolver(refillSchema),
    mode: 'onChange',
    defaultValues: {
      amount: 0,
    },
  })

  const { loading, confirmOpen, requestConfirm, cancelConfirm, closeFlow, confirmAndRun } =
    useDialogConfirmFlow({
      onClose,
      onReset: () => reset(),
    })

  const submitDisabled = useMemo(() => loading || !isValid, [loading, isValid])

  const requestConfirmWithGuard = () => {
    if (!isAdmin) {
      toast.error('غير مصرح لك بتنفيذ هذه العملية')
      return
    }
    requestConfirm()
  }

  const confirmRefill = async (values: RefillValues) => {
    if (!isAdmin) {
      toast.error('غير مصرح لك بتنفيذ هذه العملية')
      return
    }

    if (!adminLiquidityId) {
      toast.error('تعذر تحديد حساب الادارة')
      return
    }

    await confirmAndRun(async () => {
      try {
        await refillCharger(chargerId, values.amount, adminLiquidityId)

        toast.success('تمت العملية بنجاح')
      } catch (e) {
        toast.error(getErrorMessage(e, 'فشلت العملية حاول مرة اخرى'))
        throw e
      }
    })
  }

  if (!isAdmin && open) {
    return (
      <AlertDialog
        open={open}
        title="غير مصرح"
        description={<Typography dir="rtl">هذه العملية متاحة فقط لادارة رواشن</Typography>}
        confirmText="إغلاق"
        cancelText=""
        onConfirm={onClose}
        onClose={onClose}
      />
    )
  }

  return (
    <>
      <GenericDialog
        open={open && !confirmOpen}
        title="اضافة رصيد"
        onClose={closeFlow}
        onSubmit={handleSubmit(requestConfirmWithGuard)}
        submitText="شحن"
        loading={loading}
        submitDisabled={submitDisabled}
        maxWidth="sm"
      >
        <Box dir="rtl" className="flex flex-col gap-4">
          <TextField label="اسم الحساب" value={chargerName} fullWidth disabled />

          <TextField label="من حساب" value={adminName} fullWidth disabled />

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
        </Box>
      </GenericDialog>

      <AlertDialog
        open={confirmOpen}
        title="تأكيد اضافة رصيد"
        description={
          <Box dir="rtl" className="flex flex-col gap-2">
            <div>
              اسم الحساب: <b>{chargerName}</b>
            </div>
            <div>
              بواسطة: <b>{adminName}</b>
            </div>
            <div>
              المبلغ: <b>{getValues('amount')}</b>
            </div>
          </Box>
        }
        confirmText="تأكيد"
        cancelText="إلغاء"
        loading={loading}
        onClose={cancelConfirm}
        onConfirm={handleSubmit(confirmRefill)}
      />
    </>
  )
}

export default RefillChargerDialog
