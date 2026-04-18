import { supportTicketsFirebase } from '@/libs/firebase/supportTickets'

import type {
  SupportTicketCreateRequestDto,
  SupportTicketDetailsDto,
  SupportTicketStatus,
  SupportTicketUpdateStatusCommand,
  SupportTicketsPagedResult,
  SupportTicketsQueryParams,
} from '@/types/api/supportTickets'

export const SupportTicketsApi = {
  create(payload: SupportTicketCreateRequestDto) {
    return supportTicketsFirebase.create(payload)
  },

  getAll(params?: SupportTicketsQueryParams) {
    return supportTicketsFirebase.getAll(params) as Promise<SupportTicketsPagedResult>
  },

  getByClientId(clientId: string, params?: SupportTicketsQueryParams) {
    return supportTicketsFirebase.getByClientId(
      clientId,
      params,
    ) as Promise<SupportTicketsPagedResult>
  },

  getById(id: string, clientId?: string | null) {
    return supportTicketsFirebase.getById(id, clientId) as Promise<SupportTicketDetailsDto>
  },

  updateStatus(id: string, status: SupportTicketStatus, clientId?: string | null) {
    const payload: SupportTicketUpdateStatusCommand = { status }

    return supportTicketsFirebase.updateStatus(
      id,
      payload.status,
      clientId,
    ) as Promise<SupportTicketDetailsDto>
  },

  subscribeAll: supportTicketsFirebase.subscribeAll,
  subscribeById: supportTicketsFirebase.subscribeById,
}
