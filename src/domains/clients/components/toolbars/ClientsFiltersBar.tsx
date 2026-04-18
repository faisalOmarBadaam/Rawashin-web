'use client'

import { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

import ControlledAutocomplete from '@/components/ControlledAutocomplete'
import FilterResetButton from '@/components/filters/FilterResetButton'
import FiltersBar from '@/components/filters/FiltersBar'
import { useClientsStore } from '@/contexts/clients/clients.store'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import { ClientType, type LookupDto } from '@/types/api/clients'

const CLIENT_TYPE_OPTIONS = [
  { value: ClientType.Client, label: 'مستفيد' },
  { value: ClientType.Merchant, label: 'نقطة بيع' },
  { value: ClientType.Partner, label: 'شريك' },
]

const DEFAULT_FILTERS = {
  Search: undefined,
  ClientType: ClientType.Client,
  IsActive: undefined,
  IsReceivedCard: undefined,
  ParentsOnly: undefined,
  ParentClientId: undefined,
}

export default function ClientsFiltersBar() {
  const { query, setQuery, clientLookup } = useClientsStore()

  const { control, watch, setValue } = useForm<{ parentClient: LookupDto | null }>({
    defaultValues: { parentClient: null },
  })

  const [search, setSearch] = useState(query.Search ?? '')
  const [partnerOptions, setPartnerOptions] = useState<LookupDto[]>([])
  const [parentLookupLoading, setParentLookupLoading] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 400)
  const selectedParentClient = watch('parentClient')
  const clientType = query.ClientType ?? ClientType.Client
  const showParentsOnlyFilter = [ClientType.Merchant, ClientType.Partner].includes(clientType)
  const showParentLookup = clientType === ClientType.Client

  useEffect(() => {
    setQuery({ Search: debouncedSearch || undefined }, { resetPage: true })
  }, [debouncedSearch, setQuery])

  useEffect(() => {
    if (!showParentLookup) {
      setValue('parentClient', null)
      if (query.ParentClientId !== undefined) {
        setQuery({ ParentClientId: undefined }, { resetPage: true })
      }
      return
    }

    let active = true

    const loadPartners = async () => {
      try {
        setParentLookupLoading(true)
        const data = await clientLookup(ClientType.Partner)

        if (active) {
          setPartnerOptions(data)
        }
      } finally {
        if (active) {
          setParentLookupLoading(false)
        }
      }
    }

    loadPartners()

    return () => {
      active = false
    }
  }, [showParentLookup, clientLookup, query.ParentClientId, setQuery, setValue])

  useEffect(() => {
    if (!showParentLookup) return

    if (!query.ParentClientId) {
      setValue('parentClient', null)
      return
    }

    const selected = partnerOptions.find(option => option.id === query.ParentClientId) ?? {
      id: query.ParentClientId,
      name: query.ParentClientId,
    }

    setValue('parentClient', selected)
  }, [showParentLookup, partnerOptions, query.ParentClientId, setValue])

  useEffect(() => {
    if (!showParentLookup) return

    const nextParentClientId = selectedParentClient?.id || undefined

    if (nextParentClientId !== query.ParentClientId) {
      setQuery({ ParentClientId: nextParentClientId }, { resetPage: true })
    }
  }, [showParentLookup, selectedParentClient?.id, query.ParentClientId, setQuery])

  useEffect(() => {
    if (clientType !== ClientType.Client && query.IsReceivedCard !== undefined) {
      setQuery({ IsReceivedCard: undefined }, { resetPage: true })
    }
  }, [clientType, query.IsReceivedCard, setQuery])

  useEffect(() => {
    if (!showParentsOnlyFilter && query.ParentsOnly !== undefined) {
      setQuery({ ParentsOnly: undefined }, { resetPage: true })
    }
  }, [showParentsOnlyFilter, query.ParentsOnly, setQuery])

  const receivedCardDisabled = clientType !== ClientType.Client

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
    Boolean(query.ParentClientId) ||
    query.IsActive !== undefined ||
    query.IsReceivedCard !== undefined ||
    query.ParentsOnly !== undefined ||
    query.ClientType !== ClientType.Client

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
        <InputLabel id="client-type-label">نوع العميل</InputLabel>
        <Select
          labelId="client-type-label"
          value={clientType}
          label="نوع العميل"
          onChange={event =>
            setQuery({ ClientType: Number(event.target.value) as ClientType }, { resetPage: true })
          }
        >
          {clientTypeOptions}
        </Select>
      </FormControl>

      {showParentLookup && (
        <Box sx={{ minWidth: 260 }}>
          <ControlledAutocomplete<{ parentClient: LookupDto | null }, LookupDto>
            control={control}
            name="parentClient"
            label="الجهة الرئيسية"
            options={partnerOptions}
            loading={parentLookupLoading}
            placeholder="اختر الجهة الرئيسية"
            textFieldProps={{ size: 'small' }}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="status-label">حالة الحساب</InputLabel>
          <Select
            labelId="status-label"
            label="حالة الحساب"
            value={
              query.IsActive === true ? 'active' : query.IsActive === false ? 'inactive' : 'all'
            }
            onChange={e => {
              const value = e.target.value
              setQuery(
                {
                  IsActive: value === 'active' ? true : value === 'inactive' ? false : undefined,
                },
                { resetPage: true },
              )
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="active">نشط</MenuItem>
            <MenuItem value="inactive">موقوف</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }} disabled={receivedCardDisabled}>
          <InputLabel id="received-card-label">حالة البطاقة</InputLabel>
          <Select
            labelId="received-card-label"
            label="حالة البطاقة"
            value={
              query.IsReceivedCard === true
                ? 'received'
                : query.IsReceivedCard === false
                  ? 'not_received'
                  : 'all'
            }
            onChange={e => {
              const value = e.target.value
              setQuery(
                {
                  IsReceivedCard:
                    value === 'received' ? true : value === 'not_received' ? false : undefined,
                },
                { resetPage: true },
              )
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="received">استلم البطاقة</MenuItem>
            <MenuItem value="not_received">لم يستلم البطاقة</MenuItem>
          </Select>
        </FormControl>

        {showParentsOnlyFilter && (
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
        )}

        {hasActiveFilters && (
          <FilterResetButton
            onReset={() => {
              setSearch('')
              setValue('parentClient', null)
              setQuery(DEFAULT_FILTERS, { resetPage: true })
            }}
          />
        )}
      </Box>
    </FiltersBar>
  )
}
