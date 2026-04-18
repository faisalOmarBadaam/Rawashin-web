import type { PagedResult } from '@/libs/api/types'
import type { TransactionType } from './transaction'

export enum ClientType {
  Client = 0,
  Merchant = 1,
  Partner = 2,
  Admin = 3,
  ProfitAccount = 4,
  Charger = 5,
  Employee = 6,
}

export enum CreditAccountStatus {
  Active = 1,
  Blocked = 2,
  Expired = 3,
}

export interface CreditAccountDto {
  id: string
  cardNumber?: string | null
  cvv?: string | null
  expiredOn: string
  status: CreditAccountStatus
  passCode?: string | null
}

export interface ClientTransactionDto {
  referenceId?: string | null
  amount: number
  description?: string | null
  createdAt: string
  marchantName?: string | null
}

export type ClientTransactionsPagedResult = PagedResult<ClientTransactionDto>

export interface ClientDto {
  id: string
  isActive: boolean
  isReceivedCard: boolean

  nationalId?: string | null
  organizationName?: string | null
  nationalIdType?: number | null
  firstName?: string | null
  secondName?: string | null
  thirdName?: string | null
  lastName?: string | null
  fullName?: string | null

  parentClientId?: string | null
  parentClientName?: string | null

  createdAt?: string | null

  email?: string | null
  phoneNumber?: string | null
  address?: string | null
  city?: string | null
  profilePictureUrl?: string | null

  clientType: ClientType
  roles?: string[]

  creditAccount?: CreditAccountDto | null
  transactions?: ClientTransactionDto[] | null
  totalAmount: number
}

export interface ClientContactDto {
  fullName?: string | null
  phoneNumber?: string | null
}

export interface CreateClientRequestDto {
  fullName?: string | null
  parentClientId?: string | null
  email?: string | null
  phoneNumber?: string | null
  address?: string | null
  city?: string | null
  nationalId?: string | null
  organizationName?: string | null
  nationalIdType?: number | null
  firstName?: string | null
  secondName?: string | null
  thirdName?: string | null
  lastName?: string | null
  profilePictureUrl?: string | null
  clientType: ClientType
}

export interface SubMerchantRequestDto {
  nationalId: string
  firstName: string
  secondName: string
  thirdName: string
  lastName: string
  phoneNumber: string
  address: string
  city: string
  password: string
}

export interface UpdateSubMerchantRequestDto {
  firstName?: string | null
  secondName?: string | null
  thirdName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  address?: string | null
  city?: string | null
}

export interface UpdatePassCodeCommand {
  userPassword?: string | null
  newPassCode?: string | null
}

export type UpdateClientRequestDto = CreateClientRequestDto

export interface ClientQueryParams {
  ParentClientId?: string
  ClientType?: ClientType
  IsActive?: boolean
  IsReceivedCard?: boolean
  ParentsOnly?: boolean
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

export type ClientPagedResult = PagedResult<ClientDto>

export type LookupDto = {
  id: string
  name: string
}
