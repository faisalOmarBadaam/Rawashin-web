'use client'

import { useMemo, useState } from 'react'

import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { getErrorMessage } from '@/libs/api/getErrorMessage'

import AlertDialog from '@/components/dialogs/AlertDialog'
import GenericDialog from '@/components/dialogs/GenericDialog'
import useDialogConfirmFlow from '@/components/dialogs/useDialogConfirmFlow'
import { useRegisterStore } from '@/contexts/clients/register.store'

type Props = {
  clientId: string
  clientName: string
  open: boolean
  onClose: () => void
}

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'كلمتا المرور غير متطابقتين',
  })

type FormInputs = {
  newPassword: string
  confirmPassword: string
}

const generatePassword = (length = 10) => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const all = upper + lower + numbers

  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    numbers[Math.floor(Math.random() * numbers.length)]

  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  return password
}

const getPasswordStrength = (password: string) => {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { label: 'ضعيفة', value: 25 }
  if (score === 2) return { label: 'متوسطة', value: 50 }
  if (score === 3) return { label: 'جيدة', value: 75 }
  return { label: 'قوية', value: 100 }
}

const AdminResetPasswordDialog = ({ open, onClose, clientId, clientName }: Props) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const { adminResetPassword } = useRegisterStore()

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormInputs>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const { loading, confirmOpen, closeFlow, cancelConfirm, setConfirmOpen, confirmAndRun } =
    useDialogConfirmFlow({
      onClose,
      onReset: () => reset(),
    })

  const password = watch('newPassword')
  const strength = useMemo(() => getPasswordStrength(password || ''), [password])

  const submitDisabled = useMemo(() => loading || !isValid, [loading, isValid])

  const handleClose = () => {
    closeFlow()
  }

  const confirmReset = async (values: FormInputs) => {
    await confirmAndRun(async () => {
      try {
        await adminResetPassword(clientId, {
          newPassword: values.newPassword,
        })
        toast.success('تم إعادة تعيين كلمة المرور بنجاح')
      } catch (error) {
        toast.error(getErrorMessage(error, 'فشلت عملية إعادة تعيين كلمة المرور'))
        throw error
      }
    })
  }

  const copyPassword = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    toast.success('تم نسخ كلمة المرور')
  }

  return (
    <>
      <GenericDialog
        open={open && !confirmOpen}
        title="إعادة تعيين كلمة المرور"
        onClose={handleClose}
        onSubmit={handleSubmit(() => setConfirmOpen(true))}
        submitText="حفظ"
        loading={loading}
        submitDisabled={submitDisabled}
        maxWidth="sm"
      >
        <Box className="flex flex-col gap-4" dir="rtl">
          <TextField label="اسم المستخدم" fullWidth disabled value={clientName} />

          <Button
            variant="outlined"
            onClick={() => {
              const pwd = generatePassword()
              setValue('newPassword', pwd, { shouldValidate: true })
              setValue('confirmPassword', pwd, { shouldValidate: true })
            }}
          >
            توليد كلمة مرور
          </Button>

          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type={isPasswordShown ? 'text' : 'password'}
                label="كلمة المرور الجديدة"
                fullWidth
                error={Boolean(errors.newPassword)}
                helperText={errors.newPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={copyPassword}>
                        <i className="ri-file-copy-line" />
                      </IconButton>
                      <IconButton onClick={() => setIsPasswordShown(prev => !prev)}>
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {password && (
            <Box>
              <LinearProgress variant="determinate" value={strength.value} />
              <Typography variant="caption">قوة كلمة المرور: {strength.label}</Typography>
            </Box>
          )}

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type={isPasswordShown ? 'text' : 'password'}
                label="تأكيد كلمة المرور"
                fullWidth
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword?.message}
              />
            )}
          />
        </Box>
      </GenericDialog>

      <AlertDialog
        open={confirmOpen}
        title="تأكيد إعادة تعيين كلمة المرور"
        description={
          <Box>
            هل أنت متأكد من إعادة تعيين كلمة المرور للمستخدم <b>{clientName}</b>؟
          </Box>
        }
        confirmText="تأكيد"
        cancelText="إلغاء"
        loading={loading}
        onClose={cancelConfirm}
        onConfirm={handleSubmit(confirmReset)}
      />
    </>
  )
}

export default AdminResetPasswordDialog
