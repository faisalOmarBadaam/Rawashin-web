export interface ApiError {
  code?: string | null
  message?: string | null
  field?: string | null
}

export interface ApiResponse<T> {
  success: boolean
  message?: string | null
  data: T
  errors?: ApiError[] | null
  traceId?: string | null
  timestampUtc?: string
}

export interface PagedResult<T> {
  items: T[] | null
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

export type QueryParams = Record<string, string | number | boolean | undefined>
