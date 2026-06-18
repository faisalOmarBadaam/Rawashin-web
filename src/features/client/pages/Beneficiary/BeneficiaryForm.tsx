import { useEffect, useMemo, useState } from 'react'
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


import ControlledAutocomplete from '@/shared/components/ui/ControlledAutocomplete'
import { ClientType } from '@/shared/types/ClientType'
import { HADHRAMAUT_CITIES } from '@/features/client/constants'
import { mapBeneficiaryToFormValues } from './mappers'
import { applyServerErrors } from '@/lib/apply-server-errors'
import { isServerProblemDetailsError } from '@/shared/apis/server-problem-details'
import { useClient, useClientLookup, useCreateClient, useUpdateClient } from '../../hooks'
import type { ClientLookupResponse } from '../../types/responses'

export type FormValues = {
  FirstName: string
  SecondName: string
  ThirdName: string
  LastName: string
  NationalId?: string
  Password?: string
  PhoneNumber?: string
  Address?: string
  City: string
  NationalIdType?: number | null
  ParentClientId?: ClientLookupResponse | null
}

const EMPTY_VALUES: FormValues = {
  FirstName: '',
  SecondName : '',
  ThirdName: '',
  LastName: '',
  NationalId: '',
  Password: '',
  PhoneNumber: '',
  Address: '',
  City: '',
  NationalIdType: null,
  ParentClientId: null,
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography variant="subtitle1" sx={{ gridColumn: '1 / -1', fontWeight: 600 }}>
      {children}
    </Typography>
  )
}

export default function BeneficiaryForm() {
  const { id } = useParams() as { id?: string }
  const isEdit = Boolean(id)

  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const { data: existing, isLoading: isLoadingBeneficiary } = useClient(id)

  const { data: beneficiaryLookupOptions, isLoading: isLoadingBeneficiaryLookup } =
    useClientLookup(ClientType.Partner)

  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()

  const beneficiaryOptions = useMemo(
    () => beneficiaryLookupOptions ?? [],
    [beneficiaryLookupOptions]
  )

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!isEdit) {
      reset(EMPTY_VALUES)
      return
    }

    if (existing) {
      reset(mapBeneficiaryToFormValues(existing, beneficiaryOptions))
    }
  }, [isEdit, existing, beneficiaryOptions, reset])

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
      ParentClientId: values.ParentClientId?.id,
      ClientType: ClientType.Client,
      ...(!isEdit ? { Password: values.Password } : {}),
    }
    
    try {
      await (isEdit && id
        ? updateMutation.mutateAsync({ id, payload })
        : createMutation.mutateAsync(payload))

      toast.success(isEdit ? 'تم التعديل بنجاح' : 'تم الحفظ بنجاح')
      navigate(!isEdit ? '/beneficiaries' : '/beneficiaries/' + id)
    } catch (error) {
        console.error('SAVE ERROR:', error)
      if (!isServerProblemDetailsError(error)) return

      applyServerErrors<FormValues>(
        error.errors,
        setError,
      )

      // لا نعرض toast.error هنا لأن Global Error Handler في React Query هو المسؤول عنها.
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
            {isEdit ? 'تعديل المستفيد' : 'إضافة مستفيد'}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            املأ بيانات المستفيد ثم اضغط حفظ
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
                <SectionTitle>بيانات المستفيد</SectionTitle>

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

                <Box>
                  <ControlledAutocomplete
                    control={control}
                    name="ParentClientId"
                    label="جهة المستفيد"
                    options={beneficiaryOptions}
                    loading={isLoadingBeneficiaryLookup}
                    disabled={isSaving}
                    placeholder="اختر جهة المستفيد"
                    getOptionLabel={(option: ClientLookupResponse) =>
                      option.name ?? ''
                    }
                  />

                  {errors.ParentClientId?.message && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ display: 'block', mt: 0.5, mx: '14px' }}
                    >
                      {errors.ParentClientId.message}
                    </Typography>
                  )}
                </Box>

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


