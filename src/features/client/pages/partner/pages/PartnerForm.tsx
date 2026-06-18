import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import FormHelperText from '@mui/material/FormHelperText'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

import SaveIcon from '@mui/icons-material/Save'
import PersonIcon from '@mui/icons-material/Person'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

import { HADHRAMAUT_CITIES } from '@/features/client/constants'
import { applyServerErrors } from '@/lib/apply-server-errors'
import { isServerProblemDetailsError } from '@/shared/apis/server-problem-details'
import {
  useUpdateClient,
  useCreateClient,
  useClient,
} from '@/features/client/hooks'
import { mapPartnerToFormValues } from '../mappers'
import { ClientType } from '@/shared/types/ClientType'

export type FormValues = {
  FirstName: string
  SecondName: string
  ThirdName: string
  LastName: string
  NationalId?: string
  Password?: string
  PhoneNumber: string
  Address: string
  City: string
  NationalIdType: number
  OrganizationName?: string | null
}

const EMPTY_VALUES: FormValues = {
  FirstName: '',
  SecondName: '',
  ThirdName: '',
  LastName: '',
  NationalId: '',
  Password: '',
  PhoneNumber: '',
  Address: '',
  City: '',
  NationalIdType: 2,
  OrganizationName: '',
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography variant="subtitle1" sx={{ gridColumn: '1 / -1', fontWeight: 600 }}>
      {children}
    </Typography>
  )
}

export default function PartnerFormPage() {
  const { id } = useParams() as { id?: string }
  const isEdit = Boolean(id)

  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const { data: existing, isLoading: isLoadingBeneficiary } = useClient(id)
  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: EMPTY_VALUES,
  })


  useEffect(() => {
    if (!isEdit) {
      reset(EMPTY_VALUES)
      return
    }

    if (existing) {
      reset(mapPartnerToFormValues(existing))
    }
  }, [isEdit, existing, reset])


  const onSubmit = async (values: FormValues) => {
    clearErrors()

    const payload = {
      FirstName: values.FirstName,
      SecondName: values.SecondName,
      ThirdName: values.ThirdName,
      LastName: values.LastName,
      NationalId: values.NationalId,
      PhoneNumber: values.PhoneNumber,
      Address: values.Address,
      City: values.City,
      NationalIdType: values.NationalIdType ?? undefined,
      OrganizationName: values.OrganizationName?.trim(),
      ClientType: ClientType.Partner,

      ...(!isEdit ? { Password: values.Password } : {}),
    }

    try {
      await (isEdit && id
        ? updateMutation.mutateAsync({ id, payload })
        : createMutation.mutateAsync(payload))

      toast.success(isEdit ? 'تم التعديل بنجاح' : 'تم الحفظ بنجاح')
      navigate(!isEdit ? '/partners' : '/partners/' + id)

    } catch (error) {
      console.error('SAVE ERROR:', error)

      if (!isServerProblemDetailsError(error)) {
        toast.error('حدث خطأ غير متوقع أثناء الحفظ')
        return
      }

      applyServerErrors<FormValues>(
        error.errors,
        setError,
      )
    }
  }

  const isPageLoading = isLoadingBeneficiary
  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <PersonIcon />
        </Avatar>

        <Box>
          <Typography variant="h6">
            {isEdit ? 'تعديل الشريك' : 'إضافة شريك'}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            املأ بيانات الشريك ثم اضغط حفظ
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent>
          {isPageLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                }}
              >
                <SectionTitle>بيانات الشريك</SectionTitle>

                <Controller
                  name="FirstName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      label="الاسم الأول"
                      fullWidth
                      disabled={isSaving}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="SecondName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      label="الاسم الثاني"
                      fullWidth
                      disabled={isSaving}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="ThirdName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      label="الاسم الثالث"
                      fullWidth
                      disabled={isSaving}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="LastName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      label="اسم العائلة"
                      fullWidth
                      disabled={isSaving}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="NationalId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      label="الهوية الوطنية"
                      fullWidth
                      disabled={isSaving}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="NationalIdType"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth disabled={isSaving} error={!!fieldState.error}>
                      <InputLabel>نوع الهوية الوطنية</InputLabel>

                      <Select
                        label="نوع الهوية الوطنية"
                        value={field.value ?? ''}
                        onChange={(event) => {
                          const value = String(event.target.value)
                          field.onChange(value === '' ? null : Number(value))
                        }}
                      >
                        <MenuItem value="">
                          <em>غير محدد</em>
                        </MenuItem>

                        <MenuItem value={0}>هوية وطنية</MenuItem>
                        <MenuItem value={1}>جواز سفر</MenuItem>
                        <MenuItem value={2}>سجل تجاري</MenuItem>
                      </Select>

                      {fieldState.error?.message && (
                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                {!isEdit && (
                  <Controller
                    name="Password"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        label="كلمة المرور"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        disabled={isSaving}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  edge="end"
                                  onClick={() => setShowPassword((prev) => !prev)}
                                  onMouseDown={(event) => event.preventDefault()}
                                  disabled={isSaving}
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                )}

                  <Controller
                    name="OrganizationName"
                    control={control}
                    shouldUnregister
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        label="اسم المنظمة"
                        fullWidth
                        disabled={isSaving}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                <Divider sx={{ gridColumn: '1 / -1', my: 1 }} />

                <SectionTitle>بيانات التواصل</SectionTitle>

                <Controller
                  name="PhoneNumber"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      label="الهاتف"
                      fullWidth
                      disabled={isSaving}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="City"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth disabled={isSaving} error={!!fieldState.error}>
                      <InputLabel>المدينة</InputLabel>

                      <Select
                        label="المدينة"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(String(event.target.value))}
                        MenuProps={{
                          disableScrollLock: true,
                          disableAutoFocusItem: true,
                        }}
                      >
                        <MenuItem value="">
                          <em>غير محدد</em>
                        </MenuItem>

                        {HADHRAMAUT_CITIES.map((city, index) => (
                          <MenuItem key={index} value={city}>
                            {city}
                          </MenuItem>
                        ))}
                      </Select>

                      {fieldState.error?.message && (
                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="Address"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      label="العنوان"
                      fullWidth
                      disabled={isSaving}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />

                <Divider sx={{ gridColumn: '1 / -1', my: 1 }} />
              </Box>

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<SaveIcon />}
                  disabled={isSaving}
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={isSaving}
                >
                  إلغاء
                </Button>
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}