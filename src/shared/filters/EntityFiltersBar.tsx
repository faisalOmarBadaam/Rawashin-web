'use client'

import GenericFiltersBar from '@/components/filters/GenericFiltersBar'
import type { FilterFieldSchema } from '@/components/filters/filterSchema'

type Props<TQuery extends Record<string, unknown>> = {
  schema: Array<FilterFieldSchema<TQuery>>
  query: TQuery
  setQuery: (query: Partial<TQuery>, options?: { resetPage?: boolean }) => void
  onReset?: () => void
}

/**
 * Thin compatibility wrapper around GenericFiltersBar.
 * Keeps migration path stable while moving to module-driven filter declarations.
 */
export default function EntityFiltersBar<TQuery extends Record<string, unknown>>({
  schema,
  query,
  setQuery,
  onReset,
}: Props<TQuery>) {
  return <GenericFiltersBar schema={schema} query={query} setQuery={setQuery} onReset={onReset} />
}
