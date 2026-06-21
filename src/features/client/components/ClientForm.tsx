import { useState, type FormEventHandler, type ReactNode } from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import PersonIcon from '@mui/icons-material/Person'
import SaveIcon from '@mui/icons-material/Save'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import type { NationalIdTypeOption } from '../types'

type CommonClientFormValues = FieldValues & {
  FirstName?: string
  SecondName?: string
  ThirdName?: string
  LastName?: string
  NationalId?: string
  NationalIdType?: number | null
  Password?: string
  PhoneNumber?: string
  City?: string
  Address?: string
  OrganizationName?: string | null
}

type ClientFormLayoutProps = {
  title: string
  subtitle: string
  isLoading: boolean
  isSaving: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  onCancel: () => void
  children: ReactNode
}

type CommonFieldProps<TFieldValues extends CommonClientFormValues> = {
  control: Control<TFieldValues>
  disabled?: boolean
}

type ClientCitySelectFieldProps<TFieldValues extends CommonClientFormValues> = CommonFieldProps<TFieldValues> & {
  cities: readonly string[]
  guardedOpen?: boolean
}

type ClientNationalIdTypeFieldProps<TFieldValues extends CommonClientFormValues> = CommonFieldProps<TFieldValues> & {
  options: readonly NationalIdTypeOption[]
}

export function ClientFormLayout({
  title,
  subtitle,
  isLoading,
  isSaving,
  onSubmit,
  onCancel,
  children,
}: ClientFormLayoutProps) {
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <PersonIcon />
        </Avatar>

        <Box>
          <Typography variant="h6">{title}</Typography>

          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                }}
              >
                {children}
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

                <Button variant="outlined" onClick={onCancel} disabled={isSaving}>
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

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography variant="subtitle1" sx={{ gridColumn: '1 / -1', fontWeight: 600 }}>
      {children}
    </Typography>
  )
}

export function ClientNameFields<TFieldValues extends CommonClientFormValues>({
  control,
  disabled,
}: CommonFieldProps<TFieldValues>) {
  return (
    <>
      <Controller
        name={'FirstName' as Path<TFieldValues>}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            value={field.value ?? ''}
            label="الاسم الأول"
            fullWidth
            disabled={disabled}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name={'SecondName' as Path<TFieldValues>}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            value={field.value ?? ''}
            label="الاسم الثاني"
            fullWidth
            disabled={disabled}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name={'ThirdName' as Path<TFieldValues>}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            value={field.value ?? ''}
            label="الاسم الثالث"
            fullWidth
            disabled={disabled}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name={'LastName' as Path<TFieldValues>}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            value={field.value ?? ''}
            label="اسم العائلة"
            fullWidth
            disabled={disabled}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </>
  )
}

export function ClientNationalIdField<TFieldValues extends CommonClientFormValues>({
  control,
  disabled,
}: CommonFieldProps<TFieldValues>) {
  return (
    <Controller
      name={'NationalId' as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          label="الهوية الوطنية"
          fullWidth
          disabled={disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  )
}

export function ClientNationalIdTypeField<TFieldValues extends CommonClientFormValues>({
  control,
  disabled,
  options,
}: ClientNationalIdTypeFieldProps<TFieldValues>) {
  return (
    <Controller
      name={'NationalIdType' as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth disabled={disabled} error={!!fieldState.error}>
          <InputLabel>نوع الهوية الوطنية</InputLabel>

          <Select
            label="نوع الهوية الوطنية"
            value={field.value ?? ''}
            onChange={(event) => {
              const value = String(event.target.value)
              field.onChange(value === '' ? null : Number(value))
            }}
            MenuProps={{
              disableScrollLock: true,
            }}
          >
            <MenuItem value="">
              <em>غير محدد</em>
            </MenuItem>

            {options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>

          {fieldState.error?.message && (
            <FormHelperText>{fieldState.error.message}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  )
}

export function ClientPasswordField<TFieldValues extends CommonClientFormValues>({
  control,
  disabled,
}: CommonFieldProps<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Controller
      name={'Password' as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          label="كلمة المرور"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          disabled={disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword(prev => !prev)}
                    onMouseDown={event => event.preventDefault()}
                    disabled={disabled}
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
  )
}

export function ClientOrganizationField<TFieldValues extends CommonClientFormValues>({
  control,
  disabled,
}: CommonFieldProps<TFieldValues>) {
  return (
    <Controller
      name={'OrganizationName' as Path<TFieldValues>}
      control={control}
      shouldUnregister
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          label="اسم المنظمة"
          fullWidth
          disabled={disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  )
}

export function ClientPhoneField<TFieldValues extends CommonClientFormValues>({
  control,
  disabled,
}: CommonFieldProps<TFieldValues>) {
  return (
    <Controller
      name={'PhoneNumber' as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          label="الهاتف"
          fullWidth
          disabled={disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  )
}

export function ClientCitySelectField<TFieldValues extends CommonClientFormValues>({
  control,
  disabled,
  cities,
  guardedOpen = true,
}: ClientCitySelectFieldProps<TFieldValues>) {
  const [open, setOpen] = useState(false)

  return (
    <Controller
      name={'City' as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth disabled={disabled} error={!!fieldState.error}>
          <InputLabel id="city-select-label">المدينة</InputLabel>

          <Select
            labelId="city-select-label"
            label="المدينة"
            value={field.value ?? ''}
            open={guardedOpen ? open : undefined}
            onClose={guardedOpen ? () => setOpen(false) : undefined}
            onChange={(event) => {
              field.onChange(String(event.target.value))
              if (guardedOpen) setOpen(false)
            }}
            SelectDisplayProps={guardedOpen ? {
              onMouseDown: (event) => {
                event.preventDefault()
              },
              onClick: () => {
                requestAnimationFrame(() => {
                  setOpen(true)
                })
              },
              onKeyDown: (event) => {
                if (
                  event.key === 'Enter' ||
                  event.key === ' ' ||
                  event.key === 'ArrowDown'
                ) {
                  event.preventDefault()
                  setOpen(true)
                }
              },
            } : undefined}
            MenuProps={guardedOpen ? {
              disableScrollLock: true,
              autoFocus: false,
              disableAutoFocusItem: true,
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
              marginThreshold: 0,
              slotProps: {
                paper: {
                  sx: {
                    mt: 0.5,
                    maxHeight: 320,
                  },
                },
              },
            } : {
              disableScrollLock: true,
              disableAutoFocusItem: true,
            }}
          >
            <MenuItem value="">
              <em>غير محدد</em>
            </MenuItem>

            {cities.map(city => (
              <MenuItem key={city} value={city}>
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
  )
}

export function ClientAddressField<TFieldValues extends CommonClientFormValues>({
  control,
  disabled,
}: CommonFieldProps<TFieldValues>) {
  return (
    <Controller
      name={'Address' as Path<TFieldValues>}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          label="العنوان"
          fullWidth
          disabled={disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  )
}

export function SectionDivider() {
  return <Divider sx={{ gridColumn: '1 / -1', my: 1 }} />
}