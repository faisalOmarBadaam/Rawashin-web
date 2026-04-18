'use client'

import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Box, Button, CircularProgress, Divider, TextField, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import AlertDialog from '@/components/dialogs/AlertDialog'
import GenericDialog from '@/components/dialogs/GenericDialog'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'
import { ClientsApi } from '@/libs/api/modules/clients.api'
import type { TransactionDto } from '@/types/api/transaction'

type Props = {
  clientId: string
  open: boolean
  onClose: () => void
  defaultReferenceId?: string
}

const refundSchema = z.object({
  referenceId: z.string().min(1, 'رقم المرجع مطلوب'),
  note: z.string().optional(),
})

type FormInputs = z.infer<typeof refundSchema>

const TransactionRefundDialog = ({ open, onClose, clientId, defaultReferenceId }: Props) => {
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [transactions, setTransactions] = useState<TransactionDto[]>([])
  const [searched, setSearched] = useState(false)

  const { refund, getByReference } = useTransactionsStore()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<FormInputs>({
    resolver: zodResolver(refundSchema),
    mode: 'onChange',
    defaultValues: {
      referenceId: defaultReferenceId || '',
      note: '',
    },
  })

  useEffect(() => {
    let mounted = true
    if (open) {
      reset({
        referenceId: defaultReferenceId || '',
        note: '',
      })

      if (defaultReferenceId) {
        setSearchLoading(true)
        getByReference(clientId, defaultReferenceId)
          .then(async data => {
            if (mounted) {
              // Ensure we have an array even if the API returns a single object
              let arr = Array.isArray(data) ? data : [data]
              arr = arr.filter(Boolean)

              // Fetch client name if missing
              if (arr.length > 0 && !arr[0].clientName && arr[0].clientId) {
                try {
                  const clientData = await ClientsApi.getById(arr[0].clientId)
                  const fallbackName =
                    clientData.fullName || clientData.organizationName || 'غير معروف'
                  arr = arr.map(t => ({ ...t, clientName: fallbackName }))
                } catch {
                  // ignore
                }
              }

              if (mounted) {
                setTransactions(arr)
                setSearched(true)
                setSearchLoading(false)
              }
            }
          })
          .catch(() => {
            if (mounted) {
              setTransactions([])
              setSearched(true)
              setSearchLoading(false)
            }
          })
      } else {
        setSearched(false)
        setTransactions([])
      }
    }
    return () => {
      mounted = false
    }
  }, [open, defaultReferenceId, reset, clientId, getByReference])

  // Watch referenceId to disable search button conditionally
  const referenceId = watch('referenceId')

  const handleClose = () => {
    if (loading) return
    setConfirmOpen(false)
    setTransactions([])
    setSearched(false)
    reset()
    onClose()
  }

  const handleSearch = async () => {
    if (!referenceId) return

    setSearchLoading(true)
    setSearched(false)
    try {
      const data = await getByReference(clientId, referenceId)
      // Ensure we have an array even if the API returns a single object
      let arr = Array.isArray(data) ? data : [data]
      arr = arr.filter(Boolean)

      // Fetch client name if missing
      if (arr.length > 0 && !arr[0].clientName && arr[0].clientId) {
        try {
          const clientData = await ClientsApi.getById(arr[0].clientId)
          const fallbackName = clientData.fullName || clientData.organizationName || 'غير معروف'
          arr = arr.map(t => ({ ...t, clientName: fallbackName }))
        } catch {
          // ignore
        }
      }

      setTransactions(arr)
    } catch (err: any) {
      toast.error(err?.response?.data?.title ?? err?.message ?? 'فشل في جلب تفاصيل العملية')
      setTransactions([])
    } finally {
      setSearchLoading(false)
      setSearched(true)
    }
  }

  const confirmRefundAction = async (values: FormInputs) => {
    setLoading(true)
    try {
      await refund({
        referenceId: values.referenceId,
        note: values.note,
      })

      toast.success('تم استرجاع العملية بنجاح')
      handleClose()
    } catch (err: any) {
      const apiError = err?.response?.data || err?.response || err
      const message = apiError?.detail || apiError?.title || 'فشلت عملية الاسترجاع'
      toast.error(message)
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  const handleFormSubmit = () => {
    if (transactions.length === 0) {
      toast.error('يرجى البحث عن العملية والتحقق منها أولاً')
      return
    }
    setConfirmOpen(true)
  }

  return (
    <>
      <GenericDialog
        open={open && !confirmOpen}
        title="استرجاع عملية"
        onClose={handleClose}
        onSubmit={handleSubmit(handleFormSubmit)}
        submitText="استرجاع"
        loading={loading}
        submitDisabled={loading || !isValid || transactions.length === 0}
        maxWidth="sm"
      >
        <Box className="flex flex-col gap-4" dir="rtl">
          <Box className="flex gap-2 items-start">
            <Controller
              name="referenceId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="رقم المرجع"
                  fullWidth
                  error={Boolean(errors.referenceId)}
                  helperText={errors.referenceId?.message}
                  onChange={e => {
                    field.onChange(e)
                    if (searched) {
                      setSearched(false)
                      setTransactions([])
                    }
                  }}
                />
              )}
            />
            <Button
              variant="contained"
              sx={{ mt: 1, minWidth: '100px' }}
              onClick={handleSearch}
              disabled={!referenceId || searchLoading}
            >
              {searchLoading ? <CircularProgress size={24} /> : 'بحث'}
            </Button>
          </Box>
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="ملاحظات (اختياري)"
                fullWidth
                multiline
                rows={3}
                error={Boolean(errors.note)}
                helperText={errors.note?.message}
              />
            )}
          />
          {searched && transactions.length === 0 && (
            <Alert severity="warning">لم يتم العثور على عمليات بهذا الرقم المرجعي.</Alert>
          )}

          {transactions.length > 0 && (
            <Box className="border rounded p-4 flex flex-col gap-2 bg-gray-50">
              <Typography variant="subtitle1" className="font-bold text-gray-700">
                تفاصيل العملية:
              </Typography>
              <Divider className="my-1" />
              {transactions.map((t, idx) => (
                <Box key={t.id || idx} className="flex flex-col gap-1 mb-2">
                  <Typography variant="body2">
                    <b>المبلغ:</b> {t.amount}
                  </Typography>
                  <Typography variant="body2">
                    <b>العميل:</b> {t.clientName ?? 'غير معروف'}
                  </Typography>
                  <Typography variant="body2">
                    <b>التاريخ:</b> {t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}
                  </Typography>
                  {t.description && (
                    <Typography variant="body2">
                      <b>الوصف:</b> {t.description}
                    </Typography>
                  )}
                  {idx < transactions.length - 1 && <Divider className="my-2" />}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </GenericDialog>

      <AlertDialog
        open={confirmOpen}
        title="تأكيد الاسترجاع"
        description={
          <Box dir="rtl">
            <Typography gutterBottom>
              هل أنت متأكد من استرجاع العملية ذات الرقم المرجعي <b>{watch('referenceId')}</b>؟
            </Typography>
            {transactions.length > 0 && (
              <Box className="p-3 my-3 bg-gray-100 rounded-md border text-sm flex flex-col gap-1">
                <Typography variant="body2">
                  <b>المبلغ:</b> {transactions[0].amount}
                </Typography>
                {transactions[0].description && (
                  <Typography variant="body2">
                    <b>الوصف:</b> {transactions[0].description}
                  </Typography>
                )}
                <Typography variant="body2">
                  <b>التاريخ:</b>{' '}
                  {transactions[0].createdAt
                    ? new Date(transactions[0].createdAt).toLocaleString('ar-SA')
                    : '-'}
                </Typography>
              </Box>
            )}
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              لا يمكن التراجع عن هذا الإجراء.
            </Typography>
          </Box>
        }
        confirmText="تأكيد الاسترجاع"
        cancelText="إلغاء"
        loading={loading}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit(confirmRefundAction)}
      />
    </>
  )
}

export default TransactionRefundDialog
