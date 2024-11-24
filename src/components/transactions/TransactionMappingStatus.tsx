import React from 'react';
import { useTransactionStore } from '../../store/transactionStore';
import { RefreshCw, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface TransactionMappingStatusProps {
  companyId: string | null;
  onAutoMap: () => Promise<void>;
  onComplete: () => void;
  isAutoMapping: boolean;
  hasErrors: boolean;
  progress: number;
}

export const TransactionMappingStatus: React.FC<TransactionMappingStatusProps> = ({
  companyId,
  onAutoMap,
  onComplete,
  isAutoMapping,
  hasErrors,
  progress
}) => {
  const transactions = useTransactionStore(state => 
    state.transactions.filter(t => t.companyId === companyId)
  );

  const mappedCount = transactions.filter(t => 
    t.entries.every(e => e.accountId)
  ).length;

  const errorCount = transactions.filter(t => 
    t.entries.some(e => !e.accountId)
  ).length;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Mapping Status</h2>
          <p className="mt-1 text-sm text-gray-500">
            {mappedCount} of {transactions.length} transactions mapped
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onAutoMap}
            disabled={isAutoMapping || mappedCount === transactions.length}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAutoMapping ? 'animate-spin' : ''}`} />
            {isAutoMapping ? 'Mapping...' : 'Auto-Map'}
          </button>
          <button
            onClick={onComplete}
            disabled={mappedCount !== transactions.length || hasErrors}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Continue
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="relative pt-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-semibold inline-block text-indigo-600">
                {isAutoMapping ? 'Auto-mapping in progress' : 'Mapping Progress'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-indigo-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-100">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500 ease-out"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500">Total</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {transactions.length}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500">Mapped</p>
          <div className="mt-1 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-2xl font-semibold text-green-600">{mappedCount}</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500">Errors</p>
          <div className="mt-1 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-2xl font-semibold text-red-600">{errorCount}</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500">Success Rate</p>
          <p className="mt-1 text-2xl font-semibold text-indigo-600">
            {transactions.length > 0
              ? `${Math.round((mappedCount / transactions.length) * 100)}%`
              : '0%'}
          </p>
        </div>
      </div>

      {/* Mapping Details */}
      {isAutoMapping && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Mapping Details</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Analyzing transaction patterns</p>
            <p>• Building account mappings</p>
            <p>• Validating entries</p>
            <p className="text-xs text-gray-500">This may take a few moments...</p>
          </div>
        </div>
      )}
    </div>
  );
};