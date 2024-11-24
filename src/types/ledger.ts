import { z } from 'zod';

export const transactionEntrySchema = z.object({
  id: z.string().optional(),
  transactionId: z.string(),
  accountId: z.string().optional(),
  accountNumber: z.string().min(1, 'Account number is required'),
  type: z.enum(['debit', 'credit']),
  amount: z.string().min(1, 'Amount is required'),
  description: z.string().optional(),
  mappingRuleId: z.string().optional(),
  status: z.enum(['pending', 'mapped', 'approved', 'posted', 'void']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const transactionSchema = z.object({
  id: z.string().optional(),
  transactionId: z.string().min(1, 'Transaction ID is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  description: z.string().min(1, 'Description is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  companyId: z.string(),
  entries: z.array(transactionEntrySchema).length(2, 'Each transaction must have exactly two entries'),
  status: z.enum(['pending', 'mapped', 'approved', 'posted', 'void']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type TransactionEntry = z.infer<typeof transactionEntrySchema>;
export type Transaction = z.infer<typeof transactionSchema>;

export interface MappingRule {
  id: string;
  pattern: string;
  debitAccountId: string;
  creditAccountId: string;
  description: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneralLedger {
  id: string;
  companyId: string;
  transactions: Transaction[];
  createdAt: Date;
  updatedAt: Date;
}