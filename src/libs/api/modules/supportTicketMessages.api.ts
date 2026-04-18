import { supportTicketsFirebase } from '@/libs/firebase/supportTickets'

import type {
  CreateSupportTicketMessageDto,
  SupportTicketMessageDto,
  SupportTicketMessagesQueryParams,
} from '@/types/api/supportTickets'

export const SupportTicketMessagesApi = {
  getAll(ticketId: string, params?: SupportTicketMessagesQueryParams, clientId?: string | null) {
    return supportTicketsFirebase.getMessages(ticketId, params, clientId) as Promise<
      SupportTicketMessageDto[]
    >
  },

  create(ticketId: string, payload: CreateSupportTicketMessageDto, clientId?: string | null) {
    return supportTicketsFirebase.createMessage(
      ticketId,
      payload,
      clientId,
    ) as Promise<SupportTicketMessageDto>
  },

  markAsRead(ticketId: string, clientId?: string | null) {
    return supportTicketsFirebase.markMessagesAsRead(ticketId, clientId)
  },

  subscribe: supportTicketsFirebase.subscribeMessages,
}
