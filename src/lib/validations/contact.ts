import { z } from 'zod'

export const createContactSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().max(100).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  company_id: z.string().uuid().optional().nullable(),
  job_title: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).default([]),
  source: z.enum(['manual','mailchimp','stripe','calendly','import']).default('manual'),
  custom_fields: z.record(z.string(), z.unknown()).default({}),
  owner_id: z.string().uuid().optional().nullable(),
})

export const updateContactSchema = createContactSchema.partial()

export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>
