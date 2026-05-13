'use client'

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

import { Icon } from '@iconify/react'

import ControlledAutocomplete from '@/components/ControlledAutocomplete'
import { useAuthStore } from '@/contexts/auth/auth.store'
import { useClientsStore } from '@/contexts/clients/clients.store'
import {
  getRegisterSchemaForVariant,
  type RegisterFormMode,
  type RegisterFormValues,
} from '@/domains/clients/utils/register.schema'
import {
  applyVariantToCreateOrUpdateDto,
  getVariantConfig,
  type ClientVariant,
} from '@/domains/clients/variants/clientVariants'
import { useClientCommissionQuery } from '@/libs/react-query'
import { ClientType, type ClientDto, type LookupDto } from '@/types/api/clients'

import UploadClientAttachmentsDialog from '@/domains/clients/components/shared/UploadClientAttachmentsDialog'
import { mapClientToRegisterFormValues } from '@/domains/clients/utils/register.mapper'

export type RegisterFormRef = {
  submit: () => void
  isDirty: boolean
  isSubmitting: boolean
  resetForm: () => void
}

export type RegisterFormProps = {
  variant: ClientVariant
  mode: RegisterFormMode
  clientType: ClientType
  client?: ClientDto | null
  loading?: boolean
  onFormStateChange?: (state: { isDirty: boolean; isSubmitting: boolean }) => void
  onSubmit?: (
    data: RegisterFormValues,
    setFieldError: (name: keyof RegisterFormValues, message: string) => void,
  ) => Promise<void>
}

const HADHRAMAUT_CITIES = [
  'المكلا',
  'الشحر',
  'غيل باوزير',
  'الديس الشرقية',
  'الديس ',
  'الريدة وقصيعر',
  'بروم ميفع',
  'حجر',
  'دوعن',
  'سيئون',
  'تريم',
  'شبام',
  'القطن',
  'حورة ووادي العين',
  'ساه',
  'رماه',
]

const generatePassword = (length = 10) => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const all = upper + lower + numbers

  const getRandom = (str: string) => str[Math.floor(Math.random() * str.length)]

  let password = getRandom(upper) + getRandom(lower) + getRandom(numbers)

  for (let i = password.length; i < length; i++) {
    password += getRandom(all)
  }

  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')

  return password
}

const getParentLookupConfig = (variant: ClientVariant, clientType: ClientType) => {
  if (variant === 'users') {
    if (clientType === ClientType.Charger) {
      return {
        label: 'الحساب الرئيسي',
        lookupType: ClientType.Admin,
      }
    }

    return {
      label: 'حساب ادارة رواشن',
      lookupType: ClientType.Admin,
    }
  }

  switch (clientType) {
    case ClientType.Client:
      return { label: 'جهة المستفيد', lookupType: ClientType.Partner }
    case ClientType.Merchant:
      return { label: 'التابع لـ', lookupType: ClientType.Merchant }
    case ClientType.Partner:
      return { label: 'فرع لـ', lookupType: ClientType.Partner }
    default:
      return { label: 'الجهة', lookupType: ClientType.Partner }
  }
}

const resolveParentLookup = (client: ClientDto, lookup: LookupDto[]) => {
  if (!client.parentClientId) return null

  const match = lookup.find(option => option.id === client.parentClientId)

  if (match) return match

  return {
    id: client.parentClientId,
    name: client.parentClientName ?? String(client.parentClientId),
  }
}

const RegisterForm = forwardRef<RegisterFormRef, RegisterFormProps>(function RegisterForm(
  { variant, mode, clientType, client, onFormStateChange, onSubmit },
  ref,
) {
  const { fetchLookup } = useClientsStore()
  const [showPassword, setShowPassword] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupOptions, setLookupOptions] = useState<LookupDto[]>([])
  const [openAttachmentsDialog, setOpenAttachmentsDialog] = useState(false)

  const isView = mode === 'view'
  const isAdd = mode === 'add'
  const isSubMerchantAdd = variant === 'merchants' && isAdd
  const isSubMerchantViewEdit = variant === 'merchants' && !isAdd
  const config = getVariantConfig(variant)
  const session = useAuthStore(state => state.session)

  const normalizedClientType = useMemo(() => {
    if (config.fixedType !== undefined) return config.fixedType as ClientType

    if (config.allowedTypes.includes(clientType)) return clientType

    return config.allowedTypes[0] as ClientType
  }, [clientType, config.allowedTypes, config.fixedType])

  const effectiveClientType = applyVariantToCreateOrUpdateDto(variant, {
    clientType: normalizedClientType,
  }).clientType as ClientType

  const { label: parentLabel, lookupType } = getParentLookupConfig(variant, effectiveClientType)

  const canShowCommissionRate =
    variant !== 'users' &&
    isView &&
    effectiveClientType === ClientType.Merchant &&
    Boolean(client?.id)

  const { data: commissionData, isLoading: commissionLoading } = useClientCommissionQuery(
    client?.id ?? '',
    {
      enabled: canShowCommissionRate,
    },
  )

  const defaultPassword = useMemo(() => (isAdd ? generatePassword() : ''), [isAdd])

  const currentMerchantOption = useMemo<LookupDto | null>(() => {
    if (!isSubMerchantAdd || !session?.userId) return null

    const merchant = lookupOptions.find(x => x.id === session.userId)

    if (merchant) return merchant

    return {
      id: session.userId,
      name: '',
    }
  }, [isSubMerchantAdd, session?.userId, lookupOptions])

  const parentOptions = useMemo(() => {
    if (!currentMerchantOption) return lookupOptions

    const hasCurrentMerchant = lookupOptions.some(option => option.id === currentMerchantOption.id)

    return hasCurrentMerchant ? lookupOptions : [currentMerchantOption, ...lookupOptions]
  }, [currentMerchantOption, lookupOptions])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
    watch,
    trigger,
    formState: { errors, isDirty, isSubmitting, touchedFields, submitCount },
  } = useForm<RegisterFormValues>({
    resolver: isView
      ? undefined
      : zodResolver(getRegisterSchemaForVariant(mode, effectiveClientType, variant)),
    mode: 'onChange',
    defaultValues: {
      email: '',
      phoneNumber: '',
      firstName: '',
      secondName: '',
      thirdName: '',
      lastName: '',
      nationalId: '',
      organizationName: '',
      nationalIdType: effectiveClientType === ClientType.Client ? 0 : 2,
      address: '',
      city: '',
      profilePictureUrl: null,
      parentClientId: null,
      password: defaultPassword,
    },
  })

  const nationalIdType = watch('nationalIdType')

  const IDENTITY_LABELS = {
    0: 'رقم البطاقة الشخصية',
    1: 'رقم جواز السفر',
    2: 'رقم السجل التجاري',
  } as const

  const nationalIdLabel = IDENTITY_LABELS[nationalIdType ?? 0] ?? 'رقم الهوية'

  useEffect(() => {
    if (!touchedFields.nationalId && submitCount === 0) return

    trigger('nationalId')
  }, [nationalIdType, submitCount, touchedFields.nationalId, trigger])

  useEffect(() => {
    if (!isSubMerchantAdd || !currentMerchantOption) return

    setValue('parentClientId', currentMerchantOption, { shouldDirty: false })
    setValue('nationalIdType', 0, { shouldDirty: false })
  }, [currentMerchantOption, isSubMerchantAdd, setValue])

  useEffect(() => {
    let active = true

    const loadLookup = async () => {
      setLookupLoading(true)
      try {
        const data = await fetchLookup(lookupType)

        if (active) {
          setLookupOptions(data)
        }
      } finally {
        if (active) {
          setLookupLoading(false)
        }
      }
    }

    loadLookup()

    return () => {
      active = false
    }
  }, [fetchLookup, lookupType])

  useEffect(() => {
    if (!client || isAdd || lookupLoading) return

    const parentLookup = resolveParentLookup(client, lookupOptions)

    reset(mapClientToRegisterFormValues(client, parentLookup))
  }, [client, isAdd, lookupLoading, lookupOptions, reset])

  const onValidSubmit = async (data: RegisterFormValues) => {
    if (!onSubmit) return

    await onSubmit(data, (field, message) => {
      setError(field, { type: 'server', message })
    })
  }

  useImperativeHandle(ref, () => ({
    submit: handleSubmit(onValidSubmit),
    isDirty,
    isSubmitting,
    resetForm: () => reset(),
  }))

  useEffect(() => {
    onFormStateChange?.({ isDirty, isSubmitting })
  }, [isDirty, isSubmitting, onFormStateChange])

  const shouldShowParentField =
    isSubMerchantAdd ||
    (variant !== 'merchants' &&
      (variant !== 'users' ||
        effectiveClientType === ClientType.Charger ||
        effectiveClientType === ClientType.ProfitAccount ||
        effectiveClientType === ClientType.Employee))

  const shouldShowOrganizationName =
    variant !== 'users' && variant !== 'merchants' && effectiveClientType !== ClientType.Client

  return (
    <Box component="form" noValidate onSubmit={onSubmit ? handleSubmit(onValidSubmit) : undefined}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            label="الاسم الأول"
            {...register('firstName')}
            disabled={isView}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <TextField
            fullWidth
            size="small"
            label="الاسم الثاني"
            {...register('secondName')}
            disabled={isView}
            error={!!errors.secondName}
            helperText={errors.secondName?.message}
          />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            label="الاسم الثالث"
            {...register('thirdName')}
            disabled={isView}
            error={!!errors.thirdName}
            helperText={errors.thirdName?.message}
          />
          <TextField
            fullWidth
            size="small"
            label="اسم العائلة"
            {...register('lastName')}
            disabled={isView}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
        </Stack>

        <Divider />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            label="رقم الهاتف"
            {...register('phoneNumber')}
            disabled={isView}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber?.message}
          />

          {!isSubMerchantViewEdit && (
            <TextField
              fullWidth
              size="small"
              label="البريد الإلكتروني"
              {...register('email')}
              disabled={isView}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        </Stack>

        {shouldShowParentField && (
          <ControlledAutocomplete<RegisterFormValues, LookupDto>
            control={control}
            name="parentClientId"
            label={parentLabel}
            options={parentOptions}
            loading={lookupLoading}
            disabled={isView || isSubMerchantAdd}
            textFieldProps={{ fullWidth: true, size: 'small' }}
          />
        )}

        {canShowCommissionRate && (
          <TextField
            fullWidth
            size="small"
            label="مقدار العمولة"
            value={commissionData ? String(commissionData.commissionRate) : ''}
            disabled
            InputProps={{
              startAdornment: <InputAdornment position="end">%</InputAdornment>,
              endAdornment: commissionLoading ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined,
            }}
          />
        )}

        {isAdd && (
          <>
            <TextField
              fullWidth
              size="small"
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                      <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              size="small"
              variant="text"
              startIcon={<Icon icon="mdi:refresh" />}
              onClick={() => setValue('password', generatePassword(), { shouldValidate: true })}
              disabled={isView}
            >
              توليد كلمة مرور جديدة
            </Button>
          </>
        )}

        {shouldShowOrganizationName ? (
          <TextField
            fullWidth
            size="small"
            label="اسم المؤسسة"
            {...register('organizationName')}
            disabled={isView}
            error={!!errors.organizationName}
            helperText={errors.organizationName?.message}
          />
        ) : null}

        {!isSubMerchantViewEdit && (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="nationalIdType"
              control={control}
              render={({ field }) => {
                if (variant === 'users') {
                  return (
                    <FormControl
                      fullWidth
                      size="small"
                      error={!!errors.nationalIdType}
                      disabled={isView}
                    >
                      <InputLabel id="identity-type-label">نوع الهوية</InputLabel>
                      <Select
                        {...field}
                        labelId="identity-type-label"
                        label="نوع الهوية"
                        value={field.value ?? 0}
                        onChange={e => field.onChange(Number(e.target.value))}
                      >
                        <MenuItem value={0}>بطاقة شخصية</MenuItem>
                        <MenuItem value={1}>جواز سفر</MenuItem>
                      </Select>
                    </FormControl>
                  )
                }

                const isCustomer = effectiveClientType === ClientType.Client
                const isSubMerchantIdentity = variant === 'merchants'
                const disabled = isView || !isCustomer

                if (isSubMerchantIdentity) {
                  return (
                    <FormControl
                      fullWidth
                      size="small"
                      error={!!errors.nationalIdType}
                      disabled={isView}
                    >
                      <InputLabel id="identity-type-label">نوع الهوية</InputLabel>
                      <Select
                        {...field}
                        labelId="identity-type-label"
                        label="نوع الهوية"
                        value={field.value ?? 0}
                        onChange={e => field.onChange(Number(e.target.value))}
                      >
                        <MenuItem value={0}>بطاقة شخصية</MenuItem>
                        <MenuItem value={1}>جواز سفر</MenuItem>
                      </Select>
                    </FormControl>
                  )
                }

                return (
                  <FormControl
                    fullWidth
                    size="small"
                    error={!!errors.nationalIdType}
                    disabled={disabled}
                  >
                    <InputLabel id="identity-type-label">نوع الهوية</InputLabel>
                    <Select
                      {...field}
                      labelId="identity-type-label"
                      label="نوع الهوية"
                      value={field.value ?? (isCustomer ? 0 : 2)}
                      onChange={e => field.onChange(Number(e.target.value))}
                    >
                      {isCustomer ? (
                        [
                          <MenuItem key="id-0" value={0}>
                            بطاقة شخصية
                          </MenuItem>,
                          <MenuItem key="id-1" value={1}>
                            جواز سفر
                          </MenuItem>,
                        ]
                      ) : (
                        <MenuItem key="id-2" value={2}>
                          السجل التجاري
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )
              }}
            />

            <TextField
              fullWidth
              size="small"
              label={nationalIdLabel}
              {...register('nationalId')}
              disabled={isView}
              error={!!errors.nationalId}
              helperText={errors.nationalId?.message}
            />
          </Stack>
        )}

        <Divider />

        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small" error={!!errors.city} disabled={isView}>
              <InputLabel id="city-label">المدينة</InputLabel>
              <Select {...field} labelId="city-label" label="المدينة">
                {HADHRAMAUT_CITIES.map(city => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <TextField
          fullWidth
          size="small"
          label="العنوان"
          {...register('address')}
          disabled={isView}
          error={!!errors.address}
          helperText={errors.address?.message}
        />

        <Divider />

        {client?.id && (
          <UploadClientAttachmentsDialog
            open={openAttachmentsDialog}
            clientId={client.id}
            clientType={effectiveClientType}
            onClose={() => setOpenAttachmentsDialog(false)}
            accept=".pdf,image/*"
            maxFiles={10}
          />
        )}
      </Stack>
    </Box>
  )
})

export default RegisterForm
