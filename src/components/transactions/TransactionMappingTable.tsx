import React from 'react';
import { Transaction } from '../../types/ledger';
import { AccountSelect } from './AccountSelect';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useStandardStore } from '../../store/standardStore';

interface TransactionMappingTableProps {
  transactions: Transaction[];
  onAccountSelect: (transactionId: string, entryType: 'debit' | 'credit', accountId: string) => void;
  errors: Record<string, string>;
}

export const TransactionMappingTable: React.FC<TransactionMappingTableProps> = ({
  transactions,
  onAccountSelect,
  errors
}) => {
  const { getActiveStandard, getAccounts } = useStandardStore();
  const activeStandard = getActiveStandard();
  const accounts = activeStandard ? getAccounts(activeStandard.id!) : [];

  const getAccountDisplay = (accountId: string | undefined) => {
    if (!accountId) return '';
    const account = accounts.find(a => a.id === accountId);
    return account ? `${account.code} - ${account.name}` : '';
  };

  const getStatusColor = (transaction: Transaction) => {
    if (errors[transaction.id!]) return 'text-red-600';
    if (transaction.entries.every(e => e.accountId)) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = (transaction: Transaction) => {
    if (errors[transaction.id!]) return <AlertCircle className="h-4 w-4" />;
    if (transaction.entries.every(e => e.accountId)) return <CheckCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => {
              const debitEntry = transaction.entries.find(e => e.type === 'debit');
              const creditEntry = transaction.entries.find(e => e.type === 'credit');
              const error = errors[transaction.id!];

              return (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.transactionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <AccountSelect
                        value={debitEntry?.accountId || ''}
                        onChange={(value) => onAccountSelect(transaction.id!, 'debit', value)}
                        entryType="debit"
                        amount={debitEntry?.amount || '0'}
                        error={!!error}
                      />
                      {debitEntry?.accountId && (
                        <span className="text-xs text-gray-500">
                          {getAccountDisplay(debitEntry.accountId)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <AccountSelect
                        value={creditEntry?.accountId || ''}
                        onChange={(value) => onAccountSelect(transaction.id!, 'credit', value)}
                        entryType="credit"
                        amount={creditEntry?.amount || '0'}
                        error={!!error}
                      />
                      {creditEntry?.accountId && (
                        <span className="text-xs text-gray-500">
                          {getAccountDisplay(creditEntry.accountId)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${debitEntry?.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${getStatusColor(transaction)}`}>
                      {getStatusIcon(transaction)}
                      <span className="ml-2 text-xs">
                        {error || (transaction.entries.every(e => e.accountId) ? 'Mapped' : 'Pending')}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};