import type { QueryParams } from '@/libs/api/types'
import {
  normalizeListQuery as normalizeContractListQuery,
  toStableQueryKeyPart,
  type ListEndpointKey,
} from '@/shared/api/listQuery'
import type { ListQueryInput } from './listQuery.types'

const DEFAULT_LIST_ENDPOINT: ListEndpointKey = 'settlements'

export const normalizeListQuery = (
  input?: ListQueryInput,
  endpoint: ListEndpointKey = DEFAULT_LIST_ENDPOINT,
): ListQueryInput => normalizeContractListQuery(endpoint, input) as ListQueryInput

export const toApiQueryParams = (
  query: ListQueryInput,
  endpoint: ListEndpointKey = DEFAULT_LIST_ENDPOINT,
): QueryParams => normalizeListQuery(query, endpoint) as QueryParams

export const toStableQueryKey = (
  query: ListQueryInput,
  endpoint: ListEndpointKey = DEFAULT_LIST_ENDPOINT,
): string => toStableQueryKeyPart(normalizeListQuery(query, endpoint) as Record<string, unknown>)
