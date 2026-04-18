import type { PagedResult } from '@/libs/api/types'

export enum SupportTicketCategory {
  Issue = 0,
  Suggestion = 1,
  Complaint = 2,
  Other = 3,
}

export enum SupportTicketStatus {
  Open = 0,
  InProgress = 1,
  Complete = 2,
}

export enum SupportTicketMessageSenderType {
  Support = 1,
  Client = 0,
}

export interface SupportTicketMessageDto {
  id: string
  ticketId: string
  senderName?: string | null
  senderType: SupportTicketMessageSenderType
  message: string
  createdAt?: string | null
  seenAt?: string | null
}

export interface CreateSupportTicketMessageDto {
  senderType: SupportTicketMessageSenderType
  message?: string | null
}

export interface SupportTicketCreateRequestDto {
  clientId: string
  subject?: string | null
  description?: string | null
  category: number
}

export interface SupportTicketUpdateStatusCommand {
  status: SupportTicketStatus
}

export interface SupportTicketDto {
  id: string
  clientId?: string | null
  title?: string | null
  subject?: string | null
  description?: string | null

  createdAt?: string | null
  updatedAt?: string | null

  category?: SupportTicketCategory | null
  status?: SupportTicketStatus | null

  clientName?: string | null
  clientPhoneNumber?: string | null
}

export interface SupportTicketDetailsDto {
  id: string
  clientId?: string | null
  clientName?: string | null
  clientPhoneNumber?: string | null
  subject?: string | null
  description?: string | null
  category?: SupportTicketCategory | null
  status?: SupportTicketStatus | null
  createdAt?: string | null
}

export interface SupportTicketsQueryParams {
  PageNumber?: number
  PageSize?: number
  SortBy?: string
  SortDir?: 'asc' | 'desc'
  IsDesc?: boolean
  Search?: string
  Category?: SupportTicketCategory
  Status?: SupportTicketStatus
}

export interface SupportTicketMessagesQueryParams {
  PageNumber?: number
  PageSize?: number
  SortBy?: string
  SortDir?: 'asc' | 'desc'
  IsDesc?: boolean
  Search?: string
}

export type SupportTicketsPagedResult = PagedResult<SupportTicketDto>
