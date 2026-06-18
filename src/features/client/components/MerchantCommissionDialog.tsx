import { useMemo } from 'react'

import PercentIcon from '@mui/icons-material/Percent'
import type { FormDialogField } from '@/shared/components/ui/FormDialog'
import FormDialog from '@/shared/components/ui/FormDialog'


export type MerchantCommissionDialogValues = {
  clientName: string
  commission: string
  description: string
}

type MerchantCommissionDialogProps = {
  open: boolean
  clientName: string
  loading?: boolean
  errorMessage?: string
  onClose: () => void
  onSubmit: (values: MerchantCommissionDialogValues) => Promise<void> | void
}

export default function MerchantCommissionDialog({
  open,
  clientName,
  loading = false,
  errorMessage,
  onClose,
  onSubmit,
}: MerchantCommissionDialogProps) {
  const initialValues = useMemo<MerchantCommissionDialogValues>(
    () => ({
      clientName,
      commission: '',
      description: '',
    }),
    [clientName]
  )

  const fields = useMemo<FormDialogField<MerchantCommissionDialogValues>[]>(
    () => [
      {
        name: 'clientName',
        label: 'اسم العميل',
        disabled: true,
        shrink: true,
        helperText: 'يتم تعبئة اسم العميل تلقائيًا من صفحة التاجر ولا يمكن تعديله.',
      },
      {
        name: 'commission',
        label: 'الكوميشن',
        fieldType: 'number',
        placeholder: 'مثال: 2.5',
        required: 'الكوميشن مطلوب',
        autoFocus: true,
        reserveHelperTextSpace: true,
        validate: (value) => {
          const commission = Number(value)

          if (!Number.isFinite(commission)) return 'أدخل قيمة رقمية صحيحة'
          if (commission <= 0) return 'يجب أن تكون قيمة الكوميشن أكبر من صفر'

          return undefined
        },
      },
      {
        name: 'description',
        label: 'الوصف',
        placeholder: 'اكتب وصفًا مختصرًا للعمولة',
        multiline: true,
        rows: 4,
      },
    ],
    []
  )

  return (
    <FormDialog
      open={open}
      title="إضافة عمولة"
      description="أدخل بيانات العمولة الخاصة بهذا التاجر."
      icon={<PercentIcon fontSize="small" />}
      initialValues={initialValues}
      fields={fields}
      loading={loading}
      errorMessage={errorMessage}
      submitLabel="حفظ العمولة"
      loadingLabel="جاري حفظ العمولة..."
      cancelLabel="إلغاء"
      resetKey={`${clientName}-${open ? 'open' : 'closed'}`}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
