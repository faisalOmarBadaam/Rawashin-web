'use client'

import type { ReactNode } from 'react'

import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import Autocomplete, { type AutocompleteProps } from '@mui/material/Autocomplete'
import TextField, { type TextFieldProps } from '@mui/material/TextField'

type DefaultOption = {
  id?: string | number
  name?: string
}

type ControlledAutocompleteProps<
  TFieldValues extends FieldValues,
  TOption extends DefaultOption
> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: ReactNode
  options: TOption[]
  loading?: boolean
  disabled?: boolean
  placeholder?: string
  getOptionLabel?: (option: TOption) => string
  isOptionEqualToValue?: (option: TOption, value: TOption) => boolean
  textFieldProps?: TextFieldProps
  autocompleteProps?: Omit<
    AutocompleteProps<TOption, false, false, false>,
    'options' | 'value' | 'onChange' | 'renderInput'
  >
}

const defaultGetOptionLabel = <TOption extends DefaultOption>(option: TOption) => {
  if (typeof option === 'string') return option
  return option?.name ?? ''
}

const defaultIsOptionEqualToValue = <TOption extends DefaultOption>(option: TOption, value: TOption) => {
  if (option?.id !== undefined && value?.id !== undefined) {
    return option.id === value.id
  }

  return option === value
}

const ControlledAutocomplete = <
  TFieldValues extends FieldValues,
  TOption extends DefaultOption
>({
  control,
  name,
  label,
  options,
  loading,
  disabled,
  placeholder,
  getOptionLabel = defaultGetOptionLabel,
  isOptionEqualToValue = defaultIsOptionEqualToValue,
  textFieldProps,
  autocompleteProps
}: ControlledAutocompleteProps<TFieldValues, TOption>) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState }) => (
      <Autocomplete
        {...autocompleteProps}
        options={options}
        value={field.value ?? null}
        loading={loading}
        disabled={disabled}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        onChange={(_, value) => field.onChange(value)}
        onBlur={field.onBlur}
        renderInput={params => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            {...textFieldProps}
          />
        )}
      />
    )}
  />
)

export default ControlledAutocomplete
