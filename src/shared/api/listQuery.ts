type SortDirection = 'asc' | 'desc'

import { toTransactionTypeValue } from '@/types/api/transaction'

type QueryParamValue = string | number | boolean | undefined
type QueryParamsOutput = Record<string, QueryParamValue>

export type ListQueryInput = {
  PageNumber?: number | string
  PageSize?: number | string
  SortBy?: string | string[]
  SortDir?: SortDirection
  IsDesc?: boolean
  Search?: string
  FromDate?: string
  ToDate?: string
  TransactionType?: string | number
}

export type ListEndpointConfig = {
  allowedParams: readonly string[]
  allowedSortBy: readonly string[]
  sortByMap?: Readonly<Record<string, string>>
  defaultPageSize?: number
}

export type ListEndpointKey =
  | 'clients'
  | 'clientTransactions'
  | 'transactions'
  | 'settlements'
  | 'clientSettlements'
  | 'auditLogs'
  | 'attachmentsByClient'
  | 'supportTickets'
  | 'clientSupportTickets'
  | 'supportTicketMessages'

const DEFAULT_PAGE_NUMBER = 1
const DEFAULT_PAGE_SIZE = 10

const toPositiveInt = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return undefined
    const normalized = Math.trunc(value)
    return normalized > 0 ? normalized : undefined
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return undefined
    const normalized = Math.trunc(parsed)
    return normalized > 0 ? normalized : undefined
  }

  return undefined
}

const toTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const toIsoDateTimeString = (value: unknown): string | undefined => {
  const text = toTrimmedString(value)
  if (!text) return undefined
  return Number.isNaN(Date.parse(text)) ? undefined : text
}

export const pruneEmpty = <T extends Record<string, unknown>>(obj: T): QueryParamsOutput => {
  const cleaned: QueryParamsOutput = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string' && value.trim() === '') continue
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      cleaned[key] = value
    }
  }

  return cleaned
}

export const normalizePagination = (
  input: Pick<ListQueryInput, 'PageNumber' | 'PageSize'>,
  defaultPageSize = DEFAULT_PAGE_SIZE,
) => {
  return {
    PageNumber: toPositiveInt(input.PageNumber) ?? DEFAULT_PAGE_NUMBER,
    PageSize: toPositiveInt(input.PageSize) ?? defaultPageSize,
  }
}

export const normalizeSearch = (input: Pick<ListQueryInput, 'Search'>) => {
  return {
    Search: toTrimmedString(input.Search),
  }
}

export const normalizeDates = (
  input: Pick<ListQueryInput, 'FromDate' | 'ToDate'>,
  options: { allowFromDate?: boolean; allowToDate?: boolean } = {},
) => {
  return {
    FromDate: options.allowFromDate ? toIsoDateTimeString(input.FromDate) : undefined,
    ToDate: options.allowToDate ? toIsoDateTimeString(input.ToDate) : undefined,
  }
}

export const normalizeSort = (
  input: Pick<ListQueryInput, 'SortBy' | 'SortDir' | 'IsDesc'>,
  options: Pick<ListEndpointConfig, 'allowedSortBy' | 'sortByMap'>,
) => {
  const rawSortBy = Array.isArray(input.SortBy) ? input.SortBy[0] : input.SortBy
  const normalizedSortBy = toTrimmedString(rawSortBy)
  const mappedSortBy = normalizedSortBy
    ? (options.sortByMap?.[normalizedSortBy] ?? normalizedSortBy)
    : undefined

  if (!mappedSortBy || !options.allowedSortBy.includes(mappedSortBy)) {
    return {
      SortBy: undefined,
      IsDesc: undefined,
    }
  }

  const isDesc =
    typeof input.IsDesc === 'boolean'
      ? input.IsDesc
      : input.SortDir
        ? input.SortDir === 'desc'
        : undefined

  return {
    SortBy: mappedSortBy,
    IsDesc: typeof isDesc === 'boolean' ? isDesc : undefined,
  }
}

const LIST_CONFIGS: Record<ListEndpointKey, ListEndpointConfig> = {
  clients: {
    allowedParams: [
      'ParentClientId',
      'ClientType',
      'IsActive',
      'IsReceivedCard',
      'ParentsOnly',
      'PageNumber',
      'PageSize',
      'SortBy',
      'IsDesc',
      'Search',
    ],
    allowedSortBy: [
      'firstName',
      'phoneNumber',
      'createdAt',
      'isActive',
      'isReceivedCard',
      'organizationName',
      'nationalId',
    ],
    sortByMap: {
      fullName: 'firstName',
      asn: 'createdAt',
      actions: 'createdAt',
    },
  },
  clientTransactions: {
    allowedParams: [
      'FromDate',
      'ToDate',
      'TransactionType',
      'PageNumber',
      'PageSize',
      'SortBy',
      'IsDesc',
      'Search',
    ],
    allowedSortBy: [
      'referenceId',
      'amount',
      'description',
      'createdAt',
      'clientName',
      'toClientName',
    ],
    sortByMap: {
      asn: 'createdAt',
      marchantName: 'clientName',
      actions: 'createdAt',
    },
  },
  transactions: {
    allowedParams: [
      'FromDate',
      'ToDate',
      'TransactionType',
      'PageNumber',
      'PageSize',
      'SortBy',
      'IsDesc',
      'Search',
    ],
    allowedSortBy: [
      'referenceId',
      'transactionNumber',
      'clientName',
      'amount',
      'description',
      'createdAt',
    ],
    sortByMap: {
      asn: 'createdAt',
      marchantName: 'clientName',
      actions: 'createdAt',
    },
  },
  settlements: {
    allowedParams: [
      'FromDate',
      'ToDate',
      'Status',
      'PageNumber',
      'PageSize',
      'SortBy',
      'IsDesc',
      'Search',
    ],
    allowedSortBy: [
      'requestedAt',
      'settlementDate',
      'clientName',
      'grossAmount',
      'commissionPercentage',
      'commissionAmount',
      'netAmount',
      'status',
      'processingStartedAt',
      'completedAt',
    ],
    sortByMap: {
      asn: 'requestedAt',
      actions: 'requestedAt',
    },
  },
  clientSettlements: {
    allowedParams: [
      'FromDate',
      'ToDate',
      'Status',
      'PageNumber',
      'PageSize',
      'SortBy',
      'IsDesc',
      'Search',
    ],
    allowedSortBy: [
      'requestedAt',
      'settlementDate',
      'clientName',
      'grossAmount',
      'commissionPercentage',
      'commissionAmount',
      'netAmount',
      'status',
      'processingStartedAt',
      'completedAt',
    ],
    sortByMap: {
      asn: 'requestedAt',
      actions: 'requestedAt',
    },
  },
  auditLogs: {
    allowedParams: [
      'FromDate',
      'ToDate',
      'PageNumber',
      'PageSize',
      'SortBy',
      'IsDesc',
      'Search',
      'Action',
      'TableName',
    ],
    allowedSortBy: ['eventTime', 'fullName', 'entityName', 'action'],
    sortByMap: {
      asn: 'eventTime',
    },
  },
  attachmentsByClient: {
    allowedParams: ['PageNumber', 'PageSize', 'SortBy', 'IsDesc', 'Search'],
    allowedSortBy: ['originalFileName', 'storedFileName', 'contentType', 'createdAt'],
    sortByMap: {
      asn: 'createdAt',
    },
  },
  supportTickets: {
    allowedParams: ['Category', 'Status', 'PageNumber', 'PageSize', 'SortBy', 'IsDesc', 'Search'],
    allowedSortBy: ['subject', 'clientName', 'category', 'status', 'createdAt'],
    sortByMap: {
      asn: 'createdAt',
      title: 'subject',
    },
  },
  clientSupportTickets: {
    allowedParams: ['Category', 'Status', 'PageNumber', 'PageSize', 'SortBy', 'IsDesc', 'Search'],
    allowedSortBy: ['subject', 'clientName', 'category', 'status', 'createdAt'],
    sortByMap: {
      asn: 'createdAt',
      title: 'subject',
    },
  },
  supportTicketMessages: {
    allowedParams: ['PageNumber', 'PageSize', 'SortBy', 'IsDesc', 'Search'],
    allowedSortBy: ['senderName', 'senderType', 'message', 'createdAt'],
    sortByMap: {
      asn: 'createdAt',
    },
    defaultPageSize: 200,
  },
}

export const listEndpointConfigs = LIST_CONFIGS

export const normalizeListQuery = <TInput extends ListQueryInput>(
  endpoint: ListEndpointKey,
  input?: TInput,
): QueryParamsOutput => {
  const config = listEndpointConfigs[endpoint]
  const source = (input ?? {}) as TInput
  const sourceRecord = source as Record<string, unknown>

  const pagination = normalizePagination(source, config.defaultPageSize)
  const search = normalizeSearch(source)
  const sort = normalizeSort(source, config)
  const dates = normalizeDates(source, {
    allowFromDate: config.allowedParams.includes('FromDate' as string),
    allowToDate: config.allowedParams.includes('ToDate' as string),
  })

  const normalized: Record<string, unknown> = {
    ...pagination,
    ...search,
    ...sort,
    ...dates,
  }
  for (const param of config.allowedParams) {
    if (param in normalized) continue

    const value = sourceRecord[param]

    if (typeof value === 'number' && Number.isFinite(value)) {
      normalized[param] = value
      continue
    }

    if (typeof value === 'boolean') {
      normalized[param] = value
      continue
    }

    if (typeof value === 'string') {
      if (param === 'TransactionType') {
        const normalizedTransactionType = toTransactionTypeValue(value)

        if (normalizedTransactionType !== undefined) {
          normalized[param] = normalizedTransactionType
        }

        continue
      }

      const trimmed = value.trim()
      if (trimmed !== '') {
        normalized[param] = trimmed
      }
    }
  }
  // for (const param of config.allowedParams) {
  //   if (param in normalized) continue
  //   const value = sourceRecord[param]
  //   if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
  //     normalized[param] = value
  //   }
  // }

  if (!normalized.SortBy) {
    normalized.IsDesc = undefined
  }

  return pruneEmpty(normalized)
}

export const toStableQueryKeyPart = (query: Record<string, unknown>) => {
  const ordered = Object.keys(query)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = query[key]
      return acc
    }, {})

  return JSON.stringify(ordered)
}
