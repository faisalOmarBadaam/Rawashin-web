import type { PaymentMethod } from '../payment-method'

export interface SettlementListParams {
  PageNumber?: number
  PageSize?: number
  SortBy?: string
  IsDesc?: boolean
  Search?: string
  Status?: string
  FromDate?: string
  ToDate?: string
}

export interface CompleteSettlementPayload {
  method: PaymentMethod
  paymentReference: string
  adminNote: string
}