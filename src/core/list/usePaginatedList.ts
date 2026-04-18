'use client'

import { useCallback, useEffect, useState } from 'react'

type PaginatedQuery = {
  PageNumber?: number
  PageSize?: number
  SortBy?: string
  SortDir?: 'asc' | 'desc'
  IsDesc?: boolean
  Search?: string
  [key: string]: unknown
}

type PaginatedResult<TItem> = {
  items?: TItem[] | null
  totalCount: number
}

export const usePaginatedList = <TItem, TQuery extends PaginatedQuery>(params: {
  query: TQuery
  fetcher: (query: TQuery) => Promise<PaginatedResult<TItem>>
  deps?: unknown[]
}) => {
  const [rows, setRows] = useState<TItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await params.fetcher(params.query)
      setRows(data.items ?? [])
      setTotalCount(data.totalCount)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load list')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(
    () => {
      void run()
    },
    params.deps ?? [params.query, run],
  )

  return {
    rows,
    totalCount,
    loading,
    error,
    retry: run,
    setRows,
    setTotalCount,
  }
}
