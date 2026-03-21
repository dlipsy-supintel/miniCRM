import { z } from 'zod'

export const createDealSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  value: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).default('USD'),
  stage_id: z.string().uuid('Stage is required'),
  contact_id: z.string().uuid().optional().nullable(),
  company_id: z.string().uuid().optional().nullable(),
  owner_id: z.string().uuid().optional().nullable(),
  expected_close: z.string().optional().nullable(),
  probability: z.number().min(0).max(100).optional().nullable(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.string(), z.unknown()).default({}),
})

export const updateDealSchema = createDealSchema.partial()
export const moveDealStageSchema = z.object({ stage_id: z.string().uuid() })

export type CreateDealInput = z.infer<typeof createDealSchema>
export type UpdateDealInput = z.infer<typeof updateDealSchema>
