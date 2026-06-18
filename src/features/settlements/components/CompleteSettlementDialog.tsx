import { useMemo } from 'react'

import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined'

import FormDialog from '@/shared/components/ui/FormDialog'
import type { FormDialogField } from '@/shared/components/ui/FormDialog'
import {
  PaymentMethod,
  paymentMethodOptions,
  type CompleteSettlementPayload,
} from '../types'

export type CompleteSettlementDialogValues = {
  method: string
  paymentReference: string
  adminNote: string
}

type CompleteSettlementDialogProps = {
  open: boolean
  loading?: boolean
  errorMessage?: string
  onClose: () => void
  onSubmit: (payload: CompleteSettlementPayload) => Promise<void> | void
}

export default function CompleteSettlementDialog({
  open,
  loading = false,
  errorMessage,
  onClose,
  onSubmit,
}: CompleteSettlementDialogProps) {
  const initialValues = useMemo<CompleteSettlementDialogValues>(
    () => ({
      method: String(PaymentMethod.Cash),
      paymentReference: '',
      adminNote: '',
    }),
    [],
  )

  const fields = useMemo<FormDialogField<CompleteSettlementDialogValues>[]>(
    () => [
      {
        kind: 'custom',
        id: 'method',
        render: ({ values, setValue, loading: dialogLoading }) => (
          <TextField
            select
            fullWidth
            label="طريقة الدفع"
            value={values.method}
            disabled={dialogLoading}
            onChange={event => setValue('method', event.target.value)}
          >
            {paymentMethodOptions.map(option => (
              <MenuItem key={option.value} value={String(option.value)}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        ),
      },
      {
        name: 'paymentReference',
        label: 'المرجع المالي',
        placeholder: 'أدخل رقم المرجع أو رقم الحوالة',
        required: 'المرجع المالي مطلوب',
        autoFocus: true,
        reserveHelperTextSpace: true,
      },
      {
        name: 'adminNote',
        label: 'ملاحظة إدارية',
        placeholder: 'أدخل ملاحظة داخلية عن عملية الإتمام',
        multiline: true,
        rows: 4,
        required: 'الملاحظة الإدارية مطلوبة',
        reserveHelperTextSpace: true,
      },
    ],
    [],
  )

  return (
    <FormDialog
      open={open}
      title="إتمام التسوية"
      description="أدخل بيانات تنفيذ التسوية قبل اعتمادها نهائيًا."
      icon={<DoneAllOutlinedIcon fontSize="small" />}
      initialValues={initialValues}
      fields={fields}
      loading={loading}
      errorMessage={errorMessage}
      submitLabel="إتمام التسوية"
      loadingLabel="جاري الإتمام..."
      cancelLabel="إلغاء"
      resetKey={`complete-settlement-${open ? 'open' : 'closed'}`}
      onClose={onClose}
      onSubmit={async values => {
        await onSubmit({
          method: Number(values.method) as PaymentMethod,
          paymentReference: values.paymentReference.trim(),
          adminNote: values.adminNote.trim(),
        })
      }}
    />
  )
}