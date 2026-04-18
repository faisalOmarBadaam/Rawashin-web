export const analyticsEvents = {
  clientCreated: 'client_created',
  transactionApproved: 'transaction_approved',
  settlementCreated: 'settlement_created',
  supportTicketCreated: 'support_ticket_created',
} as const

export type AnalyticsEventName = (typeof analyticsEvents)[keyof typeof analyticsEvents]
