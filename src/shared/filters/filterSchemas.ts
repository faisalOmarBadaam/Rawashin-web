import type { FilterFieldSchema } from '@/components/filters/filterSchema'

export type EntityFilterSchema<TQuery extends Record<string, unknown>> = Array<
  FilterFieldSchema<TQuery>
>

/**
 * Compatibility helper for migration from ad-hoc filter bars to schema-driven filters.
 */
export const defineFilterSchema = <TQuery extends Record<string, unknown>>(
  schema: EntityFilterSchema<TQuery>,
): EntityFilterSchema<TQuery> => schema
