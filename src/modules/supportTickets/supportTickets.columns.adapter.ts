import { getSupportTicketColumns } from '@/views/support-ticket/components/supportTickets.columns'

/** Legacy adapter to keep module layer view-agnostic. */
export const supportTicketsColumnsAdapter = {
  list: getSupportTicketColumns,
}
