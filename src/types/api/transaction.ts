import type { PagedResult } from '@/libs/api/types'

export const transactionTypes = ['Refund', 'Payment', 'Settlement', 'CreditCharge', 'Debt'] as const

export type TransactionType = (typeof transactionTypes)[number]

export const transactionTypeValues: Record<TransactionType, number> = {
  Refund: 0,
  Payment: 1,
  Settlement: 2,
  CreditCharge: 3,
  Debt: 4,
}

export const isTransactionType = (value: string): value is TransactionType =>
  transactionTypes.includes(value as TransactionType)

export const toTransactionTypeValue = (value?: TransactionType | number | string) => {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 4) {
    return value
  }

  if (typeof value === 'string' && isTransactionType(value)) {
    return transactionTypeValues[value]
  }

  return undefined
}

export const transactionTypeLabels: Record<TransactionType, string> = {
  Refund: 'استرجاع',
  Payment: 'دفع',
  Settlement: 'تسوية',
  CreditCharge: 'شحن ائتماني',
  Debt: 'دين',
}

export interface TransactionForClientDto {
  id?: string
  clientId?: string
  toClientId: string
  transactionType?: TransactionType
  referenceId?: string | null
  amount: number
  description?: string | null
  createdAt: string
  clientName?: string | null
  toClientName?: string | null

  // Legacy alias used by existing UI components
  marchantName?: string | null
}

export type TransactionForAClientDto = TransactionForClientDto

export interface TransactionDto {
  referenceId?: string | null
  id: string
  transactionNumber?: number | null
  clientId: string
  transactionType?: TransactionType
  clientName?: string | null
  amount: number
  description?: string | null
  createdAt: string
}

export interface TransactionResultDto {
  referenceId?: string | null
  merchantTransaction: TransactionDto
  customerTransaction: TransactionDto
  commissionAmount: number
}

export interface TransactionRequestDto {
  clientId: string
  amount: number
  cardNumber?: string | null
  passCode?: string | null
  description?: string | null
}

export type ClientBalanceDto = {
  clientId: string
  currentBalance: number
  currency?: string | null
  lastUpdated?: string | null
}

export interface TransactionChargeDto {
  phoneNumber?: string | null
  amount: number
  note?: string | null
}

export interface ChargerChargeCustomerRequestDto {
  phoneNumber?: string | null
  amount: number
  note?: string | null
}

export interface RefillChargerQueryParams {
  chargerId: string
  amount: number
  adminLiquidityId: string
}

export type TransactionsQueryParams = {
  PageNumber?: number
  PageSize?: number
  SortBy?: string
  SortDir?: 'asc' | 'desc'
  IsDesc?: boolean
  Search?: string
  FromDate?: string
  ToDate?: string
  TransactionType?: TransactionType
}
export type UploadBatchResultDto = {
  totalRows: number
  processedRows: number
  newClientsCreated: number
  totalAmount: number
  errors: unknown[]
  isSuccess: boolean
}

export type UploadBatchFileResultDto = {
  fileBlob: Blob
  fileName?: string | null
  contentType?: string | null
}

export type ChargerStatisticsDto = {
  totalInAmount: number
  totalOutAmount: number
  totalIntransactions: number
  totalOuttransactions: number
}

export interface TransactionBalanceSummaryDto {
  balanceAvailable: number
  incomingBalance: number
  outgoingBalance: number
}

export interface DepositDto {
  amount: number
  note?: string | null
}

export type ClientTransactionsPagedResult = PagedResult<TransactionForClientDto>

export type TransactionPagedResult = PagedResult<TransactionDto>

export interface RefundTransactionRequestDto {
  referenceId: string
  note?: string | null
}

export interface GetClientsBalancesSumRequestDto {
  clientsIds: string[]
}
