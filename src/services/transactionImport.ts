import Papa from 'papaparse';
import { Transaction, TransactionEntry } from '../types/ledger';

export interface ImportResult {
  success: boolean;
  data?: Transaction[];
  errors?: string[];
}

const REQUIRED_HEADERS = [
  'Transaction_ID',
  'Date',
  'Time',
  'Description',
  'Account_Number',
  'Customer_Name',
  'Transaction_Type',
  'Amount'
];

export async function parseTransactionsCSV(
  file: File,
  companyId: string
): Promise<ImportResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        // Validate headers first
        const headers = results.meta.fields || [];
        const missingHeaders = REQUIRED_HEADERS.filter(
          required => !headers.includes(required)
        );

        if (missingHeaders.length > 0) {
          resolve({
            success: false,
            errors: [`Missing required headers: ${missingHeaders.join(', ')}`]
          });
          return;
        }

        try {
          const transactions: Transaction[] = [];
          const errors: string[] = [];

          results.data.forEach((row: any, index: number) => {
            try {
              // Validate required fields
              const missingFields = REQUIRED_HEADERS.filter(
                field => !row[field] || String(row[field]).trim() === ''
              );

              if (missingFields.length > 0) {
                errors.push(`Row ${index + 1}: Missing required fields: ${missingFields.join(', ')}`);
                return;
              }

              // Create transaction entries
              const entries: TransactionEntry[] = [
                {
                  id: crypto.randomUUID(),
                  transactionId: String(row.Transaction_ID).trim(),
                  accountNumber: String(row.Account_Number).trim(),
                  type: row.Transaction_Type.toLowerCase() === 'debit' ? 'debit' : 'credit',
                  amount: String(row.Amount).trim(),
                  status: 'pending'
                },
                {
                  id: crypto.randomUUID(),
                  transactionId: String(row.Transaction_ID).trim(),
                  accountNumber: '', // Will be mapped later
                  type: row.Transaction_Type.toLowerCase() === 'debit' ? 'credit' : 'debit',
                  amount: String(row.Amount).trim(),
                  status: 'pending'
                }
              ];

              transactions.push({
                id: crypto.randomUUID(),
                transactionId: String(row.Transaction_ID).trim(),
                date: String(row.Date).trim(),
                time: String(row.Time).trim(),
                description: String(row.Description).trim(),
                customerName: String(row.Customer_Name).trim(),
                companyId,
                entries,
                status: 'pending'
              });
            } catch (error) {
              errors.push(`Row ${index + 1}: Invalid data format`);
            }
          });

          if (errors.length > 0) {
            resolve({ success: false, errors });
          } else {
            resolve({ success: true, data: transactions });
          }
        } catch (error) {
          resolve({
            success: false,
            errors: ['Failed to process CSV data']
          });
        }
      },
      error: (error) => {
        resolve({
          success: false,
          errors: [`Failed to parse CSV file: ${error.message}`]
        });
      }
    });
  });
}