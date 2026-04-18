'use client'

import { useEffect, useMemo, useState } from 'react'

import { FormControl, InputLabel, Select } from '@mui/material'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { type GridColDef } from '@mui/x-data-grid'

import ChargerSummaryCompact from '@/components/ChargerSummaryCompact'
import GenericDataGrid from '@/components/datagrid/GenericDataGrid'
import FiltersBar from '@/components/filters/FiltersBar'
import { useClientsStore } from '@/contexts/clients/clients.store'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import {
  filterTransactionsByAccountFilter,
  getTransactionTypesForAccountFilter,
  normalizeTransactionTypeForAccountFilter,
  transactionAccountFilterLabels,
  transactionAccountFilters,
} from '@/utils/transactionAccountFilter'

import {
  isTransactionType,
  transactionTypeLabels,
  type TransactionForClientDto,
  type TransactionType,
} from '@/types/api/transaction'

import { ClientType } from '@/types/api/clients'

import type { TransactionAccountFilter } from '@/utils/transactionAccountFilter'

type Props = {
  clientId: string
}

export default function ClientTransactionsDataGrid({ clientId }: Props) {
  const { selectedClient, fetchClientById } = useClientsStore()
  const { list, totalCount, loading, error, query, setQuery, fetchClientTransactions } =
    useTransactionsStore()

  const [search, setSearch] = useState(query.Search ?? '')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [accountFilter, setAccountFilter] = useState<TransactionAccountFilter>('current')

  const debouncedSearch = useDebouncedValue(search, 400)
  const debouncedFromDate = useDebouncedValue(fromDate, 400)
  const debouncedToDate = useDebouncedValue(toDate, 400)
  const isClientTypeClient =
    selectedClient?.id === clientId && selectedClient.clientType === ClientType.Client
  const availableTransactionTypes = getTransactionTypesForAccountFilter(accountFilter, {
    excludeSettlement: isClientTypeClient,
  })
  const visibleRows = useMemo(
    () => filterTransactionsByAccountFilter(list, accountFilter, query.TransactionType),
    [accountFilter, list, query.TransactionType],
  )
  const visibleTotalCount = useMemo(() => {
    if (accountFilter === 'current' && !query.TransactionType) {
      return visibleRows.length
    }

    return totalCount
  }, [accountFilter, query.TransactionType, totalCount, visibleRows.length])

  useEffect(() => {
    fetchClientById(clientId)
  }, [clientId, fetchClientById])

  useEffect(() => {
    if (!isClientTypeClient || query.TransactionType !== 'Settlement') return

    setQuery({ TransactionType: undefined }, { resetPage: true })
  }, [isClientTypeClient, query.TransactionType, setQuery])

  useEffect(() => {
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    const from = yesterday.toISOString().split('T')[0]
    const to = today.toISOString().split('T')[0]

    setFromDate(from)
    setToDate(to)

    setQuery(
      {
        FromDate: `${from}T00:00:00`,
        ToDate: `${to}T23:59:59`,
      },
      { resetPage: true },
    )
  }, [setQuery])

  useEffect(() => {
    setQuery({ Search: debouncedSearch || undefined }, { resetPage: true })
  }, [debouncedSearch, setQuery])

  const applyDateFilter = () => {
    if (!debouncedFromDate || !debouncedToDate) return

    setQuery(
      {
        FromDate: `${debouncedFromDate}T00:00:00`,
        ToDate: `${debouncedToDate}T23:59:59`,
      },
      { resetPage: true },
    )
  }

  useEffect(() => {
    fetchClientTransactions(clientId)
  }, [
    clientId,
    query.PageNumber,
    query.PageSize,
    query.SortBy,
    query.SortDir,
    query.Search,
    query.FromDate,
    query.ToDate,
    query.TransactionType,
    fetchClientTransactions,
  ])

  // const incomingRows = useMemo(
  //   () => list.filter(t => t.amount),
  //   [list]
  // )

  const hasMarchantName = useMemo(() => list.some(row => !!row.marchantName), [list])

  const columns = useMemo<GridColDef<TransactionForClientDto>[]>(() => {
    const cols: GridColDef<TransactionForClientDto>[] = [
      {
        field: 'asn',
        headerName: '#',
        width: 70,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
      },
      {
        field: 'referenceId',
        headerName: 'المرجع',
        flex: 1,
      },
    ]

    if (hasMarchantName) {
      cols.push({
        field: 'marchantName',
        headerName: 'نقطة البيع',
        flex: 1.2,
      })
    }

    cols.push(
      {
        field: 'amount',
        headerName: 'المبلغ',
        type: 'number',
        flex: 0.8,
        valueFormatter: v => `${(v as number).toLocaleString()} ي`,
      },
      {
        field: 'description',
        headerName: 'الوصف',
        flex: 1.5,
        valueGetter: (_, row) => row.description ?? '—',
      },
      {
        field: 'createdAt',
        headerName: 'التاريخ',
        flex: 1,
        valueFormatter: v => (v ? new Date(v as string).toLocaleString() : '-'),
      },
    )

    return cols
  }, [hasMarchantName])
  return (
    <Box mb={6} mt={6}>
      <FiltersBar>
        <TextField
          size="small"
          placeholder="بحث..."
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

        <TextField
          label="من تاريخ"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
        />

        <TextField
          label="إلى تاريخ"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={e => setToDate(e.target.value)}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel shrink id="home-client-transaction-account-filter-label">
            نوع الحساب
          </InputLabel>

          <Select<TransactionAccountFilter>
            labelId="home-client-transaction-account-filter-label"
            value={accountFilter}
            label="نوع الحساب"
            onChange={event => {
              const nextAccountFilter = event.target.value as TransactionAccountFilter

              setAccountFilter(nextAccountFilter)
              setQuery(
                {
                  TransactionType: normalizeTransactionTypeForAccountFilter(
                    nextAccountFilter,
                    query.TransactionType,
                  ),
                },
                { resetPage: true },
              )
            }}
          >
            {transactionAccountFilters.map(type => (
              <MenuItem key={type} value={type}>
                {transactionAccountFilterLabels[type]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel shrink id="transaction-type-label">
            نوع العملية
          </InputLabel>

          <Select<TransactionType | ''>
            labelId="transaction-type-label"
            value={query.TransactionType ?? ''}
            label="نوع العملية"
            disabled={accountFilter !== 'current'}
            displayEmpty
            renderValue={selected => {
              if (selected === '') return 'الكل'
              return transactionTypeLabels[selected as TransactionType]
            }}
            onChange={event => {
              const nextValue = event.target.value as TransactionType | ''

              setQuery(
                {
                  TransactionType:
                    nextValue === ''
                      ? undefined
                      : isTransactionType(nextValue)
                        ? nextValue
                        : undefined,
                },
                { resetPage: true },
              )
            }}
          >
            <MenuItem value="">الكل</MenuItem>

            {availableTransactionTypes.map(type => (
              <MenuItem key={type} value={type}>
                {transactionTypeLabels[type]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={applyDateFilter}>
          تطبيق الفلتر
        </Button>
      </FiltersBar>
      <Box mb={6} mt={6}>
        {query.FromDate && query.ToDate && (
          <ChargerSummaryCompact
            clientId={clientId}
            fromDate={query.FromDate}
            toDate={query.ToDate}
          />
        )}
      </Box>
      <GenericDataGrid<TransactionForClientDto>
        rows={list}
        columns={columns}
        loading={loading}
        totalCount={visibleTotalCount}
        query={query}
        setQuery={q => setQuery(q)}
        getRowId={row => row.id ?? `${row.referenceId ?? 'x'}-${row.createdAt}`}
        error={error}
        onRetry={() => fetchClientTransactions(clientId)}
      />
    </Box>
  )
}
