import { create } from 'zustand';
import { Account, AccountType, AccountSubtype } from '../types/accounting';

interface AccountStore {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Result<Account, string>;
  updateAccount: (id: string, account: Partial<Account>) => Result<Account, string>;
  deleteAccount: (id: string) => Result<boolean, string>;
  importAccounts: (accounts: any[]) => Result<Account[], string[]>;
}

type Result<T, E> = { success: true; data: T } | { success: false; error: E };

export const useAccountStore = create<AccountStore>((set, get) => ({
  accounts: [],
  
  setAccounts: (accounts) => set({ accounts }),
  
  addAccount: (newAccount) => {
    try {
      const account: Account = {
        ...newAccount,
        id: crypto.randomUUID(),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({
        accounts: [...state.accounts, account],
      }));

      return { success: true, data: account };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid account data' 
      };
    }
  },

  updateAccount: (id, updatedAccount) => {
    const currentAccount = get().accounts.find(a => a.id === id);
    if (!currentAccount) {
      return { success: false, error: 'Account not found' };
    }

    try {
      const newAccount = {
        ...currentAccount,
        ...updatedAccount,
        updatedAt: new Date(),
      };

      set((state) => ({
        accounts: state.accounts.map((account) =>
          account.id === id ? newAccount : account
        ),
      }));

      return { success: true, data: newAccount };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update account'
      };
    }
  },

  deleteAccount: (id) => {
    const account = get().accounts.find(a => a.id === id);
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    set((state) => ({
      accounts: state.accounts.filter((account) => account.id !== id),
    }));

    return { success: true, data: true };
  },

  importAccounts: (accounts) => {
    const results: Account[] = [];
    const errors: string[] = [];

    accounts.forEach((row, index) => {
      try {
        const account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'> = {
          code: row.accounting_code,
          name: row.accounting_name,
          type: row.type.toLowerCase() as AccountType,
          subtype: row.subtype.toLowerCase() as AccountSubtype,
          standardId: '1', // Default standard ID
          active: true,
          description: row.accounting_name
        };

        const result = get().addAccount(account);
        if (result.success) {
          results.push(result.data);
        } else {
          errors.push(`Row ${index + 1}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`Row ${index + 1}: Invalid account data`);
      }
    });

    return errors.length === 0
      ? { success: true, data: results }
      : { success: false, error: errors };
  },
}));