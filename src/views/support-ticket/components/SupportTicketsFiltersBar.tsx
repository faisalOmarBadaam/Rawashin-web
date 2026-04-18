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
import useDebouncedValue from '@/hooks/useDebouncedValue'

import { useSupportTicketsStore } from '@/contexts/support-ticket/supportTickets.store'

import { SupportTicketCategory, SupportTicketStatus } from '@/types/api/supportTickets'

const CATEGORY_OPTIONS = [
  { value: SupportTicketCategory.Issue, label: 'مشكلة' },
  { value: SupportTicketCategory.Suggestion, label: 'اقتراح' },
  { value: SupportTicketCategory.Complaint, label: 'شكوى' },
  { value: SupportTicketCategory.Other, label: 'أخرى' },
]

const STATUS_OPTIONS = [
  { value: SupportTicketStatus.Open, label: 'جديدة' },
  { value: SupportTicketStatus.InProgress, label: 'قيد المعالجة' },
  { value: SupportTicketStatus.Complete, label: 'مغلقة' },
]

const DEFAULT_FILTERS = {
  Search: undefined,
  Category: undefined,
  Status: undefined,
}

export default function SupportTicketsFiltersBar() {
  const { query, setQuery } = useSupportTicketsStore()

  const [search, setSearch] = useState(query.Search ?? '')
  const debouncedSearch = useDebouncedValue(search, 400)

  useEffect(() => {
    setQuery({ Search: debouncedSearch || undefined }, { resetPage: true })
  }, [debouncedSearch, setQuery])

  const hasActiveFilters =
    Boolean(search) || query.Category !== undefined || query.Status !== undefined

  const categoryOptions = useMemo(
    () =>
      CATEGORY_OPTIONS.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      )),
    [],
  )

  const statusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      )),
    [],
  )

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
        <InputLabel id="ticket-category-label">التصنيف</InputLabel>
        <Select
          labelId="ticket-category-label"
          value={query.Category ?? 'all'}
          label="التصنيف"
          onChange={event => {
            const value = event.target.value
            setQuery(
              { Category: value === 'all' ? undefined : (Number(value) as SupportTicketCategory) },
              { resetPage: true },
            )
          }}
        >
          <MenuItem value="all">الكل</MenuItem>
          {categoryOptions}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="ticket-status-label">الحالة</InputLabel>
        <Select
          labelId="ticket-status-label"
          value={query.Status ?? 'all'}
          label="الحالة"
          onChange={event => {
            const value = event.target.value
            setQuery(
              { Status: value === 'all' ? undefined : (Number(value) as SupportTicketStatus) },
              { resetPage: true },
            )
          }}
        >
          <MenuItem value="all">الكل</MenuItem>
          {statusOptions}
        </Select>
      </FormControl>

      {hasActiveFilters && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterResetButton
            onReset={() => {
              setSearch('')
              setQuery(DEFAULT_FILTERS, { resetPage: true })
            }}
          />
        </Box>
      )}
    </FiltersBar>
  )
}
