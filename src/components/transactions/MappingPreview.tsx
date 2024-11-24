import React, { useState } from 'react';
import { useTransactionStore } from '../../store/transactionStore';
import { useStandardStore } from '../../store/standardStore';
import { Check, ArrowLeft, FileText } from 'lucide-react';

interface MappingPreviewProps {
  companyId: string | null;
  onApprove: () => void;
  onEdit: () => void;
}

export const MappingPreview: React.FC<MappingPreviewProps> = ({
  companyId,
  onApprove,
  onEdit
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const transactions = useTransactionStore(state => state.transactions);
  const { getActiveStandard, getAccounts } = useStandardStore();
  const activeStandard = getActiveStandard();
  const accounts = activeStandard ? getAccounts(activeStandard.id!) : [];

  const mappedTransactions = transactions.filter(t => t.accountId);
  const unmappedTransactions = transactions.filter(t => !t.accountId);

  const handleApprove = async () => {
    setIsGenerating(true);
    try {
      // Here you would typically:
      // 1. Save the final mappings
      // 2. Generate initial statements
      // 3. Update workflow status
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      onApprove();
    } catch (error) {
      console.error('Failed to process mappings:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Mapping Review</h2>
          <div className="flex gap-4">
            <button
              onClick={onEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Edit Mappings
            </button>
            <button
              onClick={handleApprove}
              disabled={isGenerating || unmappedTransactions.length > 0}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Approve & Generate
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Mapping Statistics</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Transactions</span>
                <span className="text-sm font-medium">{transactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mapped Transactions</span>
                <span className="text-sm font-medium text-green-600">{mappedTransactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Unmapped Transactions</span>
                <span className="text-sm font-medium text-red-600">{unmappedTransactions.length}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Account Distribution</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {Object.entries(
                mappedTransactions.reduce((acc, t) => {
                  const account = accounts.find(a => a.id === t.accountId);
                  if (account) {
                    acc[account.type] = (acc[account.type] || 0) + 1;
                  }
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Transaction Preview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction, index) => {
                const account = accounts.find(a => a.id === transaction.accountId);
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account ? `${account.code} - ${account.name}` : 'Unmapped'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {account ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Mapped
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Unmapped
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};