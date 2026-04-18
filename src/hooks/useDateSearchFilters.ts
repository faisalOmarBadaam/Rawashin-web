'use client'

import { useEffect, useState } from 'react'

import useDebouncedValue from '@/hooks/useDebouncedValue'

type DateSearchQuery = {
  Search?: string
  FromDate?: string
  ToDate?: string
}

type SetQueryFn<TQuery extends DateSearchQuery> = (
  query: Partial<TQuery>,
  options?: { resetPage?: boolean },
) => void

type UseDateSearchFiltersOptions = {
  searchDebounceMs?: number
  fromDateFormat?: (value: string) => string
  toDateFormat?: (value: string) => string
}

const defaultFromDateFormat = (value: string) => `${value}T00:00:00`
const defaultToDateFormat = (value: string) => `${value}T23:59:59`

const toDateInputValue = (value?: string) => (value ? value.split('T')[0] : '')

export const useDateSearchFilters = <TQuery extends DateSearchQuery>(
  query: TQuery,
  setQuery: SetQueryFn<TQuery>,
  options?: UseDateSearchFiltersOptions,
) => {
  const debounceMs = options?.searchDebounceMs ?? 400
  const fromDateFormat = options?.fromDateFormat ?? defaultFromDateFormat
  const toDateFormat = options?.toDateFormat ?? defaultToDateFormat

  const [search, setSearch] = useState(query.Search ?? '')
  const [fromDate, setFromDate] = useState(toDateInputValue(query.FromDate))
  const [toDate, setToDate] = useState(toDateInputValue(query.ToDate))

  const debouncedSearch = useDebouncedValue(search, debounceMs)

  useEffect(() => {
    setQuery({ Search: debouncedSearch || undefined } as Partial<TQuery>, { resetPage: true })
  }, [debouncedSearch, setQuery])

  useEffect(() => {
    setQuery({ FromDate: fromDate ? fromDateFormat(fromDate) : undefined } as Partial<TQuery>, {
      resetPage: true,
    })
  }, [fromDate, fromDateFormat, setQuery])

  useEffect(() => {
    setQuery({ ToDate: toDate ? toDateFormat(toDate) : undefined } as Partial<TQuery>, {
      resetPage: true,
    })
  }, [toDate, toDateFormat, setQuery])

  const resetFilters = () => {
    setSearch('')
    setFromDate('')
    setToDate('')
    setQuery(
      {
        Search: undefined,
        FromDate: undefined,
        ToDate: undefined,
      } as Partial<TQuery>,
      { resetPage: true },
    )
  }

  return {
    search,
    setSearch,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    resetFilters,
  }
}

export default useDateSearchFilters
