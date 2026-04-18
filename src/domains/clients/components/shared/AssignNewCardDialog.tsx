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
import { useClientsStore } from '@/contexts/clients/clients.store'

type Props = {
  clientId: string
  clientName: string
  onClose: () => void
  open: boolean
}

const formatCardNumberGrouped = (input: string) => {
  const digits = String(input ?? '')
    .replace(/\D/g, '')
    .slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

const assignCardSchema = z.object({
  customCardNumber: z
    .string()
    .min(1, 'رقم الكرت مطلوب')
    .transform(v => v.replace(/\s/g, ''))
    .refine(v => /^\d+$/.test(v), 'رقم الكرت يجب أن يكون أرقام فقط')
    .refine(v => v.length === 16, 'رقم الكرت يجب أن يكون 16 رقم'),
})

type FormInputs = {
  customCardNumber: string
}
type AssignCardValues = z.output<typeof assignCardSchema>

const AssignNewCardDialog = ({ open, onClose, clientId, clientName }: Props) => {
  const { assignCard, fetchClients } = useClientsStore()

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormInputs, any, AssignCardValues>({
    resolver: zodResolver(assignCardSchema),
    mode: 'onChange',
    defaultValues: {
      customCardNumber: '',
    },
  })

  const { loading, confirmOpen, requestConfirm, cancelConfirm, closeFlow, confirmAndRun } =
    useDialogConfirmFlow({
      onClose,
      onReset: () => reset({ customCardNumber: '' }),
    })

  const submitDisabled = useMemo(() => loading || !isValid, [loading, isValid])

  const confirmAssign = async (values: AssignCardValues) => {
    await confirmAndRun(async () => {
      try {
        await assignCard(clientId, values.customCardNumber)

        await fetchClients() // ⭐ تحديث البيانات

        toast.success('تم تحديث رقم الكرت بنجاح')
      } catch (e) {
        console.error(e)
        toast.error(getErrorMessage(e, 'فشلت العملية'))
        throw e
      }
    })
  }

  return (
    <>
      <GenericDialog
        open={open && !confirmOpen}
        title="تحديث رقم الكرت للمستفيد"
        onClose={closeFlow}
        onSubmit={handleSubmit(requestConfirm)}
        submitText="حفظ"
        loading={loading}
        submitDisabled={submitDisabled}
        maxWidth="sm"
      >
        <Box className="flex flex-col gap-4" dir="rtl">
          <TextField label="اسم المستفيد" fullWidth disabled value={clientName ?? ''} />

          <Controller
            name="customCardNumber"
            control={control}
            render={({ field }) => (
              <TextField
                label="رقم الكرت الجديد"
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                fullWidth
                error={Boolean(errors.customCardNumber)}
                helperText={errors.customCardNumber?.message}
                value={field.value ?? ''}
                onChange={e => field.onChange(formatCardNumberGrouped(e.target.value))}
                slotProps={{
                  htmlInput: {
                    dir: 'ltr',
                    style: { textAlign: 'left' },
                  },
                }}
              />
            )}
          />
        </Box>
      </GenericDialog>

      <AlertDialog
        open={confirmOpen}
        title="تأكيد تحديث رقم الكرت"
        description={
          <Box dir="rtl" className="flex flex-col gap-2">
            <div>
              هل أنت متأكد من تحديث رقم الكرت للمستفيد: <b>{clientName}</b>؟
            </div>
            <div>
              رقم الكرت الجديد:{' '}
              <Box
                component="span"
                dir="ltr"
                sx={{
                  unicodeBidi: 'bidi-override',
                  display: 'inline-block',
                }}
              >
                {`\u200E${formatCardNumberGrouped(getValues('customCardNumber') || '')}\u200E`}
              </Box>
            </div>
          </Box>
        }
        confirmText="تأكيد"
        cancelText="إلغاء"
        loading={loading}
        onClose={cancelConfirm}
        onConfirm={handleSubmit(confirmAssign)}
      />
    </>
  )
}

export default AssignNewCardDialog
