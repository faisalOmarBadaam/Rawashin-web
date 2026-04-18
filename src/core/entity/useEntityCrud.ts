'use client'

import { useMemo, useState } from 'react'

export const useEntityCrud = <TCreateDto, TUpdateDto, TCreateResult, TUpdateResult>(params: {
  create: (dto: TCreateDto) => Promise<TCreateResult>
  update: (id: string, dto: TUpdateDto) => Promise<TUpdateResult>
  remove: (id: string) => Promise<void>
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const withAsync = async <T>(task: () => Promise<T>) => {
    setLoading(true)
    setError(null)
    try {
      return await task()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error')
      throw e
    } finally {
      setLoading(false)
    }
  }

  return useMemo(
    () => ({
      loading,
      error,
      create: (dto: TCreateDto) => withAsync(() => params.create(dto)),
      update: (id: string, dto: TUpdateDto) => withAsync(() => params.update(id, dto)),
      remove: (id: string) => withAsync(() => params.remove(id)),
    }),
    [error, loading],
  )
}
