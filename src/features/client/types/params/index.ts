import type { ClientType } from "@/shared/types/ClientType"

export interface BeneficiaryListParams {
  ParentClientId?: string
  ClientType?: ClientType | number
  AccountStatus?: string | number
  IsReceivedCard?: boolean
  ParentsOnly?: boolean
  PageNumber?: number
  PageSize?: number
  SortBy?: string
  IsDesc?: boolean
  Search?: string
}

export interface AddClientRequest {
  PhoneNumber: string
  Password: string
  FullName: string
  NationalId: string
  NationalIdType: number
  Address: string
  ClientType: number
  City: string
  ParentClientId: string | null
  organizationName : string | null
}

export interface ClientTransactionsParams {
  PageNumber?: number
  PageSize?: number
  SortBy?: string
  IsDesc?: boolean
  Search?: string
  Type?: string | number
  FromDate?: string
  ToDate?: string
}
