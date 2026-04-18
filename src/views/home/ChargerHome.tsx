'use client'

import { useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { toast } from 'react-toastify'

import { useAuthStore } from '@/contexts/auth/auth.store'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'

import ClientBalanceCompact from '@/components/ClientBalanceCompact'
import AlertDialog from '@/components/dialogs/AlertDialog'
import GenericDialog from '@/components/dialogs/GenericDialog'
import ClientTransactionsDataGrid from '@/domains/clients/components/shared/ClientTransactionsDataGrid'
import { useClientByPhone } from '@/hooks/useClientByPhone'

const ACCEPTED_MIME = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
])

const ACCEPTED_EXT = ['.xlsx', '.xls', '.csv']

const ChargerHome = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [note, setNote] = useState('')

  const [customerName, setCustomerName] = useState<string | null>(null)
  const [openConfirm, setOpenConfirm] = useState(false)

  const [amount, setAmount] = useState<number | ''>('')
  const [amountDisplay, setAmountDisplay] = useState('')

  const [loading, setLoading] = useState(false)
  const { fetchByPhone, loading: loadingCustomer } = useClientByPhone()
  const [touched, setTouched] = useState({
    phone: false,
    amount: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkError, setBulkError] = useState<string | null>(null)

  const formatNumber = (value: string) => {
    if (!value) return ''
    return Number(value).toLocaleString('en-US')
  }

  const clientId = useAuthStore(s => s.session?.userId)
  const chargerChargeCustomer = useTransactionsStore(s => s.chargerChargeCustomer)
  const uploadAccountChargesBatch = useTransactionsStore(s => s.uploadAccountChargesBatch)

  const phoneError = useMemo(() => {
    if (!phoneNumber) return 'رقم الهاتف مطلوب'
    if (!/^\d+$/.test(phoneNumber)) return 'يجب إدخال أرقام فقط'
    if (!/^7\d{8}$/.test(phoneNumber)) return 'رقم الهاتف يجب أن يكون 9 أرقام ويبدأ بالرقم 7'
    return ''
  }, [phoneNumber])

  const amountError = useMemo(() => {
    if (amount === '') return 'المبلغ مطلوب'
    if (Number(amount) <= 0) return 'المبلغ يجب أن يكون أكبر من صفر'
    return ''
  }, [amount])

  const showPhoneError = (touched.phone || submitted) && !!phoneError
  const showAmountError = (touched.amount || submitted) && !!amountError

  const isValid = !phoneError && !amountError

  if (!clientId) {
    return null
  }

  const handleConfirmCharge = async () => {
    setOpenConfirm(false)
    setLoading(true)

    try {
      await chargerChargeCustomer(clientId, {
        phoneNumber,
        amount: Number(amount),
        note: note.trim() || null,
      })

      toast.success('تمت عملية الشحن بنجاح')
      setPhoneNumber('')
      setAmount('')
      setNote('')
      setTouched({ phone: false, amount: false })
      setSubmitted(false)
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.response?.data?.title || 'فشلت عملية الشحن'

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const validateBulkFile = (file: File | null) => {
    if (!file) return 'يرجى اختيار ملف'

    const name = file.name?.toLowerCase?.() ?? ''
    const isAcceptedExt = ACCEPTED_EXT.some(ext => name.endsWith(ext))

    if (!isAcceptedExt) return 'صيغة الملف غير مدعومة (xlsx, xls, csv)'
    if (file.type && !ACCEPTED_MIME.has(file.type)) return 'نوع الملف غير مدعوم'

    return null
  }

  const triggerFileDownload = (blob: Blob, fileName?: string | null) => {
    const fallbackName = `BatchResult_${new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 14)}.xlsx`
    const finalName = fileName?.trim() || fallbackName
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = finalName
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  const handleBulkUpload = async () => {
    const validationError = validateBulkFile(bulkFile)

    if (validationError) {
      setBulkError(validationError)
      toast.warning(validationError)

      return
    }

    try {
      setBulkLoading(true)
      setBulkError(null)

      const result = await uploadAccountChargesBatch(bulkFile!)
      triggerFileDownload(result.fileBlob, result.fileName)
      toast.success('تم رفع الملف وتنزيل نتيجة المعالجة بنجاح', { autoClose: 5000 })
      setBulkDialogOpen(false)
      setBulkFile(null)
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || err?.response?.data?.title || err?.message || 'فشل رفع الملف'
      setBulkError(msg)
      toast.error(msg)
    } finally {
      setBulkLoading(false)
    }
  }

  const handleCloseBulkDialog = () => {
    if (bulkLoading) return
    setBulkDialogOpen(false)
    setBulkFile(null)
    setBulkError(null)
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h5">لوحة الشحن</Typography>
          <Box
            sx={{
              alignSelf: 'flex-end',
              marginInlineStart: 'auto',
              width: 'fit-content',
              maxWidth: 360,
            }}
          >
            <ClientBalanceCompact clientId={clientId} />
          </Box>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            من هنا يمكنك شحن رصيد العملاء
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => setBulkDialogOpen(true)}>
              شحن متعدد عبر ملف
            </Button>
          </Box>

          <Box
            sx={{
              mt: 4,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '1fr 1fr',
              },
              gap: 2,
            }}
          >
            <TextField
              label="رقم الهاتف"
              fullWidth
              value={phoneNumber}
              error={showPhoneError}
              helperText={showPhoneError ? phoneError : ''}
              inputProps={{ maxLength: 9 }}
              onChange={e => {
                setTouched(t => ({ ...t, phone: true }))
                setPhoneNumber(e.target.value.replace(/\D/g, ''))
              }}
            />

            <TextField
              label="المبلغ"
              fullWidth
              value={amountDisplay}
              error={showAmountError}
              helperText={showAmountError ? amountError : ''}
              inputProps={{ inputMode: 'numeric' }}
              onChange={e => {
                setTouched(t => ({ ...t, amount: true }))
                const raw = e.target.value.replace(/,/g, '')
                if (!/^\d*$/.test(raw)) return
                const numericValue = raw === '' ? '' : Number(raw)
                setAmount(numericValue)
                setAmountDisplay(formatNumber(raw))
              }}
            />

            <TextField
              label="ملاحظة"
              fullWidth
              value={note}
              onChange={e => setNote(e.target.value)}
              sx={{ gridColumn: '1 / -1' }}
            />

            <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
              <Button
                type="button"
                fullWidth
                variant="contained"
                disabled={loading || loadingCustomer}
                onClick={async () => {
                  setSubmitted(true)
                  if (!isValid) return

                  const name = await fetchByPhone(phoneNumber)
                  if (!name) return

                  setCustomerName(name)
                  setOpenConfirm(true)
                }}
              >
                شحن
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <div className="my-6">
        <ClientTransactionsDataGrid clientId={clientId} />
      </div>
      <AlertDialog
        open={openConfirm}
        title="تأكيد عملية الشحن"
        description={
          <>
            <Typography>
              هل أنت متأكد من شحن هذا المستفيد:
              <strong> {customerName}</strong>
            </Typography>

            <Typography sx={{ mt: 0.5 }}>
              رقم الهاتف:
              <strong> {phoneNumber}</strong>
            </Typography>

            <Typography sx={{ mt: 1 }}>
              بقيمة:
              <strong> {amountDisplay || formatNumber(String(amount))} </strong>
            </Typography>

            {note.trim() && (
              <Typography sx={{ mt: 0.5 }}>
                الملاحظة:
                <strong> {note}</strong>
              </Typography>
            )}
          </>
        }
        confirmText="تأكيد"
        cancelText="إلغاء"
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmCharge}
      />

      <GenericDialog
        open={bulkDialogOpen}
        title="شحن متعدد للمستفيدين"
        onClose={handleCloseBulkDialog}
        onSubmit={handleBulkUpload}
        submitText="رفع"
        loading={bulkLoading}
        submitDisabled={bulkLoading || !bulkFile}
        maxWidth="sm"
      >
        <Stack spacing={2} dir="rtl">
          <Box>
            <Button
              component="a"
              href="/templates/account-charges-batch-template.xlsx"
              download
              variant="text"
            >
              تحميل نموذج Excel
            </Button>
          </Box>

          <Button component="label" variant="outlined" disabled={bulkLoading}>
            اختيار ملف
            <input
              hidden
              type="file"
              accept={ACCEPTED_EXT.join(',')}
              onChange={e => {
                const selected = e.target.files?.[0] ?? null
                setBulkFile(selected)
                setBulkError(validateBulkFile(selected))
              }}
            />
          </Button>

          {bulkFile && <Alert severity="info">{bulkFile.name}</Alert>}
          {bulkError && <Alert severity="error">{bulkError}</Alert>}
          {bulkLoading && <CircularProgress size={24} />}
        </Stack>
      </GenericDialog>
    </>
  )
}

export default ChargerHome
