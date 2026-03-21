import { z } from 'zod'

export const createActivitySchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'task']),
  subject: z.string().min(1, 'Subject is required').max(200),
  description: z.string().optional().nullable(),
  status: z.enum(['planned', 'done', 'cancelled']).default('planned'),
  due_at: z.string().datetime().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  deal_id: z.string().uuid().optional().nullable(),
  company_id: z.string().uuid().optional().nullable(),
  owner_id: z.string().uuid().optional().nullable(),
})

export const updateActivitySchema = createActivitySchema.partial()

export type CreateActivityInput = z.infer<typeof createActivitySchema>
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>
