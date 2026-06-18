import type { PaymentMethod } from '../payment-method'
import type { SettlementStatus } from '../status'

export interface SettlementListItem {
  id: string
  merchantName: string
  clientName: string
  grossAmount: number
  status: SettlementStatus
  requestedAt?: string | null
  createdAt?: string | null
}

export interface SettlementDetailsResponse {
  id: string
  clientId: string
  clientName: string
  description: string
  settlementDate: string
  grossAmount: number
  requestedAt: string
  status: SettlementStatus
  commissionPercentage: number
  commissionAmount: number
  netAmount: number
  processingStartedAt?: string | null
  method?: PaymentMethod | null
  paymentReference?: string | null
  adminNote?: string | null
  completedAt?: string | null
}