'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

import FilterResetButton from '@/components/filters/FilterResetButton'
import FiltersBar from '@/components/filters/FiltersBar'
import { useAuditLogsStore } from '@/contexts/audit-logs/auditLogs.store'
import useDateSearchFilters from '@/hooks/useDateSearchFilters'
import useDebouncedValue from '@/hooks/useDebouncedValue'

import type { AuditLogsQueryParams } from '@/types/api/auditLogs'

const ACTION_OPTIONS: Array<{ value: NonNullable<AuditLogsQueryParams['Action']>; label: string }> =
  [
    { value: 'Insert', label: 'Insert' },
    { value: 'Update', label: 'Update' },
    { value: 'Delete', label: 'Delete' },
  ]

export default function AuditLogsFiltersBar() {
  const { query, setQuery } = useAuditLogsStore()

  const { search, setSearch, fromDate, setFromDate, toDate, setToDate, resetFilters } =
    useDateSearchFilters(query, setQuery)
  const [tableName, setTableName] = useState(query.TableName ?? '')
  const debouncedTableName = useDebouncedValue(tableName, 400)

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(tableName) ||
    Boolean(fromDate) ||
    Boolean(toDate) ||
    query.Action !== undefined

  useEffect(() => {
    setQuery({ TableName: debouncedTableName || undefined }, { resetPage: true })
  }, [debouncedTableName, setQuery])

  return (
    <FiltersBar>
      <TextField
        size="small"
        placeholder="بحث..."
        sx={{ minWidth: 240 }}
        value={search}
        onChange={event => setSearch(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <i className="ri-search-line" />
            </InputAdornment>
          ),
        }}
      />

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="audit-log-action-label">Action</InputLabel>
        <Select
          labelId="audit-log-action-label"
          value={query.Action ?? 'all'}
          label="Action"
          onChange={event => {
            const value = event.target.value

            setQuery(
              {
                Action:
                  value === 'all'
                    ? undefined
                    : (value as NonNullable<AuditLogsQueryParams['Action']>),
              },
              { resetPage: true },
            )
          }}
        >
          <MenuItem value="all">الكل</MenuItem>
          {ACTION_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* <TextField
        size="small"
        placeholder="ابحث باسم الجدول..."
        sx={{ minWidth: 240 }}
        value={tableName}
        onChange={event => setTableName(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <i className="ri-search-line" />
            </InputAdornment>
          ),
        }}
      /> */}

      <TextField
        label="من تاريخ"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={fromDate}
        onChange={event => setFromDate(event.target.value)}
        inputProps={{ max: toDate || undefined }}
      />

      <TextField
        label="إلى تاريخ"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: fromDate || undefined }}
        value={toDate}
        onChange={event => setToDate(event.target.value)}
      />

      {hasActiveFilters && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterResetButton
            onReset={() => {
              setTableName('')
              resetFilters()
              setQuery({ Action: undefined, TableName: undefined }, { resetPage: true })
            }}
          />
        </Box>
      )}
    </FiltersBar>
  )
}
