import type {
  Dispatch,
  HTMLInputTypeAttribute,
  ReactNode,
  SetStateAction,
} from 'react'
import { useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import CloseIcon from '@mui/icons-material/Close'

type FieldName<TValues> = Extract<keyof TValues, string>

export type FormDialogValues = Record<string, string>

export type FormDialogContext<TValues extends FormDialogValues> = {
  values: TValues
  setValue: <TName extends FieldName<TValues>>(
    name: TName,
    value: TValues[TName]
  ) => void
  setValues: Dispatch<SetStateAction<TValues>>
  touched: Partial<Record<FieldName<TValues>, boolean>>
  setTouched: Dispatch<
    SetStateAction<Partial<Record<FieldName<TValues>, boolean>>>
  >
  loading: boolean
}

type TextDialogField<TValues extends FormDialogValues> = {
  kind?: 'text'
  name: FieldName<TValues>
  label: string
  fieldType?: HTMLInputTypeAttribute
  placeholder?: string
  autoComplete?: string
  disabled?: boolean | ((context: FormDialogContext<TValues>) => boolean)
  required?: boolean | string
  multiline?: boolean
  rows?: number
  autoFocus?: boolean
  shrink?: boolean
  helperText?:
    | ReactNode
    | ((context: FormDialogContext<TValues>) => ReactNode)
  reserveHelperTextSpace?: boolean
  validate?: (value: string, values: TValues) => string | undefined
  renderEndAdornment?: (context: FormDialogContext<TValues>) => ReactNode
  onValueChange?: (
    value: string,
    context: FormDialogContext<TValues>
  ) => void
}

type CustomDialogField<TValues extends FormDialogValues> = {
  kind: 'custom'
  id: string
  render: (context: FormDialogContext<TValues>) => ReactNode
}

export type FormDialogField<TValues extends FormDialogValues> =
  | TextDialogField<TValues>
  | CustomDialogField<TValues>

type FormDialogProps<TValues extends FormDialogValues> = {
  open: boolean
  title: string
  description?: string
  icon?: ReactNode
  initialValues: TValues
  fields: FormDialogField<TValues>[]
  loading?: boolean
  errorMessage?: string
  submitLabel?: string
  loadingLabel?: string
  cancelLabel?: string
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  resetKey?: string | number
  onClose: () => void
  onSubmit: (values: TValues) => Promise<void> | void
}

type FormDialogBodyProps<TValues extends FormDialogValues> = Omit<
  FormDialogProps<TValues>,
  'open' | 'maxWidth' | 'resetKey'
>

function FormDialogBody<TValues extends FormDialogValues>({
  title,
  description,
  icon,
  initialValues,
  fields,
  loading = false,
  errorMessage,
  submitLabel = 'حفظ',
  loadingLabel = 'جاري الحفظ...',
  cancelLabel = 'إلغاء',
  onClose,
  onSubmit,
}: FormDialogBodyProps<TValues>) {
  const theme = useTheme()

  const [values, setValues] = useState<TValues>(() => initialValues)
  const [touched, setTouched] = useState<
    Partial<Record<FieldName<TValues>, boolean>>
  >({})

  const setValue = <TName extends FieldName<TValues>>(
    name: TName,
    value: TValues[TName]
  ) => {
    setValues((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const context: FormDialogContext<TValues> = {
    values,
    setValue,
    setValues,
    touched,
    setTouched,
    loading,
  }

  const textFields = useMemo(
    () =>
      fields.filter(
        (field): field is TextDialogField<TValues> =>
          field.kind !== 'custom'
      ),
    [fields]
  )

  const errors = useMemo(() => {
    const nextErrors = {} as Record<FieldName<TValues>, string>

    textFields.forEach((field) => {
      const value = values[field.name] ?? ''

      if (field.required && !String(value).trim()) {
        nextErrors[field.name] =
          typeof field.required === 'string'
            ? field.required
            : `${field.label} مطلوب`

        return
      }

      nextErrors[field.name] = field.validate?.(value, values) ?? ''
    })

    return nextErrors
  }, [textFields, values])

  const canSubmit =
    !loading && textFields.every((field) => !errors[field.name])

  const handleSubmit = async () => {
    const nextTouched = {} as Partial<Record<FieldName<TValues>, boolean>>

    textFields.forEach((field) => {
      nextTouched[field.name] = true
    })

    setTouched(nextTouched)

    if (!canSubmit) return

    await onSubmit(values)
  }

  return (
    <>
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 2.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              minWidth: 0,
            }}
          >
            {icon ? (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
            ) : null}

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </Typography>

              {description ? (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mt: 0.25,
                  }}
                >
                  {description}
                </Typography>
              ) : null}
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={loading}
            size="small"
            edge="start"
            aria-label="إغلاق"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          px: 3,
          py: 3,
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'background.paper'
              : alpha(theme.palette.background.default, 0.75),
        }}
      >
        <Stack spacing={2.5}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          {fields.map((field) => {
            if (field.kind === 'custom') {
              return <Box key={field.id}>{field.render(context)}</Box>
            }

            const isDisabled =
              typeof field.disabled === 'function'
                ? field.disabled(context)
                : Boolean(field.disabled)

            const visibleError =
              touched[field.name] && Boolean(errors[field.name])

            const helperText = visibleError
              ? errors[field.name]
              : typeof field.helperText === 'function'
                ? field.helperText(context)
                : field.helperText ??
                  (field.reserveHelperTextSpace ? ' ' : undefined)

            return (
              <TextField
                key={field.name}
                label={field.label}
                value={values[field.name] ?? ''}
                fullWidth
                variant="outlined"
                type={field.fieldType ?? 'text'}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                disabled={isDisabled || loading}
                required={Boolean(field.required)}
                multiline={field.multiline}
                rows={field.rows}
                autoFocus={field.autoFocus}
                error={visibleError}
                helperText={helperText}
                onBlur={() =>
                  setTouched((previous) => ({
                    ...previous,
                    [field.name]: true,
                  }))
                }
                onChange={(event) => {
                  const nextValue = event.target.value
                  const nextValues = {
                    ...values,
                    [field.name]: nextValue,
                  } as TValues

                  setValues(nextValues)

                  field.onValueChange?.(nextValue, {
                    ...context,
                    values: nextValues,
                  })
                }}
                slotProps={{
                  inputLabel: {
                    shrink: field.shrink,
                  },
                  input: field.renderEndAdornment
                    ? {
                        endAdornment: field.renderEndAdornment(context),
                      }
                    : undefined,
                }}
              />
            )
          })}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          justifyContent: 'flex-start',
          bgcolor: 'background.paper',
        }}
      >
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{
            minWidth: 96,
            fontWeight: 700,
          }}
        >
          {loading ? loadingLabel : submitLabel}
        </Button>

        <Button
          variant="text"
          onClick={onClose}
          disabled={loading}
          sx={{
            minWidth: 96,
            fontWeight: 700,
          }}
        >
          {cancelLabel}
        </Button>
      </DialogActions>
    </>
  )
}

export default function FormDialog<TValues extends FormDialogValues>({
  open,
  title,
  description,
  icon,
  initialValues,
  fields,
  loading = false,
  errorMessage,
  submitLabel = 'حفظ',
  loadingLabel = 'جاري الحفظ...',
  cancelLabel = 'إلغاء',
  maxWidth = 'sm',
  resetKey,
  onClose,
  onSubmit,
}: FormDialogProps<TValues>) {
  const theme = useTheme()

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth={maxWidth}
      slotProps={{
        paper: {
          sx: {
            textAlign: 'right',
            borderRadius: 3,
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: theme.shadows[24],
            overflow: 'hidden',
          },
        },
        backdrop: {
          sx: {
            bgcolor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.black, 0.72)
                : alpha(theme.palette.common.black, 0.42),
          },
        },
      }}
    >
      {open ? (
        <FormDialogBody
          key={String(resetKey ?? 'form-dialog')}
          title={title}
          description={description}
          icon={icon}
          initialValues={initialValues}
          fields={fields}
          loading={loading}
          errorMessage={errorMessage}
          submitLabel={submitLabel}
          loadingLabel={loadingLabel}
          cancelLabel={cancelLabel}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  )
}