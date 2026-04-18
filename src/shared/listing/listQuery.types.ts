export type ListQueryPrimitive = string | number | boolean | null | undefined

export type ListQueryInput = {
  PageNumber?: number | string
  PageSize?: number | string
  SortBy?: string | string[]
  SortDir?: 'asc' | 'desc'
  IsDesc?: boolean
  Search?: string
  FromDate?: string
  ToDate?: string
  [key: string]: ListQueryPrimitive | string[]
}
