import React, { useState } from 'react';
import { useStandardStore } from '../../store/standardStore';
import { UploadCloud } from 'lucide-react';
import { parseAccountsCSV } from '../../services/accountImport';

interface AccountImportProps {
  onSuccess?: () => void;
}

export const AccountImport = ({ onSuccess }: AccountImportProps) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { addAccounts, getActiveStandard } = useStandardStore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const activeStandard = getActiveStandard();
    if (!activeStandard) {
      setError('No active accounting standard found');
      return;
    }

    try {
      const result = await parseAccountsCSV(file, activeStandard.id!);
      
      if (result.success && result.data) {
        const accounts = addAccounts(result.data);
        setSuccess(`Successfully imported ${accounts.length} accounts`);
        setError(null);
        onSuccess?.();
      } else {
        setError(Array.isArray(result.errors) ? result.errors.join('\n') : 'Failed to import accounts');
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
                Upload Chart of Accounts CSV
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
          <li>accounting_code</li>
          <li>accounting_name</li>
          <li>type</li>
          <li>subtype</li>
          <li>sign_convention</li>
        </ul>
      </div>
    </div>
  );
};