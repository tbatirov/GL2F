import Papa from 'papaparse';
import { Account } from '../types/accounting';

export interface ImportResult {
  success: boolean;
  data?: Account[];
  errors?: string[];
}

const REQUIRED_HEADERS = [
  'accounting_code',
  'accounting_name',
  'type',
  'subtype',
  'sign_convention'
];

export async function parseAccountsCSV(
  file: File,
  standardId: string
): Promise<ImportResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        // Only validate headers
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
          const accounts: Account[] = results.data.map((row: any) => ({
            id: crypto.randomUUID(),
            standardId,
            code: String(row.accounting_code || '').trim(),
            name: String(row.accounting_name || '').trim(),
            type: String(row.type || '').toLowerCase(),
            subtype: String(row.subtype || '').toLowerCase(),
            level: String(row.level || row.subtype || '').toLowerCase(),
            description: String(row.description || '').trim(),
            isActive: true,
            metadata: {
              signConvention: String(row.sign_convention || '').trim()
            }
          }));

          resolve({ success: true, data: accounts });
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