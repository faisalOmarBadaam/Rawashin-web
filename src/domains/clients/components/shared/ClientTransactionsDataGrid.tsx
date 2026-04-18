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
import RowActionsMenu from '@/components/datagrid/RowActionsMenu'
import TransactionRefundDialog from '@/components/dialogs/TransactionRefundDialog'
import FiltersBar from '@/components/filters/FiltersBar'
import { useClientsStore } from '@/contexts/clients/clients.store'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'
import useDebouncedValue from '@/hooks/useDebouncedValue'

import { TransactionsApi } from '@/libs/api/modules/transactions.api'
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
import { exportTransactionsToExcel } from '@/utils/excel/exportTransactionsToExcel'

import { ClientType } from '@/types/api/clients'

import type { TransactionAccountFilter } from '@/utils/transactionAccountFilter'

type Props = {
  clientId: string
}

export default function ClientTransactionsDataGrid({ clientId }: Props) {
  const lookupChildren = useClientsStore(s => s.lookupChildren)
  const selectedClient = useClientsStore(s => s.selectedClient)
  const fetchClientById = useClientsStore(s => s.fetchClientById)
  const { list, totalCount, loading, error, query, setQuery, fetchClientTransactions } =
    useTransactionsStore()

  const [search, setSearch] = useState(query.Search ?? '')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [exporting, setExporting] = useState(false)
  const [childrenOptions, setChildrenOptions] = useState<Array<{ id: string; name: string }>>([])
  const [selectedClientId, setSelectedClientId] = useState(clientId)
  const [accountFilter, setAccountFilter] = useState<TransactionAccountFilter>('current')

  const [refundOpen, setRefundOpen] = useState(false)
  const [refundRefId, setRefundRefId] = useState<string>('')

  const debouncedSearch = useDebouncedValue(search, 400)
  const effectiveClientId = selectedClientId || clientId
  const isClientTypeClient =
    selectedClient?.id === effectiveClientId && selectedClient.clientType === ClientType.Client
  const availableTransactionTypes = getTransactionTypesForAccountFilter(accountFilter, {
    excludeSettlement: isClientTypeClient,
  })
  const visibleTotalCount = useMemo(() => {
    if (accountFilter === 'current' && !query.TransactionType) {
      return list.length
    }

    return totalCount
  }, [accountFilter, query.TransactionType, totalCount, list.length])

  useEffect(() => {
    let mounted = true

    const loadChildren = async () => {
      try {
        const data = await lookupChildren(clientId)
        if (mounted) {
          setChildrenOptions(data ?? [])
        }
      } catch {
        if (mounted) {
          setChildrenOptions([])
        }
      }
    }

    setSelectedClientId(clientId)
    loadChildren()

    return () => {
      mounted = false
    }
  }, [clientId, lookupChildren])

  useEffect(() => {
    fetchClientById(effectiveClientId)
  }, [effectiveClientId, fetchClientById])

  useEffect(() => {
    if (!isClientTypeClient || query.TransactionType !== 'Settlement') return

    setQuery({ TransactionType: undefined }, { resetPage: true })
  }, [isClientTypeClient, query.TransactionType, setQuery])

  const toLocalDateInputValue = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    const from = toLocalDateInputValue(yesterday)
    const to = toLocalDateInputValue(today)

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
    if (!fromDate || !toDate) return

    setQuery(
      {
        FromDate: `${fromDate}T00:00:00`,
        ToDate: `${toDate}T23:59:59.999`,
      },
      { resetPage: true },
    )
  }

  useEffect(() => {
    fetchClientTransactions(effectiveClientId)
  }, [
    effectiveClientId,
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

    cols.push({
      field: 'actions',
      headerName: 'الإجراءات',
      width: 100,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => (
        <RowActionsMenu
          module="transactions"
          entityId={params.row.id || params.row.referenceId || ''}
          onRefund={
            params.row.referenceId
              ? () => {
                  setRefundRefId(params.row.referenceId as string)
                  setRefundOpen(true)
                }
              : undefined
          }
        />
      ),
    })

    return cols
  }, [hasMarchantName])

  const handleExport = async () => {
    if (exporting) return

    setExporting(true)

    const from = query.FromDate ? query.FromDate.split('T')[0] : ''
    const to = query.ToDate ? query.ToDate.split('T')[0] : ''
    const fileName = `transactions_${effectiveClientId}_${from || 'all'}_${to || 'all'}.xlsx`

    const originalPageNumber = query.PageNumber ?? 1
    const originalPageSize = query.PageSize ?? 10

    try {
      const firstPage = await TransactionsApi.getClientTransactions(effectiveClientId, {
        ...query,
        PageNumber: 1,
        PageSize: originalPageSize,
      })

      const initialRows = firstPage.items ?? []
      const allRows: TransactionForClientDto[] = [
        ...filterTransactionsByAccountFilter(initialRows, accountFilter, query.TransactionType),
      ]
      const allPages = Math.max(1, Math.ceil((firstPage.totalCount ?? 0) / originalPageSize))

      for (let page = 2; page <= allPages; page += 1) {
        const pageResult = await TransactionsApi.getClientTransactions(effectiveClientId, {
          ...query,
          PageNumber: page,
          PageSize: originalPageSize,
        })

        if (pageResult.items?.length) {
          allRows.push(
            ...filterTransactionsByAccountFilter(
              pageResult.items,
              accountFilter,
              query.TransactionType,
            ),
          )
        }
      }

      exportTransactionsToExcel({
        rows: allRows,
        hasMarchantName: allRows.some(row => !!row.marchantName),
        fileName,
      })
    } finally {
      setQuery(
        {
          PageNumber: originalPageNumber,
          PageSize: originalPageSize,
        },
        { resetPage: false },
      )
      setExporting(false)
    }
  }

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
          select
          size="small"
          label="الحساب"
          value={selectedClientId}
          onChange={e => {
            const nextClientId = e.target.value

            setSelectedClientId(nextClientId)
            setQuery({}, { resetPage: true })
          }}
          sx={{ minWidth: 240 }}
        >
          <MenuItem value={clientId}>الحساب الحالي</MenuItem>
          {childrenOptions
            .filter(option => option.id !== clientId)
            .map(option => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
        </TextField>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel shrink id="client-transaction-account-filter-label">
            نوع الحساب
          </InputLabel>

          <Select<TransactionAccountFilter>
            labelId="client-transaction-account-filter-label"
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

        <Button variant="contained" onClick={applyDateFilter}>
          تطبيق الفلتر
        </Button>
        <Button
          variant="outlined"
          onClick={handleExport}
          disabled={loading || exporting || totalCount === 0}
        >
          تصدير Excel
        </Button>
      </FiltersBar>

      <Box mb={6} mt={6}>
        {query.FromDate && query.ToDate && (
          <ChargerSummaryCompact
            clientId={effectiveClientId}
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
        onRetry={() => fetchClientTransactions(effectiveClientId)}
      />

      <TransactionRefundDialog
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        clientId={effectiveClientId}
        defaultReferenceId={refundRefId}
      />
    </Box>
  )
}
