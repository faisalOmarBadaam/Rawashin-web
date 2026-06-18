import { useEffect, useState } from 'react'
import type { ComponentProps } from 'react'
import { useNavigate, useParams } from 'react-router'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import EditIcon from '@mui/icons-material/Edit'
import LockIcon from '@mui/icons-material/Lock'
import PersonIcon from '@mui/icons-material/Person'
import ContactPhoneIcon from '@mui/icons-material/ContactPhone'

type CashierForm = {
  firstName: string
  phoneNumber: string
  password: string
}

type FormErrors = Partial<Record<keyof CashierForm, string>>
type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>

type CashierDetails = {
  id: string | number
  firstName?: string | null
  phoneNumber?: string | null
}

const initialForm: CashierForm = {
  firstName: '',
  phoneNumber: '',
  password: '',
}

/**
 * استبدل هذه الدوال بالـ API أو hooks الموجودة عندك.
 */

async function getCashierDetails(params: {
  merchantId: string
  cashierId: string
}): Promise<CashierDetails> {
  console.log('get cashier details', params)

  return {
    id: params.cashierId,
    firstName: '',
    phoneNumber: '',
  }
}

async function createCashier(payload: {
  merchantId: string
  firstName: string
  phoneNumber: string
  password: string
}) {
  console.log('create cashier payload', payload)
}

async function updateCashier(payload: {
  merchantId: string
  cashierId: string
  firstName: string
  phoneNumber: string
  password?: string
}) {
  console.log('update cashier payload', payload)
}

export default function CashierFormPage() {
  const { id, cashierId } = useParams() as {
    id?: string
    cashierId?: string
  }

  const navigate = useNavigate()

  const isEditMode = Boolean(cashierId)

  const [form, setForm] = useState<CashierForm>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pageTitle = isEditMode ? 'تعديل كاشير' : 'إضافة كاشير'

  const pageDescription = isEditMode
    ? `تعديل بيانات الكاشير المرتبط بالتاجر رقم: ${id}`
    : `إضافة كاشير جديد وربطه بالتاجر رقم: ${id}`

  const submitLabel = isEditMode ? 'حفظ التعديلات' : 'حفظ الكاشير'
  const submittingLabel = isEditMode ? 'جاري التعديل' : 'جاري الحفظ'

  useEffect(() => {
    if (!id || !cashierId) return

    let ignore = false

    const loadCashier = async () => {
      try {
        setIsLoading(true)
        setSubmitError('')

        const cashier = await getCashierDetails({
          merchantId: id,
          cashierId,
        })

        if (ignore) return

        setForm({
          firstName: cashier.firstName ?? '',
          phoneNumber: cashier.phoneNumber ?? '',
          password: '',
        })
      } catch (error) {
        if (ignore) return

        setSubmitError(error instanceof Error ? error.message : 'حدث خطأ أثناء جلب بيانات الكاشير')
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadCashier()

    return () => {
      ignore = true
    }
  }, [id, cashierId])

  const handleChange = <Key extends keyof CashierForm>(
    key: Key,
    value: CashierForm[Key],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }))

    setSubmitError('')
  }

  const validateForm = () => {
    const nextErrors: FormErrors = {}

    if (!form.firstName.trim()) {
      nextErrors.firstName = 'اسم الكاشير مطلوب'
    }

    if (!form.phoneNumber.trim()) {
      nextErrors.phoneNumber = 'رقم الهاتف مطلوب'
    }

    if (!isEditMode && !form.password) {
      nextErrors.password = 'كلمة المرور مطلوبة'
    }

    if (form.password && form.password.length < 6) {
      nextErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault()

    if (!id) {
      setSubmitError('معرف التاجر غير موجود')
      return
    }

    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      setSubmitError('')

      if (isEditMode && cashierId) {
        await updateCashier({
          merchantId: id,
          cashierId,
          firstName: form.firstName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          password: form.password || undefined,
        })
      } else {
        await createCashier({
          merchantId: id,
          firstName: form.firstName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          password: form.password,
        })
      }

      navigate(-1)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ بيانات الكاشير')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!id) {
    return <Alert severity="error">معرف التاجر غير موجود</Alert>
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            alignItems: {
              xs: 'stretch',
              md: 'center',
            },
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              {isEditMode ? <EditIcon fontSize="large" /> : <PersonAddIcon fontSize="large" />}
            </Avatar>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {pageTitle}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                {pageDescription}
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            sx={{ alignSelf: { xs: 'stretch', md: 'center' } }}
          >
            العودة
          </Button>
        </Stack>
      </Paper>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent
          sx={{
            p: { xs: 2, md: 3 },
            '&:last-child': {
              pb: { xs: 2, md: 3 },
            },
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              {submitError ? <Alert severity="error">{submitError}</Alert> : null}

              <Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main' }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      البيانات الأساسية
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      أدخل اسم الكاشير كما سيظهر في النظام.
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="اسم الكاشير"
                    value={form.firstName}
                    onChange={(event) => handleChange('firstName', event.target.value)}
                    error={Boolean(errors.firstName)}
                    helperText={errors.firstName}
                    disabled={isSubmitting}
                    fullWidth
                    required
                  />
                </Box>
              </Box>

              <Divider />

              <Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main' }}>
                    <ContactPhoneIcon fontSize="small" />
                  </Avatar>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      بيانات التواصل
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      رقم الهاتف المرتبط بحساب الكاشير.
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="رقم الهاتف"
                    value={form.phoneNumber}
                    onChange={(event) => handleChange('phoneNumber', event.target.value)}
                    error={Boolean(errors.phoneNumber)}
                    helperText={errors.phoneNumber}
                    disabled={isSubmitting}
                    fullWidth
                    required
                  />
                </Box>
              </Box>

              <Divider />

              <Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main' }}>
                    <LockIcon fontSize="small" />
                  </Avatar>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      كلمة المرور
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {isEditMode
                        ? 'اترك كلمة المرور فارغة إذا كنت لا تريد تغييرها.'
                        : 'كلمة المرور مطلوبة عند إضافة كاشير جديد.'}
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 2,
                  }}
                >
                  <TextField
                    label={isEditMode ? 'كلمة مرور جديدة' : 'كلمة المرور'}
                    type="password"
                    value={form.password}
                    onChange={(event) => handleChange('password', event.target.value)}
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                    disabled={isSubmitting}
                    fullWidth
                    required={!isEditMode}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon fontSize="small" color="disabled" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>
              </Box>

              <Divider />

              <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                spacing={1}
                sx={{
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  sx={{ minWidth: 120 }}
                >
                  إلغاء
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
                  }
                  disabled={isSubmitting}
                  sx={{ minWidth: 150 }}
                >
                  {isSubmitting ? submittingLabel : submitLabel}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}