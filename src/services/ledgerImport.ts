import Papa from 'papaparse';
import { ledgerEntrySchema, LedgerEntryData } from '../types/validation';

export interface ImportResult {
  success: boolean;
  data?: LedgerEntryData[];
  errors?: string[];
}

const REQUIRED_HEADERS = [
  'Date',
  'Reference',
  'Description',
  'Debit_Account',
  'Debit_Account_Name',
  'Credit_Account',
  'Credit_Account_Name',
  'Amount',
  'Running_Balance',
  'Posted_By'
];

export async function parseLedgerCSV(file: File): Promise<ImportResult> {
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

        const validEntries: LedgerEntryData[] = [];
        const errors: string[] = [];

        results.data.forEach((row: any, index) => {
          const rowNumber = index + 1;
          const missingFields = [];

          for (const field of REQUIRED_HEADERS) {
            if (!row[field] || String(row[field]).trim() === '') {
              missingFields.push(field);
            }
          }

          if (missingFields.length > 0) {
            errors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`);
            return;
          }

          // Create a clean object with just the required fields
          const entryData = {
            Date: String(row.Date).trim(),
            Reference: String(row.Reference).trim(),
            Description: String(row.Description).trim(),
            Debit_Account: String(row.Debit_Account).trim(),
            Debit_Account_Name: String(row.Debit_Account_Name).trim(),
            Credit_Account: String(row.Credit_Account).trim(),
            Credit_Account_Name: String(row.Credit_Account_Name).trim(),
            Amount: String(row.Amount).trim(),
            Running_Balance: String(row.Running_Balance).trim(),
            Posted_By: String(row.Posted_By).trim()
          };

          try {
            const validatedRow = ledgerEntrySchema.parse(entryData);
            validEntries.push(validatedRow);
          } catch (error) {
            errors.push(`Row ${rowNumber}: Invalid data format`);
          }
        });

        if (errors.length > 0) {
          resolve({ success: false, errors });
        } else {
          resolve({ success: true, data: validEntries });
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