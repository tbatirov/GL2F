import { z } from 'zod';

export const industrySchema = z.enum([
  'agriculture',
  'construction',
  'education',
  'financial_services',
  'healthcare',
  'hospitality',
  'information_technology',
  'manufacturing',
  'mining',
  'real_estate',
  'retail',
  'telecommunications',
  'transportation',
  'utilities',
  'other'
]);

export const fiscalPeriodSchema = z.object({
  id: z.string().optional(),
  companyId: z.string(),
  year: z.number().int().min(1900).max(2100),
  startMonth: z.number().int().min(1).max(12),
  endMonth: z.number().int().min(1).max(12),
  isActive: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const companySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Company name must be at least 3 characters'),
  code: z.string().min(2, 'Company code must be at least 2 characters'),
  industry: industrySchema,
  taxId: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type Industry = z.infer<typeof industrySchema>;
export type FiscalPeriod = z.infer<typeof fiscalPeriodSchema>;
export type Company = z.infer<typeof companySchema>;

export interface CompanyStatement {
  id: string;
  companyId: string;
  fiscalPeriodId: string;
  type: 'balance-sheet' | 'income-statement' | 'cash-flow';
  data: any;
  createdAt: Date;
  updatedAt: Date;
}