export enum ClientType {
  Client = 0,
  Merchant = 1,
  Partner = 2
}

export interface CreditAccountDto {
  id: string
  cardNumber?: string | null
  cvv?: string | null
  expiredOn: string
  status: number
  passCode?: string | null
}

export interface ClientRequestDto {
  fullName?: string | null
  parentClientId?: string | null
  email?: string | null
  phoneNumber?: string | null
  address?: string | null
  city?: string | null
  nationalId?: string | null
  firstName?: string | null
  secondName?: string | null
  thirdName?: string | null
  lastName?: string | null
  profilePictureUrl?: string | null
  clientType: ClientType
}

export interface ClientResponseDto extends ClientRequestDto {
  id: string
  parentClientName?: string | null
  createdAt: string
  creditAccounts?: CreditAccountDto[] | null
}
