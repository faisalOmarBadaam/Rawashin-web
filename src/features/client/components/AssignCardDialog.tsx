import { useMemo } from 'react'

import CreditCardIcon from '@mui/icons-material/CreditCard'
import InputAdornment from '@mui/material/InputAdornment'

import FormDialog from '../../../shared/components/ui/FormDialog'
import type { FormDialogField } from '../../../shared/components/ui/FormDialog'

type AssignCardFormValues = {
  clientName: string
  cardNumber: string
}

type AssignCardSaveValues = {
  cardNumber: string
}

type AssignCardDialogProps = {
  open: boolean
  clientName: string
  loading?: boolean
  errorMessage?: string
  onClose: () => void
  onSave: (values: AssignCardSaveValues) => Promise<void> | void
}

export default function AssignCardDialog({
  open,
  clientName,
  loading = false,
  errorMessage,
  onClose,
  onSave,
}: AssignCardDialogProps) {
  const initialValues = useMemo<AssignCardFormValues>(
    () => ({
      clientName,
      cardNumber: '',
    }),
    [clientName]
  )

  const fields = useMemo<FormDialogField<AssignCardFormValues>[]>(
    () => [
      {
        name: 'clientName',
        label: 'اسم العميل',
        disabled: true,
        shrink: true,
      },
      {
        name: 'cardNumber',
        label: 'رقم الكرت الجديد',
        placeholder: 'أدخل رقم الكرت الجديد',
        autoFocus: true,
        required: 'رقم الكرت مطلوب',
        reserveHelperTextSpace: true,
        renderEndAdornment: () => (
          <InputAdornment position="end">
            <CreditCardIcon fontSize="small" color="action" />
          </InputAdornment>
        ),
        onValueChange: (value, { setValue }) => {
          const cleanValue = value.replace(/\s/g, '')

          if (cleanValue !== value) {
            setValue('cardNumber', cleanValue)
          }
        },
        validate: (value) => {
          if (!value.trim()) {
            return 'رقم الكرت مطلوب'
          }

          if (!/^[0-9]+$/.test(value)) {
            return 'رقم الكرت يجب أن يحتوي على أرقام فقط'
          }

          if (value.length < 4) {
            return 'رقم الكرت قصير جدًا'
          }

          return undefined
        },
      },
    ],
    []
  )

  return (
    <FormDialog
      open={open}
      title="إسناد البطاقة"
      description="أدخل رقم البطاقة الجديدة للعميل"
      icon={<CreditCardIcon fontSize="small" />}
      initialValues={initialValues}
      fields={fields}
      loading={loading}
      errorMessage={errorMessage}
      submitLabel="إسناد"
      loadingLabel="جاري الإسناد..."
      cancelLabel="إلغاء"
      resetKey={clientName}
      onClose={onClose}
      onSubmit={async (values) => {
        await onSave({
          cardNumber: values.cardNumber,
        })
      }}
    />
  )
}