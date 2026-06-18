import { z } from 'zod'

export const settlementFilterSchema = z.object({
  search: z.string().default(''),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  status: z.enum(['draft', 'processing', 'completed', 'failed']).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
})

export type SettlementFilters = z.infer<typeof settlementFilterSchema>