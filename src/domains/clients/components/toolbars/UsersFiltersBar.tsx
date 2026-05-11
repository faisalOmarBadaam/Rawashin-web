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
import { useClientsStore } from '@/contexts/clients/clients.store'
import { CLIENT_STATUS_OPTIONS } from '@/domains/clients/utils/clientStatus'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import { ClientType, type ClientStatus } from '@/types/api/clients'

const CLIENT_TYPE_OPTIONS = [
  { value: ClientType.Admin, label: 'إدارة النظام' },
  { value: ClientType.Charger, label: 'مستخدمين الشحن' },
  { value: ClientType.ProfitAccount, label: 'حسابات الارباح' },
  { value: ClientType.Employee, label: 'حسابات المدخلين' },
]

const DEFAULT_FILTERS = {
  Search: undefined,
  ClientType: ClientType.Admin,
  AccountStatus: undefined,
  IsReceivedCard: undefined,
  ParentsOnly: undefined,
  ParentClientId: undefined,
}

export default function UsersFiltersBar() {
  const { query, setQuery } = useClientsStore()

  const [search, setSearch] = useState(query.Search ?? '')
  const debouncedSearch = useDebouncedValue(search, 400)
  const clientType = query.ClientType ?? ClientType.Admin
  const showParentsOnlyFilter = [
    ClientType.ProfitAccount,
    ClientType.Charger,
    ClientType.Employee,
  ].includes(clientType)

  useEffect(() => {
    if (query.ClientType === undefined) {
      setQuery(
        {
          ClientType: ClientType.Admin,
        },
        { resetPage: true },
      )
    }
  }, [query.ClientType, setQuery])

  useEffect(() => {
    setQuery({ Search: debouncedSearch || undefined }, { resetPage: true })
  }, [debouncedSearch, setQuery])

  useEffect(() => {
    if (!showParentsOnlyFilter && query.ParentsOnly !== undefined) {
      setQuery({ ParentsOnly: undefined }, { resetPage: true })
    }
  }, [showParentsOnlyFilter, query.ParentsOnly, setQuery])

  const clientTypeOptions = useMemo(
    () =>
      CLIENT_TYPE_OPTIONS.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      )),
    [],
  )

  const hasActiveFilters =
    Boolean(search) ||
    query.AccountStatus !== undefined ||
    query.ParentsOnly !== undefined ||
    query.ClientType !== ClientType.Admin

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

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="client-type-label">نوع الحساب</InputLabel>
        <Select
          labelId="client-type-label"
          value={clientType}
          label="نوع الحساب"
          onChange={event =>
            setQuery({ ClientType: Number(event.target.value) as ClientType }, { resetPage: true })
          }
        >
          {clientTypeOptions}
        </Select>
      </FormControl>

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

        {/* {showParentsOnlyFilter && (
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel id="parents-only-label">نوع العلاقة</InputLabel>
            <Select
              labelId="parents-only-label"
              label="نوع العلاقة"
              value={
                query.ParentsOnly === true
                  ? 'parents_only'
                  : query.ParentsOnly === false
                    ? 'children_only'
                    : 'all'
              }
              onChange={e => {
                const value = e.target.value
                setQuery(
                  {
                    ParentsOnly:
                      value === 'parents_only'
                        ? true
                        : value === 'children_only'
                          ? false
                          : undefined,
                  },
                  { resetPage: true },
                )
              }}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="parents_only">رئيسي فقط</MenuItem>
              <MenuItem value="children_only">فرعي فقط</MenuItem>
            </Select>
          </FormControl>
        )} */}

        {hasActiveFilters && (
          <FilterResetButton
            onReset={() => {
              setSearch('')
              setQuery(DEFAULT_FILTERS, { resetPage: true })
            }}
          />
        )}
      </Box>
    </FiltersBar>
  )
}
