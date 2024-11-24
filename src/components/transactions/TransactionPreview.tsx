import React from 'react';
import { useTransactionStore } from '../../store/transactionStore';
import { useStandardStore } from '../../store/standardStore';
import { Check, ArrowLeft } from 'lucide-react';

interface TransactionPreviewProps {
  companyId: string | null;
  onApprove: () => void;
  onEdit: () => void;
}

export const TransactionPreview: React.FC<TransactionPreviewProps> = ({
  companyId,
  onApprove,
  onEdit
}) => {
  const { transactions, approveTransactions } = useTransactionStore();
  const { getActiveStandard, getAccounts } = useStandardStore();
  const activeStandard = getActiveStandard();
  const accounts = activeStandard ? getAccounts(activeStandard.id!) : [];

  // Filter transactions for the selected company
  const companyTransactions = companyId ? 
    transactions.filter(t => t.companyId === companyId) : [];

  // Calculate totals
  const totals = companyTransactions.reduce((acc, transaction) => {
    const debitEntry = transaction.entries.find(e => e.type === 'debit');
    if (debitEntry) {
      acc.totalDebits += parseFloat(debitEntry.amount);
      acc.totalCredits += parseFloat(debitEntry.amount); // Credits should equal debits
    }
    return acc;
  }, { totalDebits: 0, totalCredits: 0 });

  const handleApprove = () => {
    if (!companyId) return;
    approveTransactions(companyId);
    onApprove();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium">Transaction Summary</h2>
            <p className="mt-1 text-sm text-gray-500">
              Review and approve transaction mappings
            </p>
          </div>
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500">Total Debits</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              ${totals.totalDebits.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500">Total Credits</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              ${totals.totalCredits.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <div className="mt-1 flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-lg font-medium text-green-600">Balanced</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Transaction Details</h3>
        </div>
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
                  Debit Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companyTransactions.map((transaction) => {
                const debitEntry = transaction.entries.find(e => e.type === 'debit');
                const creditEntry = transaction.entries.find(e => e.type === 'credit');
                const debitAccount = debitEntry?.accountId ? 
                  accounts.find(a => a.id === debitEntry.accountId) : null;
                const creditAccount = creditEntry?.accountId ?
                  accounts.find(a => a.id === creditEntry.accountId) : null;

                return (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {debitAccount ? `${debitAccount.code} - ${debitAccount.name}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {creditAccount ? `${creditAccount.code} - ${creditAccount.name}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${debitEntry?.amount}
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