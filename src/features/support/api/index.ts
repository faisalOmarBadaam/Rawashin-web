import { supportTicketSchema, type SupportFilters } from '../schema'

export const supportApi = {
  list: '/support/tickets',
  details: (ticketId: string) => `/support/tickets/${ticketId}`,
  create: '/support/tickets',
  update: (ticketId: string) => `/support/tickets/${ticketId}`,
} as const

export const parseSupportFilters = (input: unknown): SupportFilters => supportTicketSchema.parse(input)