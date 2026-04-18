import type { Unsubscribe } from 'firebase/firestore'
import { create } from 'zustand'

import { SupportTicketMessagesApi } from '@/libs/api/modules/supportTicketMessages.api'
import { queryClient } from '@/libs/react-query/queryClient'
import { normalizeListQuery, toStableQueryKeyPart } from '@/shared/api/listQuery'

import type {
  CreateSupportTicketMessageDto,
  SupportTicketMessageDto,
  SupportTicketMessagesQueryParams,
} from '@/types/api/supportTickets'

const SUPPORT_TICKET_MESSAGES_QUERY: SupportTicketMessagesQueryParams = {
  PageNumber: 1,
  PageSize: 200,
  SortBy: 'createdAt',
  IsDesc: false,
}

const SUPPORT_TICKET_MESSAGES_KEY = (ticketId: string) => [
  'support-ticket-messages',
  ticketId,
  toStableQueryKeyPart(normalizeListQuery('supportTicketMessages', SUPPORT_TICKET_MESSAGES_QUERY)),
]

let messagesUnsubscribe: Unsubscribe | null = null

type SupportTicketMessagesState = {
  messages: SupportTicketMessageDto[]
  loading: boolean
  sending: boolean
  error: string | null

  fetchMessages: (ticketId: string, clientId?: string | null) => Promise<void>
  sendMessage: (
    ticketId: string,
    payload: CreateSupportTicketMessageDto,
    clientId?: string | null,
  ) => Promise<void>
  markMessagesAsRead: (ticketId: string, clientId?: string | null) => Promise<void>
  cleanupMessagesSubscription: () => void
}

export const useSupportTicketMessagesStore = create<SupportTicketMessagesState>(set => ({
  messages: [],
  loading: false,
  sending: false,
  error: null,

  cleanupMessagesSubscription: () => {
    messagesUnsubscribe?.()
    messagesUnsubscribe = null
  },

  fetchMessages: async (ticketId: string, clientId?: string | null) => {
    set({ loading: true, error: null })
    messagesUnsubscribe?.()

    try {
      messagesUnsubscribe = await SupportTicketMessagesApi.subscribe(
        ticketId,
        SUPPORT_TICKET_MESSAGES_QUERY,
        data => {
          queryClient.setQueryData(SUPPORT_TICKET_MESSAGES_KEY(ticketId), data)
          set({ messages: data ?? [], loading: false, error: null })
        },
        error => {
          set({ loading: false, error: error.message || 'Failed to sync support ticket messages' })
        },
        clientId,
      )
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Failed to load support ticket messages' })
    }
  },

  sendMessage: async (
    ticketId: string,
    payload: CreateSupportTicketMessageDto,
    clientId?: string | null,
  ) => {
    set({ sending: true, error: null })

    try {
      await SupportTicketMessagesApi.create(ticketId, payload, clientId)

      set({ sending: false })

      queryClient.invalidateQueries({ queryKey: SUPPORT_TICKET_MESSAGES_KEY(ticketId) })
    } catch (e: any) {
      set({ sending: false, error: e?.message ?? 'Failed to send message' })
      throw e
    }
  },

  markMessagesAsRead: async (ticketId: string, clientId?: string | null) => {
    try {
      await SupportTicketMessagesApi.markAsRead(ticketId, clientId)
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to mark support ticket messages as read' })
    }
  },
}))
