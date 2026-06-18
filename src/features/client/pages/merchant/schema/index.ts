import { z } from 'zod'

export const merchantFilterSchema = z.object({
  search: z.string().default(''),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
})

export type MerchantFilters = z.infer<typeof merchantFilterSchema>