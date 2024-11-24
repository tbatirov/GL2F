import React from 'react';
import { useStandardStore } from '../../store/standardStore';
import { Account } from '../../types/accounting';

interface AccountSelectProps {
  value: string;
  onChange: (value: string) => void;
  entryType: 'debit' | 'credit';
  amount: string;
  error?: boolean;
}

export const AccountSelect: React.FC<AccountSelectProps> = ({
  value,
  onChange,
  entryType,
  amount,
  error
}) => {
  const { getActiveStandard, getAccounts } = useStandardStore();
  const activeStandard = getActiveStandard();
  const allAccounts = activeStandard ? getAccounts(activeStandard.id!) : [];

  const getFilteredAccounts = (): Account[] => {
    if (!activeStandard) return allAccounts;

    return allAccounts.filter(account => {
      const signConvention = activeStandard.signConventions[account.type];
      if (!signConvention) return true;

      const isPositiveAmount = parseFloat(amount) > 0;
      
      if (entryType === 'debit') {
        return signConvention.normalBalance === 'debit';
      } else {
        return signConvention.normalBalance === 'credit';
      }
    });
  };

  const accounts = getFilteredAccounts();

  // Group accounts by type
  const groupedAccounts = accounts.reduce((groups, account) => {
    const type = account.type.charAt(0).toUpperCase() + account.type.slice(1);
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {} as Record<string, Account[]>);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
        error ? 'border-red-300' : 'border-gray-300'
      }`}
    >
      <option value="">Select Account</option>
      {Object.entries(groupedAccounts).map(([type, accounts]) => (
        <optgroup key={type} label={type}>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.code} - {account.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};