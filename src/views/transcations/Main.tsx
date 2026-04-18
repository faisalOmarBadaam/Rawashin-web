'use client'

import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import GenericDataGrid from '@/components/datagrid/GenericDataGrid'
import { transactionsModule } from '@/modules/transactions/transactions.module'
import TransactionsFiltersBar from './components/TransactionsFiltersBar'

import { useClientsStore } from '@/contexts/clients/clients.store'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'
import {
  filterTransactionsByAccountFilter,
  normalizeTransactionTypeForAccountFilter,
} from '@/utils/transactionAccountFilter'

import type { TransactionForClientDto } from '@/types/api/transaction'
import type { TransactionAccountFilter } from '@/utils/transactionAccountFilter'

export default function TransactionsPage() {
  const router = useRouter()
  const [accountFilter, setAccountFilter] = useState<TransactionAccountFilter>('current')

  const { list, totalCount, loading, error, query, setQuery, fetchTransactions } =
    useTransactionsStore()
  const isFiltered = Boolean(
    query.Search || query.FromDate || query.ToDate || query.TransactionType,
  )

  const rows = useMemo(
    () => filterTransactionsByAccountFilter(list, accountFilter, query.TransactionType),
    [accountFilter, list, query.TransactionType],
  )

  const visibleTotalCount = useMemo(() => {
    if (accountFilter === 'current' && !query.TransactionType) {
      return rows.length
    }

    return totalCount
  }, [accountFilter, query.TransactionType, rows.length, totalCount])

  const handleAccountFilterChange = (value: TransactionAccountFilter) => {
    setAccountFilter(value)
    setQuery(
      {
        TransactionType: normalizeTransactionTypeForAccountFilter(value, query.TransactionType),
      },
      { resetPage: true },
    )
  }

  useEffect(() => {
    if (!isFiltered) return
    fetchTransactions()
  }, [
    fetchTransactions,
    isFiltered,
    query.PageNumber,
    query.PageSize,
    query.SortBy,
    query.SortDir,
    query.Search,
    query.FromDate,
    query.ToDate,
    query.TransactionType,
  ])

  const { list: clients, fetchClients } = useClientsStore()

  useEffect(() => {
    if (clients.length === 0) {
      fetchClients()
    }
  }, [fetchClients, clients.length])

  const clientsMap = useMemo(() => {
    const safeClients = Array.isArray(clients) ? clients : []

    return Object.fromEntries(safeClients.map(c => [c.id, c.fullName ?? null]))
  }, [clients])

  const columns = useMemo(
    // TODO: legacy adapter - removable after migration verification.
    () => transactionsModule.columns.list(clientsMap, { includeMerchantColumn: true }),
    [clientsMap],
  )

  return (
    <Card>
      <CardContent>
        <Box className="flex flex-wrap gap-3 justify-between items-center mb-4">
          <Typography variant="h5">سجل العمليات</Typography>
        </Box>

        <TransactionsFiltersBar
          accountFilter={accountFilter}
          onAccountFilterChange={handleAccountFilterChange}
        />

        {!isFiltered ? (
          <Box className="text-center py-10">
            <Typography variant="body1" color="text.secondary">
              الرجاء اختيار فلترة لعرض سجل العمليات
            </Typography>
          </Box>
        ) : (
          <GenericDataGrid<TransactionForClientDto>
            rows={rows}
            columns={columns}
            loading={loading}
            totalCount={visibleTotalCount}
            query={query}
            setQuery={q => setQuery(q)}
            getRowId={row =>
              row.id ??
              (row.referenceId ? `${row.referenceId}-${row.createdAt}` : `${row.createdAt}`)
            }
            error={error}
            onRetry={fetchTransactions}
            onRowDoubleClick={row => {
              if (!row.id) return
              router.push(`/transactions/${row.id}/view`)
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
