import { z } from 'zod'

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  domain: z.string().max(200).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  size: z.enum(['1-10','11-50','51-200','201-500','500+']).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  address: z.record(z.string(), z.string()).default({}),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.string(), z.unknown()).default({}),
  owner_id: z.string().uuid().optional().nullable(),
})

export const updateCompanySchema = createCompanySchema.partial()

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
