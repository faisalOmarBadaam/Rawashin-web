import type { AccountStatus } from ".."

export interface ClientListResponse {
  id: string
  accountStatus: AccountStatus
  isReceivedCard: boolean
  nationalId?: string
  fullName?: string | null
  firstName?: string | null
  secondName?: string | null
  thirdName?: string | null
  lastName?: string | null
  parentClientId?: string | null
  parentClientName?: string | null
  createdAt: string
  phoneNumber?: string | null
  address?: string | null
  city?: string | null
  organizationName?: string | null
  nationalIdType: number
  nationalIdTypeName?: string | null
}

export interface ClientLookupResponse {
  id: string
  name: string
}

export interface MerchantSubResponse {
  id: string
  name: string
  status: number
  totalAmount: number
}