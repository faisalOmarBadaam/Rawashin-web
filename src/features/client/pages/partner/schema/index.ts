import { z } from 'zod'

export const partnerFilterSchema = z.object({
  search: z.string().default(''),
  type: z.enum(['government', 'private', 'ngo']).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
})

export type PartnerFilters = z.infer<typeof partnerFilterSchema>