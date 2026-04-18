'use client'

import { useMemo, useState } from 'react'

export type PaginatedListQueryBase = {
  PageNumber?: number
  PageSize?: number
}

export const usePaginatedListState = <TQuery extends PaginatedListQueryBase>(
  initialQuery: TQuery,
) => {
  const [query, setQueryState] = useState<TQuery>(initialQuery)

  const setQuery = (next: Partial<TQuery>, options?: { resetPage?: boolean }) => {
    setQueryState(prev => {
      const merged = { ...prev, ...next }
      if (options?.resetPage && 'PageNumber' in merged) {
        merged.PageNumber = 1 as TQuery['PageNumber']
      }
      return merged
    })
  }

  const resetQuery = () => setQueryState(initialQuery)

  return useMemo(
    () => ({
      query,
      setQuery,
      resetQuery,
    }),
    [query],
  )
}
