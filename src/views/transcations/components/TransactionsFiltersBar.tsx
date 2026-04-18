'use client'

import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'

import { FormControl, InputLabel, Select } from '@mui/material'

import FiltersBar from '@/components/filters/FiltersBar'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'
import useDateSearchFilters from '@/hooks/useDateSearchFilters'

import { isTransactionType, transactionTypeLabels } from '@/types/api/transaction'
import {
  getTransactionTypesForAccountFilter,
  transactionAccountFilterLabels,
  transactionAccountFilters,
} from '@/utils/transactionAccountFilter'

import type { TransactionType } from '@/types/api/transaction'
import type { TransactionAccountFilter } from '@/utils/transactionAccountFilter'

type Props = {
  accountFilter: TransactionAccountFilter
  onAccountFilterChange: (value: TransactionAccountFilter) => void
}

export default function TransactionsFiltersBar({ accountFilter, onAccountFilterChange }: Props) {
  const { query, setQuery } = useTransactionsStore()
  const availableTransactionTypes = getTransactionTypesForAccountFilter(accountFilter)

  const { search, setSearch, fromDate, setFromDate, toDate, setToDate } = useDateSearchFilters(
    query,
    setQuery,
  )

  return (
    <FiltersBar>
      <TextField
        size="small"
        placeholder="بحث بالوصف أو رقم العملية..."
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

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel shrink id="transaction-account-filter-label">
          نوع الحساب
        </InputLabel>

        <Select<TransactionAccountFilter>
          labelId="transaction-account-filter-label"
          value={accountFilter}
          label="نوع الحساب"
          onChange={event => onAccountFilterChange(event.target.value as TransactionAccountFilter)}
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
    </FiltersBar>
  )
}
