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
import { useClientsStore } from '@/contexts/clients/clients.store'
import { CLIENT_STATUS_OPTIONS } from '@/domains/clients/utils/clientStatus'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import { ClientType, type ClientStatus } from '@/types/api/clients'

const DEFAULT_FILTERS = {
  Search: undefined,
  ClientType: ClientType.Merchant,
  AccountStatus: undefined,
  IsReceivedCard: undefined,
  ParentsOnly: undefined,
  ParentClientId: undefined,
}

export default function MerchantsFiltersBar() {
  const { query, setQuery } = useClientsStore()

  const [search, setSearch] = useState(query.Search ?? '')
  const debouncedSearch = useDebouncedValue(search, 400)

  useEffect(() => {
    setQuery({ Search: debouncedSearch || undefined }, { resetPage: true })
  }, [debouncedSearch, setQuery])

  const hasActiveFilters = Boolean(search) || query.AccountStatus !== undefined

  return (
    <FiltersBar>
      <TextField
        size="small"
        placeholder="بحث بالاسم، الهاتف..."
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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="status-label">حالة الحساب</InputLabel>
          <Select
            labelId="status-label"
            label="حالة الحساب"
            value={query.AccountStatus ?? 'all'}
            onChange={e => {
              const value = e.target.value
              setQuery(
                {
                  AccountStatus: value === 'all' ? undefined : (Number(value) as ClientStatus),
                  IsActive: undefined,
                },
                { resetPage: true },
              )
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            {CLIENT_STATUS_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasActiveFilters && (
          <FilterResetButton
            onReset={() => {
              setSearch('')
              setQuery(
                {
                  Search: DEFAULT_FILTERS.Search,
                  ClientType: DEFAULT_FILTERS.ClientType,
                  AccountStatus: DEFAULT_FILTERS.AccountStatus,
                  IsReceivedCard: DEFAULT_FILTERS.IsReceivedCard,
                  ParentsOnly: DEFAULT_FILTERS.ParentsOnly,
                },
                { resetPage: true },
              )
            }}
          />
        )}
      </Box>
    </FiltersBar>
  )
}
