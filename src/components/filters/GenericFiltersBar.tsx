'use client'

import type { ReactNode } from 'react'

import Box from '@mui/material/Box'

import FilterField from './FilterField'
import FilterResetButton from './FilterResetButton'
import FiltersBar from './FiltersBar'
import type { FilterFieldSchema } from './filterSchema'

type Props<TQuery extends Record<string, unknown>> = {
  schema: Array<FilterFieldSchema<TQuery>>
  query: TQuery
  setQuery: (query: Partial<TQuery>, options?: { resetPage?: boolean }) => void
  actions?: ReactNode
  onReset?: () => void
}

export default function GenericFiltersBar<TQuery extends Record<string, unknown>>({
  schema,
  query,
  setQuery,
  actions,
  onReset,
}: Props<TQuery>) {
  return (
    <FiltersBar
      actions={
        <Box display="flex" alignItems="center" gap={1}>
          {onReset && <FilterResetButton onReset={onReset} />}
          {actions}
        </Box>
      }
    >
      {schema.map(field => (
        <FilterField<TQuery>
          key={String(field.key)}
          field={field}
          value={query[field.key]}
          onChange={value =>
            setQuery({ [field.key]: value } as Partial<TQuery>, { resetPage: true })
          }
        />
      ))}
    </FiltersBar>
  )
}
