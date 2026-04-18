import type { PagedResult } from '@/libs/api/types'

export enum SettlementStatus {
  New = 0,
  InProcess = 1,
  Completed = 2,
  ClosedWithoutCompletion = 3,
}

export enum PaymentMethod {
  Cash = 0,
  BankTransfer = 1,
  Check = 2,
  InternalTransfer = 3,
}

export interface SettlementTransactionDto {
  referenceId?: string | null
  id: string
  transactionNumber?: number | null
  clientId: string
  clientName?: string | null
  amount: number
  description?: string | null
  createdAt: string
}

export interface SettlementDto {
  id: string
  referenceId?: string | null

  clientId: string
  clientName?: string | null

  description?: string | null

  settlementDate: string
  requestedAt: string

  grossAmount: number
  commissionPercentage: number
  commissionAmount: number
  netAmount: number

  status?: SettlementStatus | null

  processingStartedAt?: string | null
  completedAt?: string | null

  method?: string | null
  paymentReference?: string | null
  adminNote?: string | null

  transactions?: SettlementTransactionDto[] | null
}

export interface SettlementRequestDto {
  grossAmount: number
  description?: string | null
}

export interface ProcessSettlementParams {
  commissionPercentage: number
}

export interface FinalizeSettlementDto {
  method: PaymentMethod
  paymentReference: string
  adminNote?: string | null
}

export interface CancelSettlementRequest {
  reason?: string | null
}

export interface SubMerchantsSettlementResult {
  totalAmount: number
  settledChildrenCount: number
}

export type SettlementsQueryParams = {
  FromDate?: string // ISO date-time
  ToDate?: string // ISO date-time

  Status?: SettlementStatus

  PageNumber?: number
  PageSize?: number

  SortBy?: string
  SortDir?: 'asc' | 'desc'
  IsDesc?: boolean

  Search?: string
}

export type SettlementPagedResult = PagedResult<SettlementDto>

export type SettlementListResult = SettlementDto[]
