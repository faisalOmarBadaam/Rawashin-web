'use client'

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import GenericDataGrid from '@/components/datagrid/GenericDataGrid'
import { transactionsModule } from '@/modules/transactions/transactions.module'
import TransactionsFiltersBar from './components/TransactionsFiltersBar'

import { useAuthStore } from '@/contexts/auth/auth.store'
import { useClientsStore } from '@/contexts/clients/clients.store'
import {
  filterTransactionsByAccountFilter,
  normalizeTransactionTypeForAccountFilter,
} from '@/utils/transactionAccountFilter'

import type { TransactionForClientDto } from '@/types/api/transaction'
import type { TransactionAccountFilter } from '@/utils/transactionAccountFilter'

export default function TransactionsPage() {
  const clientId = useAuthStore(s => s.session?.userId)
  const [accountFilter, setAccountFilter] = useState<TransactionAccountFilter>('current')

  const { query, setQuery, fetchTransactions, list: clients, fetchClients } = useClientsStore()

  const [rows, setRows] = useState<TransactionForClientDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFiltered = Boolean(
    query.Search || query.FromDate || query.ToDate || query.TransactionType,
  )

  const visibleRows = useMemo(
    () => filterTransactionsByAccountFilter(rows, accountFilter, query.TransactionType),
    [accountFilter, query.TransactionType, rows],
  )

  const visibleTotalCount = useMemo(() => {
    if (accountFilter === 'current' && !query.TransactionType) {
      return visibleRows.length
    }

    return totalCount
  }, [accountFilter, query.TransactionType, totalCount, visibleRows.length])

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
    if (clients.length === 0) {
      fetchClients()
    }
  }, [clients.length, fetchClients])

  useEffect(() => {
    if (!clientId || !isFiltered) return

    setLoading(true)
    setError(null)

    fetchTransactions(clientId, query)
      .then(res => {
        setRows(res.items ?? [])

        setTotalCount(res.totalCount)
      })
      .catch(e => {
        setError(e?.message ?? 'فشل تحميل العمليات')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [
    clientId,
    isFiltered,
    fetchTransactions,
    query.PageNumber,
    query.PageSize,
    query.SortBy,
    query.SortDir,
    query.Search,
    query.FromDate,
    query.ToDate,
    query.TransactionType,
  ])

  const clientsMap = useMemo(
    () => Object.fromEntries(clients.map(c => [c.id, c.fullName ?? null])),
    [clients],
  )

  const columns = useMemo(
    // TODO: legacy adapter - removable after migration verification.
    () => transactionsModule.columns.list(clientsMap, { includeMerchantColumn: false }),
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
            rows={visibleRows}
            columns={columns}
            loading={loading}
            totalCount={visibleTotalCount}
            query={query}
            setQuery={q => setQuery(q)}
            error={error}
            getRowId={row =>
              row.referenceId ? `${row.referenceId}-${row.createdAt}` : row.createdAt
            }
            onRetry={() => fetchTransactions(clientId!, query)}
          />
        )}
      </CardContent>
    </Card>
  )
}
