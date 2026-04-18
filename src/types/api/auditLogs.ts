import type { PagedResult } from '@/libs/api/types'

export type AuditLogsQueryParams = {
  PageNumber?: number
  PageSize?: number
  SortBy?: string
  SortDir?: 'asc' | 'desc'
  IsDesc?: boolean
  Search?: string
  Action?: 'Insert' | 'Update' | 'Delete'
  TableName?: string
  FromDate?: string
  ToDate?: string
}

export interface AuditLogDto {
  id: number
  eventTime?: string | null
  action?: string | null
  entityName?: string | null
  fullName?: string | null
  effectedColumnsJson?: string | null
}

export type AuditLogsPagedResult = PagedResult<AuditLogDto>
