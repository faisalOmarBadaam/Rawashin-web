import {
  normalizeListQuery as normalizeEndpointListQuery,
  toStableQueryKeyPart,
  type ListQueryInput as EndpointListQueryInput,
  type ListEndpointKey,
} from '@/shared/api/listQuery'

import {
  normalizeListQuery as normalizeListingListQuery,
  toApiQueryParams,
} from './listQuery.normalize'
import type { ListQueryInput } from './listQuery.types'

/**
 * Canonical adapter layer for list-query normalization.
 *
 * Compatibility goals:
 * - Keep existing callers in both `shared/api` and `shared/listing` working.
 * - Provide one bridge API that can be adopted incrementally.
 */
export const canonicalListQuery = {
  /** Legacy/listing-style normalization (no endpoint key). */
  normalize(input?: ListQueryInput) {
    return normalizeListingListQuery(input)
  },

  /** API-endpoint-style normalization (requires endpoint key). */
  normalizeForEndpoint(endpoint: ListEndpointKey, input?: EndpointListQueryInput) {
    return normalizeEndpointListQuery(endpoint, input)
  },

  toApiParams(input?: ListQueryInput) {
    return toApiQueryParams(normalizeListingListQuery(input))
  },

  toStableKeyPart(input: Record<string, unknown>) {
    return toStableQueryKeyPart(input)
  },

  toStableKey(input?: ListQueryInput) {
    return toStableQueryKeyPart(normalizeListingListQuery(input))
  },
}
