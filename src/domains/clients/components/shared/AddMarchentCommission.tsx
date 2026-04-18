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
  open: boolean
  onClose: () => void
}

const commissionSchema = z.object({
  commissionRate: z
    .number()
    .refine(v => !Number.isNaN(v), {
      message: 'النسبة مطلوبة',
    })
    .refine(v => v >= 0 && v <= 100, {
      message: 'النسبة يجب أن تكون بين 0 و 100',
    }),

  commissionDate: z.string().min(1, 'تاريخ العمولة مطلوب'),

  description: z.string().optional().nullable(),
})

type FormInputs = z.input<typeof commissionSchema>
type CommissionValues = z.output<typeof commissionSchema>

const CreateCommissionDialog = ({ open, onClose, clientId, clientName }: Props) => {
  const { createCommission } = useClientsStore()

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormInputs, any, CommissionValues>({
    resolver: zodResolver(commissionSchema),
    mode: 'onChange',
    defaultValues: {
      commissionRate: 0,
      commissionDate: '',
      description: '',
    },
  })

  const { loading, confirmOpen, requestConfirm, cancelConfirm, closeFlow, confirmAndRun } =
    useDialogConfirmFlow({
      onClose,
      onReset: () => reset(),
    })

  const submitDisabled = useMemo(() => loading || !isValid, [loading, isValid])

  const confirmCreate = async (values: CommissionValues) => {
    await confirmAndRun(async () => {
      try {
        await createCommission(clientId, {
          ...values,
        })

        toast.success('تم إضافة العمولة بنجاح')
      } catch (e) {
        console.error(e)
        toast.error(getErrorMessage(e, 'فشلت عملية إضافة العمولة'))
        throw e
      }
    })
  }

  return (
    <>
      <GenericDialog
        open={open && !confirmOpen}
        title="إضافة عمولة"
        onClose={closeFlow}
        onSubmit={handleSubmit(requestConfirm)}
        submitText="حفظ"
        loading={loading}
        submitDisabled={submitDisabled}
        maxWidth="sm"
      >
        <Box dir="rtl" className="flex flex-col gap-4">
          <TextField label="نقطة البيع" value={clientName} fullWidth disabled />

          <Controller
            name="commissionRate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={
                  typeof field.value === 'number' && !Number.isNaN(field.value) ? field.value : ''
                }
                type="number"
                label="نسبة العمولة (%)"
                fullWidth
                error={!!errors.commissionRate}
                helperText={errors.commissionRate?.message}
                onChange={e => {
                  const next = e.target.value

                  field.onChange(next === '' ? Number.NaN : Number(next))
                }}
              />
            )}
          />

          <Controller
            name="commissionDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                type="date"
                label="تاريخ العمولة"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.commissionDate}
                helperText={errors.commissionDate?.message}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="الوصف"
                fullWidth
                multiline
                minRows={2}
              />
            )}
          />
        </Box>
      </GenericDialog>

      <AlertDialog
        open={confirmOpen}
        title="تأكيد إضافة العمولة"
        description={
          <Box dir="rtl" className="flex flex-col gap-2">
            <div>
              نقطة البيع: <b>{clientName}</b>
            </div>

            <div>
              النسبة: <b>{getValues('commissionRate')}%</b>
            </div>
            <div>
              التاريخ: <b>{getValues('commissionDate')}</b>
            </div>
          </Box>
        }
        confirmText="تأكيد"
        cancelText="إلغاء"
        loading={loading}
        onClose={cancelConfirm}
        onConfirm={handleSubmit(confirmCreate)}
      />
    </>
  )
}

export default CreateCommissionDialog
