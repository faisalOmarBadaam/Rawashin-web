'use client'

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

import FilterResetButton from '@/components/filters/FilterResetButton'
import FiltersBar from '@/components/filters/FiltersBar'
import { useSettlementsStore } from '@/contexts/settlements/settlements.store'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import { SettlementStatus } from '@/types/api/settlements'

const DEFAULT_FILTERS = {
  Search: undefined,
  Status: undefined,
  FromDate: undefined,
  ToDate: undefined,
}

const SETTLEMENT_STATUS_OPTIONS = [
  { value: SettlementStatus.New, label: 'جديدة' },
  { value: SettlementStatus.InProcess, label: 'قيد المعالجة' },
  { value: SettlementStatus.Completed, label: 'مكتمل' },
  { value: SettlementStatus.ClosedWithoutCompletion, label: 'مغلق بدون إتمام' },
]

export default function SettlementsFiltersBar() {
  const { query, setQuery } = useSettlementsStore()

  const [search, setSearch] = useState(query.Search ?? '')
  const [fromDate, setFromDate] = useState<string | undefined>(query.FromDate)
  const [toDate, setToDate] = useState<string | undefined>(query.ToDate)

  const debouncedSearch = useDebouncedValue(search, 400)

  useEffect(() => {
    setQuery({ Search: debouncedSearch || undefined }, { resetPage: true })
  }, [debouncedSearch, setQuery])

  useEffect(() => {
    setQuery(
      {
        FromDate: fromDate,
        ToDate: toDate,
      },
      { resetPage: true },
    )
  }, [fromDate, toDate, setQuery])

  const statusOptions = useMemo(
    () =>
      SETTLEMENT_STATUS_OPTIONS.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      )),
    [],
  )

  const hasActiveFilters =
    Boolean(search) || query.Status !== undefined || Boolean(fromDate) || Boolean(toDate)

  return (
    <FiltersBar>
      <TextField
        size="small"
        placeholder="بحث بالإسم"
        sx={{ minWidth: 240 }}
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <i className="ri-search-line" />
            </InputAdornment>
          ),
        }}
      />
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>الحالة</InputLabel>
        <Select
          label="الحالة"
          value={query.Status ?? 'all'}
          onChange={e =>
            setQuery(
              {
                Status: e.target.value === 'all' ? undefined : Number(e.target.value),
              },
              { resetPage: true },
            )
          }
        >
          <MenuItem value="all">الكل</MenuItem>
          {statusOptions}
        </Select>
      </FormControl>
      <TextField
        size="small"
        type="date"
        label="من تاريخ"
        InputLabelProps={{ shrink: true }}
        value={fromDate ? fromDate.substring(0, 10) : ''}
        onChange={e => setFromDate(e.target.value ? `${e.target.value}T00:00:00` : undefined)}
      />
      <TextField
        size="small"
        type="date"
        label="إلى تاريخ"
        InputLabelProps={{ shrink: true }}
        value={toDate ? toDate.substring(0, 10) : ''}
        onChange={e => setToDate(e.target.value ? `${e.target.value}T23:59:59.999` : undefined)}
      />

      {hasActiveFilters && (
        <Box>
          <FilterResetButton
            onReset={() => {
              setSearch('')
              setFromDate(undefined)
              setToDate(undefined)
              setQuery(DEFAULT_FILTERS, { resetPage: true })
            }}
          />
        </Box>
      )}
    </FiltersBar>
  )
}
