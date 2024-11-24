import { z } from 'zod';

// Account Types
export type AccountType = 
  | 'asset'
  | 'liability'
  | 'equity'
  | 'revenue'
  | 'expense'
  | 'production'
  | 'memo'
  | 'off';

export type AccountSubtype =
  | 'current-asset'
  | 'non-current-asset'
  | 'current-liability'
  | 'non-current-liability'
  | 'contributed-capital'
  | 'retained-earnings'
  | 'operating-revenue'
  | 'other-revenue'
  | 'operating-expense'
  | 'other-expense'
  | 'header'
  | 'group'
  | 'detail';

export type AccountLevel = 'header' | 'group' | 'detail';

export interface Account {
  id?: string;
  standardId: string;
  code: string;
  name: string;
  type: AccountType;
  subtype: AccountSubtype;
  level: AccountLevel;
  description?: string;
  isActive: boolean;
  parentId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Statement Types
export interface StatementRule {
  id: string;
  standardId: string;
  name: string;
  description: string;
  condition: string;
  errorMessage: string;
  scope: 'account' | 'transaction' | 'report';
  createdAt: Date;
  updatedAt: Date;
}

export interface SignConvention {
  normalBalance: 'debit' | 'credit';
  increaseBy: 'debit' | 'credit';
}

export interface AccountingStandard {
  id?: string;
  name: string;
  description: string;
  version: string;
  effectiveDate: Date;
  isActive: boolean;
  accountCodeFormat: {
    pattern: string;
    description: string;
    example: string;
  };
  signConventions: Record<AccountType, SignConvention>;
  rules: StatementRule[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Validation Schemas
export const accountTypeSchema = z.enum([
  'asset',
  'liability',
  'equity',
  'revenue',
  'expense',
  'production',
  'memo',
  'off'
]);

export const accountSubtypeSchema = z.enum([
  'current-asset',
  'non-current-asset',
  'current-liability',
  'non-current-liability',
  'contributed-capital',
  'retained-earnings',
  'operating-revenue',
  'other-revenue',
  'operating-expense',
  'other-expense',
  'header',
  'group',
  'detail'
]);

export const accountLevelSchema = z.enum(['header', 'group', 'detail']);

export const signConventionSchema = z.object({
  normalBalance: z.enum(['debit', 'credit']),
  increaseBy: z.enum(['debit', 'credit'])
});

export const accountingRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().min(1, 'Rule description is required'),
  condition: z.string().min(1, 'Condition is required'),
  errorMessage: z.string().min(1, 'Error message is required'),
  scope: z.enum(['account', 'transaction', 'report'])
});

export const accountSchema = z.object({
  standardId: z.string(),
  code: z.string().min(1, 'Account code is required'),
  name: z.string().min(3, 'Account name must be at least 3 characters'),
  type: accountTypeSchema,
  subtype: accountSubtypeSchema,
  level: accountLevelSchema,
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  parentId: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

export const accountingStandardSchema = z.object({
  name: z.string().min(3, 'Standard name must be at least 3 characters'),
  description: z.string(),
  version: z.string(),
  effectiveDate: z.coerce.date(),
  isActive: z.boolean(),
  accountCodeFormat: z.object({
    pattern: z.string(),
    description: z.string(),
    example: z.string()
  }),
  signConventions: z.record(accountTypeSchema, signConventionSchema),
  rules: z.array(accountingRuleSchema)
});