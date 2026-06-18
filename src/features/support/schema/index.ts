import { z } from 'zod'

export const supportTicketSchema = z.object({
  search: z.string().default(''),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'pending', 'resolved', 'closed']).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
})

export type SupportFilters = z.infer<typeof supportTicketSchema>