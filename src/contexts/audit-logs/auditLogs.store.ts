import { create } from 'zustand'

import { queryClient } from '@/libs/react-query/queryClient'
import { QueryKeys } from '@/libs/react-query/queryKeys'
import { auditLogsModule } from '@/modules/auditLogs/auditLogs.module'
import { normalizeListQuery } from '@/shared/api/listQuery'

import type { AuditLogDto, AuditLogsQueryParams } from '@/types/api/auditLogs'

const AUDIT_LOGS_KEY = (query: AuditLogsQueryParams) =>
  QueryKeys.auditLogs.list(normalizeListQuery('auditLogs', query) as Record<string, unknown>)

type AuditLogsState = {
  list: AuditLogDto[]
  totalCount: number
  loading: boolean
  error: string | null
  query: AuditLogsQueryParams
  setQuery: (q: Partial<AuditLogsQueryParams>, options?: { resetPage?: boolean }) => void
  fetchAuditLogs: () => Promise<void>
  reset: () => void
}

const initialQuery: AuditLogsQueryParams = {
  // TODO: legacy adapter - removable after migration verification.
  ...(auditLogsModule.defaults.query as AuditLogsQueryParams),
}

export const useAuditLogsStore = create<AuditLogsState>((set, get) => ({
  list: [],
  totalCount: 0,
  loading: false,
  error: null,
  query: initialQuery,

  setQuery: (q, options) =>
    set(state => {
      const nextQuery = { ...state.query, ...q }
      if (options?.resetPage) nextQuery.PageNumber = 1
      return { query: nextQuery }
    }),

  fetchAuditLogs: async () => {
    set({ loading: true, error: null })

    try {
      const normalizedQuery = normalizeListQuery('auditLogs', get().query) as AuditLogsQueryParams

      // TODO: legacy adapter - removable after migration verification.
      const data = await queryClient.fetchQuery({
        queryKey: AUDIT_LOGS_KEY(normalizedQuery),
        queryFn: () => auditLogsModule.endpoints.list(normalizedQuery),
        staleTime: 0,
      })

      set({
        list: data.items ?? [],
        totalCount: data.totalCount,
        loading: false,
      })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'تعذر تحميل سجل التدقيق' })
    }
  },

  reset: () =>
    set({
      list: [],
      totalCount: 0,
      loading: false,
      error: null,
      query: initialQuery,
    }),
}))
