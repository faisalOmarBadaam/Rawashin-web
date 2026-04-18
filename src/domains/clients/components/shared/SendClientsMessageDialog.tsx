'use client'

import { useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Box, TextField } from '@mui/material'

import { toast } from 'react-toastify'

import GenericDialog from '@/components/dialogs/GenericDialog'
import { useNotificationsStore } from '@/contexts/notifications/notifications.store'

const schema = z.object({
  title: z.string().trim().min(2, 'يرجى كتابة عنوان الرسالة'),
  message: z.string().trim().min(5, 'يرجى كتابة نص الرسالة'),
})

type FormValues = z.infer<typeof schema>

type Props = {
  open: boolean
  onClose: () => void
  onSent?: (payload: { title: string; body: string }) => Promise<void> | void
}

export default function SendClientsMessageDialog({ open, onClose, onSent }: Props) {
  const [localLoading, setLocalLoading] = useState(false)
  const { sendToAll, sendingToAll } = useNotificationsStore()

  const loading = localLoading || sendingToAll

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      message: '',
    },
  })

  const submitDisabled = useMemo(() => loading || !isValid, [loading, isValid])

  const close = () => {
    if (loading) return
    reset({ title: '', message: '' })
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    try {
      setLocalLoading(true)

      const payload = { title: values.title.trim(), body: values.message.trim() }

      if (onSent) {
        await onSent(payload)
      } else {
        await sendToAll(payload)
      }

      toast.success('تم إرسال الرسالة')
      close()
    } catch (e: any) {
      toast.error(e?.message ?? 'تعذر إرسال الرسالة')
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <GenericDialog
      open={open}
      title="إرسال رسالة لجميع العملاء"
      onClose={close}
      onSubmit={handleSubmit(onSubmit, () => {
        const firstError =
          errors.title?.message || errors.message?.message || 'يرجى التحقق من الحقول المطلوبة'
        toast.warning(String(firstError))
      })}
      submitText="إرسال"
      loading={loading}
      submitDisabled={submitDisabled}
      maxWidth="sm"
    >
      <Box className="flex flex-col gap-4" dir="rtl">
        <Box>
          <Box className="flex items-center gap-2" style={{ fontWeight: 700 }}>
            <i className="ri-mail-send-line" />
            رسالة جماعية
          </Box>
          <Box style={{ opacity: 0.8, fontSize: 13, marginTop: 4 }}>
            سيتم إرسال هذه الرسالة لجميع العملاء.
          </Box>
        </Box>

        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="العنوان"
              fullWidth
              size="small"
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
            />
          )}
        />

        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="نص الرسالة"
              placeholder="اكتب نص الرسالة هنا..."
              fullWidth
              multiline
              minRows={5}
              error={Boolean(errors.message)}
              helperText={errors.message?.message}
            />
          )}
        />
      </Box>
    </GenericDialog>
  )
}
