'use client'

import { useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { toast } from 'react-toastify'

import ControlledAutocomplete from '@/components/ControlledAutocomplete'
import GenericDialog from '@/components/dialogs/GenericDialog'

import { useClientsStore } from '@/contexts/clients/clients.store'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'

import type { LookupDto } from '@/types/api/clients'
import { ClientType } from '@/types/api/clients'

const ACCEPTED_MIME = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
])

const ACCEPTED_EXT = ['.xlsx', '.xls', '.csv']

const schema = z.object({
  partner: z
    .custom<LookupDto | null>()
    .refine(v => Boolean(v && (v as LookupDto).id), { message: 'يرجى اختيار الشريك' }),
  file: z
    .custom<File | null>()
    .refine(v => v instanceof File, { message: 'يرجى اختيار ملف' })
    .refine(
      v => {
        if (!(v instanceof File)) return false
        const name = v.name?.toLowerCase?.() ?? ''
        return ACCEPTED_EXT.some(ext => name.endsWith(ext))
      },
      { message: 'صيغة الملف غير مدعومة (xlsx, xls, csv)' },
    )
    .refine(
      v => {
        if (!(v instanceof File)) return false
        return !v.type || ACCEPTED_MIME.has(v.type)
      },
      { message: 'نوع الملف غير مدعوم' },
    ),
})

type FormValues = z.input<typeof schema>
type SubmitValues = z.output<typeof schema>

type UploadResult = {
  totalRows: number
  processedRows: number
  newClientsCreated: number
  totalAmount: number
  errors: any[]
  isSuccess: boolean
}

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function UploadBatchDialog({ open, onClose, onSuccess }: Props) {
  const { clientLookup } = useClientsStore()
  const { uploadBatch } = useTransactionsStore()

  const [partners, setPartners] = useState<LookupDto[]>([])
  const [lookupLoading, setLookupLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summary, setSummary] = useState<UploadResult | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<FormValues, any, SubmitValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { partner: null, file: null },
  })

  const file = watch('file')

  const submitDisabled = useMemo(
    () => loading || lookupLoading || !isValid,
    [loading, lookupLoading, isValid],
  )

  useEffect(() => {
    if (!open) return
    let mounted = true

    const loadPartners = async () => {
      try {
        setLookupLoading(true)
        setServerError(null)
        const data = await clientLookup(ClientType.Partner)
        if (mounted) setPartners(data)
      } catch (e: any) {
        const msg = e?.message ?? 'فشل تحميل الشركاء'
        if (mounted) setServerError(msg)
        toast.error(msg)
      } finally {
        if (mounted) setLookupLoading(false)
      }
    }

    loadPartners()

    return () => {
      mounted = false
      reset({ partner: null, file: null })
      setServerError(null)
      setSummary(null)
      setSummaryOpen(false)
    }
  }, [open, clientLookup, reset])

  const onPickFile = async (picked: File | null) => {
    setValue('file', picked, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    await trigger('file')
  }

  const shouldShowSummary = (r: UploadResult) =>
    r.errors?.length > 0 || r.processedRows < r.totalRows || r.newClientsCreated > 0

  const successToastMessage = (r: UploadResult) =>
    `تم الرفع بنجاح • ${r.processedRows}/${r.totalRows} • إجمالي ${r.totalAmount}`

  const onSubmit = async (values: SubmitValues) => {
    try {
      setLoading(true)
      setServerError(null)

      const result: UploadResult = await uploadBatch(values.partner!.id!, values.file!)

      if (!result?.isSuccess) {
        const msg = 'تم رفع الملف لكن مع وجود أخطاء'
        setServerError(msg)
        toast.error(msg)
        return
      }

      if (shouldShowSummary(result)) {
        setSummary(result)
        setSummaryOpen(true)
      } else {
        toast.success(successToastMessage(result), { autoClose: 5000 })
        onSuccess()
        onClose()
        reset({ partner: null, file: null })
      }
    } catch (e: any) {
      const msg = e?.message ?? 'فشل رفع الملف'
      setServerError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const closeSummary = () => {
    setSummaryOpen(false)
    setSummary(null)
    toast.success(successToastMessage(summary!), { autoClose: 5000 })
    onSuccess()
    onClose()
    reset({ partner: null, file: null })
  }

  return (
    <>
      <GenericDialog
        open={open}
        title="رفع حسابات المستفيدين"
        onClose={onClose}
        onSubmit={handleSubmit(onSubmit, () => {
          const firstError =
            errors.partner?.message || errors.file?.message || 'يرجى التحقق من الحقول المطلوبة'
          toast.warning(String(firstError))
        })}
        submitText="رفع"
        loading={loading}
        submitDisabled={submitDisabled}
        maxWidth="sm"
      >
        <Stack spacing={2} dir="rtl">
          <ControlledAutocomplete<FormValues, LookupDto>
            control={control}
            name="partner"
            label="الشريك"
            options={partners}
            loading={lookupLoading}
            placeholder="اختر الشريك"
            textFieldProps={{
              fullWidth: true,
              size: 'small',
              error: Boolean(errors.partner),
              helperText: errors.partner?.message,
            }}
          />

          <Button component="label" variant="outlined" disabled={loading || lookupLoading}>
            اختيار ملف
            <input
              hidden
              type="file"
              accept={ACCEPTED_EXT.join(',')}
              onChange={e => onPickFile(e.target.files?.[0] ?? null)}
            />
          </Button>

          {file && <Alert severity="info">{file.name}</Alert>}
          {errors.file?.message && <Alert severity="error">{errors.file.message}</Alert>}
          {serverError && <Alert severity="error">{serverError}</Alert>}
          {(loading || lookupLoading) && <CircularProgress size={24} />}
        </Stack>
      </GenericDialog>

      <Dialog open={summaryOpen} onClose={closeSummary} maxWidth="sm" fullWidth>
        <DialogTitle>ملخص الرفع</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Typography>عدد الصفوف: {summary?.totalRows}</Typography>
            <Typography>المعالجة: {summary?.processedRows}</Typography>
            <Typography>مستفيدون جدد: {summary?.newClientsCreated}</Typography>
            <Typography>إجمالي المبلغ: {summary?.totalAmount}</Typography>
            {summary?.errors?.length ? (
              <Alert severity="warning">يوجد {summary.errors.length} أخطاء</Alert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSummary} variant="contained">
            تم
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
