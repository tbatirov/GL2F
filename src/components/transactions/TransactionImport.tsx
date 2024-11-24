import React, { useState } from 'react';
import { useTransactionStore } from '../../store/transactionStore';
import { useCompanyStore } from '../../store/companyStore';
import { UploadCloud } from 'lucide-react';
import { parseTransactionsCSV } from '../../services/transactionImport';

export const TransactionImport = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const importTransactions = useTransactionStore((state) => state.importTransactions);
  const { selectedCompanyId } = useCompanyStore();
  const getActiveFiscalPeriod = useCompanyStore((state) => state.getActiveFiscalPeriod);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedCompanyId) {
      setError('Please select a company first');
      return;
    }

    const activePeriod = getActiveFiscalPeriod(selectedCompanyId);
    if (!activePeriod) {
      setError('No active fiscal period found for the selected company');
      return;
    }

    try {
      const result = await parseTransactionsCSV(file, selectedCompanyId, activePeriod.id!);
      
      if (result.success && result.data) {
        const importResult = importTransactions(result.data);
        
        if (importResult.success) {
          setSuccess(`Successfully imported ${importResult.data.length} transactions`);
          setError(null);
        } else {
          setError(importResult.error.join('\n'));
          setSuccess(null);
        }
      } else {
        setError(result.errors?.join('\n') || 'Failed to import transactions');
        setSuccess(null);
      }
    } catch (err) {
      setError('Failed to parse CSV file');
      setSuccess(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Upload Transactions CSV
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleFileUpload}
              />
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">CSV file up to 10MB</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Import failed</h3>
              <div className="mt-2 text-sm text-red-700">
                <pre className="whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900">Required CSV Headers</h4>
        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
          <li>Transaction_ID</li>
          <li>Date</li>
          <li>Time</li>
          <li>Description</li>
          <li>Account_Number</li>
          <li>Customer_Name</li>
          <li>Transaction_Type</li>
          <li>Amount</li>
        </ul>
      </div>
    </div>
  );
};