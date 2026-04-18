import type { Unsubscribe } from 'firebase/firestore'
import { create } from 'zustand'

import { SupportTicketsApi } from '@/libs/api/modules/supportTickets.api'
import { queryClient } from '@/libs/react-query/queryClient'
import { supportTicketsModule } from '@/modules/supportTickets/supportTickets.module'
import { normalizeListQuery, toStableQueryKeyPart } from '@/shared/api/listQuery'

import type {
  SupportTicketDetailsDto,
  SupportTicketDto,
  SupportTicketStatus,
  SupportTicketsQueryParams,
} from '@/types/api/supportTickets'

const SUPPORT_TICKETS_KEY = (query: SupportTicketsQueryParams) => [
  'support-tickets',
  toStableQueryKeyPart(normalizeListQuery('supportTickets', query)),
]

const SUPPORT_TICKET_KEY = (id: string) => ['support-ticket', id]

let ticketsListUnsubscribe: Unsubscribe | null = null
let selectedTicketUnsubscribe: Unsubscribe | null = null

type SupportTicketsState = {
  list: SupportTicketDto[]
  totalCount: number
  loading: boolean
  updatingStatus: boolean
  error: string | null

  selectedTicket: SupportTicketDetailsDto | null

  query: SupportTicketsQueryParams

  fetchSupportTickets: () => Promise<void>
  fetchSupportTicketById: (id: string, clientId?: string | null) => Promise<void>
  updateSupportTicketStatus: (
    id: string,
    status: SupportTicketStatus,
    clientId?: string | null,
  ) => Promise<void>
  setQuery: (query: Partial<SupportTicketsQueryParams>, options?: { resetPage?: boolean }) => void
  cleanupTicketsSubscription: () => void
  cleanupSelectedTicketSubscription: () => void
}

export const useSupportTicketsStore = create<SupportTicketsState>((set, get) => ({
  list: [],
  totalCount: 0,
  loading: false,
  updatingStatus: false,
  error: null,

  selectedTicket: null,

  query: {
    // TODO: legacy adapter - removable after migration verification.
    ...(supportTicketsModule.defaults.query as SupportTicketsQueryParams),
  },

  setQuery: (q, options) => {
    set(state => {
      const nextQuery: SupportTicketsQueryParams = {
        ...state.query,
        ...q,
      }

      if (options?.resetPage) {
        nextQuery.PageNumber = 1
      }

      return { query: nextQuery }
    })
  },

  cleanupTicketsSubscription: () => {
    ticketsListUnsubscribe?.()
    ticketsListUnsubscribe = null
  },

  cleanupSelectedTicketSubscription: () => {
    selectedTicketUnsubscribe?.()
    selectedTicketUnsubscribe = null
  },

  fetchSupportTickets: async () => {
    set({ loading: true, error: null })
    ticketsListUnsubscribe?.()

    try {
      const query = get().query

      ticketsListUnsubscribe = SupportTicketsApi.subscribeAll(
        query,
        data => {
          queryClient.setQueryData(SUPPORT_TICKETS_KEY(query), data)

          set({
            list: data.items ?? [],
            totalCount: data.totalCount,
            loading: false,
            error: null,
          })
        },
        error => {
          set({ loading: false, error: error.message || 'Failed to sync support tickets' })
        },
      )
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Failed to load support tickets' })
    }
  },

  fetchSupportTicketById: async (id, clientId) => {
    set({ loading: true, error: null })
    selectedTicketUnsubscribe?.()

    try {
      selectedTicketUnsubscribe = SupportTicketsApi.subscribeById(
        id,
        ticket => {
          queryClient.setQueryData(SUPPORT_TICKET_KEY(id), ticket)
          set({ selectedTicket: ticket, loading: false, error: null })
        },
        error => {
          set({ loading: false, error: error.message || 'Failed to sync support ticket' })
        },
        clientId,
      )
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Failed to load support ticket' })
    }
  },

  updateSupportTicketStatus: async (id, status, clientId) => {
    set({ updatingStatus: true, error: null })

    try {
      await SupportTicketsApi.updateStatus(id, status, clientId)

      set(state => ({
        selectedTicket:
          state.selectedTicket?.id === id
            ? { ...state.selectedTicket, status }
            : state.selectedTicket,
        list: state.list.map(row => (row.id === id ? { ...row, status } : row)),
        updatingStatus: false,
      }))

      queryClient.invalidateQueries({ queryKey: SUPPORT_TICKET_KEY(id) })
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    } catch (e: any) {
      set({ updatingStatus: false, error: e?.message ?? 'Failed to update support ticket status' })
      throw e
    }
  },
}))
