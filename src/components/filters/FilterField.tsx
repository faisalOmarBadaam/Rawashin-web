'use client'

import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'

import type { FilterFieldSchema } from './filterSchema'

type Props<TQuery extends Record<string, unknown>> = {
  field: FilterFieldSchema<TQuery>
  value: unknown
  onChange: (value: unknown) => void
}

export default function FilterField<TQuery extends Record<string, unknown>>({
  field,
  value,
  onChange,
}: Props<TQuery>) {
  if (field.type === 'select') {
    return (
      <TextField
        select
        size="small"
        label={field.label}
        value={value ?? 'all'}
        onChange={event => onChange(event.target.value === 'all' ? undefined : event.target.value)}
      >
        <MenuItem value="all">الكل</MenuItem>
        {field.options?.map(option => (
          <MenuItem key={String(option.value)} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    )
  }

  if (field.type === 'date') {
    return (
      <TextField
        size="small"
        type="date"
        label={field.label}
        InputLabelProps={{ shrink: true }}
        value={typeof value === 'string' ? value : ''}
        onChange={event => onChange(event.target.value || undefined)}
      />
    )
  }

  return (
    <TextField
      size="small"
      label={field.label}
      placeholder={field.placeholder}
      value={typeof value === 'string' ? value : ''}
      onChange={event => onChange(event.target.value || undefined)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <i className="ri-search-line" />
          </InputAdornment>
        ),
      }}
    />
  )
}
