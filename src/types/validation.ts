import { z } from 'zod';

export const accountImportSchema = z.object({
  accounting_code: z.string().min(1, 'Account code is required'),
  accounting_name: z.string().min(1, 'Account name is required'),
  type: z.string().min(1, 'Type is required'),
  subtype: z.string().min(1, 'Subtype is required'),
  sign_convention: z.string().min(1, 'Sign convention is required')
}).strict();

export const ledgerEntrySchema = z.object({
  Date: z.string().min(1, 'Date is required'),
  Reference: z.string().min(1, 'Reference is required'),
  Description: z.string().min(1, 'Description is required'),
  Debit_Account: z.string().min(1, 'Debit account is required'),
  Debit_Account_Name: z.string().min(1, 'Debit account name is required'),
  Credit_Account: z.string().min(1, 'Credit account is required'),
  Credit_Account_Name: z.string().min(1, 'Credit account name is required'),
  Amount: z.string().min(1, 'Amount is required'),
  Running_Balance: z.string().min(1, 'Running balance is required'),
  Posted_By: z.string().min(1, 'Posted by is required')
}).strict();

export type AccountImportData = z.infer<typeof accountImportSchema>;
export type LedgerEntryData = z.infer<typeof ledgerEntrySchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}