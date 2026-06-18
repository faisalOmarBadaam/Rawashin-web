import { useCallback, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Tooltip from '@mui/material/Tooltip'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import LockResetIcon from '@mui/icons-material/LockReset'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import FormDialog from '../../../shared/components/ui/FormDialog'
import type { FormDialogField } from '../../../shared/components/ui/FormDialog'

type ResetPasswordValues = {
  password: string
  confirmPassword: string
}

type ResetPasswordFormValues = {
  username: string
  password: string
  confirmPassword: string
}

type ResetPasswordDialogProps = {
  open: boolean
  username: string
  loading?: boolean
  errorMessage?: string
  onClose: () => void
  onSave: (values: ResetPasswordValues) => Promise<void> | void
}

const passwordCharacters =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'

function generatePassword(length = 12) {
  const values = new Uint32Array(length)

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values)

    return Array.from(values)
      .map((value) => passwordCharacters[value % passwordCharacters.length])
      .join('')
  }

  return Array.from({ length })
    .map(
      () =>
        passwordCharacters[
          Math.floor(Math.random() * passwordCharacters.length)
        ]
    )
    .join('')
}

export default function ResetPasswordDialog({
  open,
  username,
  loading = false,
  errorMessage,
  onClose,
  onSave,
}: ResetPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  const initialValues = useMemo<ResetPasswordFormValues>(
    () => ({
      username,
      password: '',
      confirmPassword: '',
    }),
    [username]
  )

  const handleCopyPassword = useCallback(async (password: string) => {
    if (!password || !globalThis.navigator?.clipboard) return

    await globalThis.navigator.clipboard.writeText(password)
    setCopied(true)
  }, [])

  const fields = useMemo<FormDialogField<ResetPasswordFormValues>[]>(
    () => [
      {
        name: 'username',
        label: 'اسم المستخدم',
        disabled: true,
        shrink: true,
      },
      {
        kind: 'custom',
        id: 'generate-password',
        render: ({ setValues, setTouched, loading }) => (
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              const generatedPassword = generatePassword()

              setValues((previous) => ({
                ...previous,
                password: generatedPassword,
                confirmPassword: generatedPassword,
              }))

              setTouched((previous) => ({
                ...previous,
                password: false,
                confirmPassword: false,
              }))

              setCopied(false)
            }}
            disabled={loading}
            sx={{
              minHeight: 44,
              fontWeight: 700,
            }}
          >
            توليد كلمة مرور
          </Button>
        ),
      },
      {
        name: 'password',
        label: 'كلمة المرور الجديدة',
        fieldType: showPassword ? 'text' : 'password',
        autoComplete: 'new-password',
        required: 'كلمة المرور مطلوبة',
        reserveHelperTextSpace: true,
        validate: (value) => {
          if (value.length < 8) {
            return 'كلمة المرور يجب ألا تقل عن 8 أحرف'
          }

          return undefined
        },
        onValueChange: () => {
          setCopied(false)
        },
        renderEndAdornment: ({ values, loading }) => (
          <InputAdornment position="end">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Tooltip title={showPassword ? 'إخفاء' : 'إظهار'}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={loading}
                    aria-label={showPassword ? 'إخفاء' : 'إظهار'}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={copied ? 'تم النسخ' : 'نسخ'}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyPassword(values.password)}
                    disabled={!values.password || loading}
                    aria-label="نسخ كلمة المرور"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </InputAdornment>
        ),
      },
      {
        name: 'confirmPassword',
        label: 'تأكيد كلمة المرور',
        fieldType: showPassword ? 'text' : 'password',
        autoComplete: 'new-password',
        required: 'تأكيد كلمة المرور مطلوب',
        reserveHelperTextSpace: true,
        validate: (value, values) => {
          if (value !== values.password) {
            return 'كلمة المرور غير متطابقة'
          }

          return undefined
        },
      },
    ],
    [showPassword, copied, handleCopyPassword]
  )

  return (
    <FormDialog
      open={open}
      title="إعادة تعيين كلمة المرور"
      description="أدخل كلمة مرور جديدة للمستخدم"
      icon={<LockResetIcon fontSize="small" />}
      initialValues={initialValues}
      fields={fields}
      loading={loading}
      errorMessage={errorMessage}
      submitLabel="حفظ"
      loadingLabel="جاري الحفظ..."
      cancelLabel="إلغاء"
      resetKey={username}
      onClose={onClose}
      onSubmit={async (values) => {
        await onSave({
          password: values.password,
          confirmPassword: values.confirmPassword,
        })
      }}
    />
  )
}