import { useState } from 'react'
import { supportTicketSchema, type SupportFilters } from '../schema'

export function useSupportFilters(initialValues?: Partial<SupportFilters>) {
  const [filters, setFilters] = useState<SupportFilters>(() => supportTicketSchema.parse(initialValues ?? {}))

  const resetFilters = () => {
    setFilters(supportTicketSchema.parse({}))
  }

  return {
    filters,
    setFilters,
    resetFilters,
  }
}