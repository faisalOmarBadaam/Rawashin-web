'use client'

import { useMemo, useState } from 'react'

import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  LinearProgress,
  Typography,
  Button
} from '@mui/material'

import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'

import GenericDialog from '@/components/dialogs/GenericDialog'
import AlertDialog from '@/components/dialogs/AlertDialog'
import { AuthApi } from '@/libs/api/modules/auth.api'

type Props = {
  clientId: string
  clientName: string
  open: boolean
  onClose: () => void
}

const resetPasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z.string().min(8),
    confirmPassword: z.string()
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'كلمتا المرور غير متطابقتين'
  })

type FormInputs = {
  oldPassword: string
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

const AdminResetPasswordDialog = ({
  open,
  onClose,
  clientId,
  clientName
}: Props) => {
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<FormInputs>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const password = watch('newPassword')

  const strength = useMemo(
    () => getPasswordStrength(password || ''),
    [password]
  )

  const submitDisabled = useMemo(
    () => loading || !isValid,
    [loading, isValid]
  )

  const handleClose = () => {
    if (loading) return
    setConfirmOpen(false)
    reset()
    onClose()
  }

  const confirmReset = async (values: FormInputs) => {
  setLoading(true)
  try {
    await AuthApi.resetPassword({
      userId: clientId,
      oldPassword: values.oldPassword,
      newPassword: values.newPassword
    })

    toast.success('تم تغيير كلمة المرور بنجاح')
    handleClose()
  } catch (err: any) {
    const apiError =
      err?.response?.data ||
      err?.response ||
      err

    const message =
      apiError?.detail ||
      apiError?.title ||
      'فشلت عملية تغيير كلمة المرور'

    toast.error(message)
  } finally {
    setLoading(false)
  }
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
        title='تغيير كلمة المرور'
        onClose={handleClose}
        onSubmit={handleSubmit(() => setConfirmOpen(true))}
        submitText='حفظ'
        loading={loading}
        submitDisabled={submitDisabled}
        maxWidth='sm'
      >
        <Box className='flex flex-col gap-4' dir='rtl'>
          <TextField
            label='اسم المستخدم'
            fullWidth
            disabled
            value={clientName}
          />

          <Controller
            name='oldPassword'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type='password'
                label='كلمة المرور الحالية'
                fullWidth
                error={Boolean(errors.oldPassword)}
                helperText={errors.oldPassword?.message}
              />
            )}
          />

          <Button
            variant='outlined'
            onClick={() => {
              const pwd = generatePassword()
              setValue('newPassword', pwd, { shouldValidate: true })
              setValue('confirmPassword', pwd, { shouldValidate: true })
            }}
          >
            توليد كلمة مرور
          </Button>

          <Controller
            name='newPassword'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type={isPasswordShown ? 'text' : 'password'}
                label='كلمة المرور الجديدة'
                fullWidth
                error={Boolean(errors.newPassword)}
                helperText={errors.newPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={copyPassword}>
                        <i className='ri-file-copy-line' />
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          setIsPasswordShown(prev => !prev)
                        }
                      >
                        <i
                          className={
                            isPasswordShown
                              ? 'ri-eye-off-line'
                              : 'ri-eye-line'
                          }
                        />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />

          {password && (
            <Box>
              <LinearProgress
                variant='determinate'
                value={strength.value}
              />
              <Typography variant='caption'>
                قوة كلمة المرور: {strength.label}
              </Typography>
            </Box>
          )}

          <Controller
            name='confirmPassword'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type={isPasswordShown ? 'text' : 'password'}
                label='تأكيد كلمة المرور'
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
        title='تأكيد تغيير كلمة المرور'
        description={
          <Box>
            هل أنت متأكد من تغيير كلمة المرور للمستخدم{' '}
            <b>{clientName}</b>؟
          </Box>
        }
        confirmText='تأكيد'
        cancelText='إلغاء'
        loading={loading}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit(confirmReset)}
      />
    </>
  )
}

export default AdminResetPasswordDialog
