import { create } from 'zustand';
import { 
  AccountingStandard, 
  Account, 
  StatementRule,
  AccountType,
  SignConvention
} from '../types/accounting';

interface StandardStore {
  standards: AccountingStandard[];
  accounts: Account[];
  rules: StatementRule[];
  
  // Standard operations
  addStandard: (standard: Omit<AccountingStandard, 'id' | 'createdAt' | 'updatedAt'>) => AccountingStandard;
  updateStandard: (id: string, standard: Partial<AccountingStandard>) => void;
  deleteStandard: (id: string) => void;
  getActiveStandard: () => AccountingStandard | undefined;
  
  // Account operations
  addAccounts: (accounts: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>[]) => Account[];
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  getAccounts: (standardId: string) => Account[];
  
  // Rule operations
  addRule: (rule: Omit<StatementRule, 'id' | 'createdAt' | 'updatedAt'>) => StatementRule;
  updateRule: (id: string, rule: Partial<StatementRule>) => void;
  deleteRule: (id: string) => void;
  getRules: (standardId: string) => StatementRule[];
  
  // Validation and processing
  validateTransaction: (
    standardId: string,
    accountCode: string,
    amount: number,
    type: 'debit' | 'credit'
  ) => boolean;
  
  getSignConvention: (
    standardId: string,
    accountType: AccountType
  ) => SignConvention | undefined;
}

export const useStandardStore = create<StandardStore>((set, get) => ({
  standards: [],
  accounts: [],
  rules: [],

  addStandard: (newStandard) => {
    const standard: AccountingStandard = {
      ...newStandard,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      standards: [...state.standards, standard],
    }));

    return standard;
  },

  updateStandard: (id, updatedStandard) => {
    set((state) => ({
      standards: state.standards.map((standard) =>
        standard.id === id
          ? { ...standard, ...updatedStandard, updatedAt: new Date() }
          : standard
      ),
    }));
  },

  deleteStandard: (id) => {
    set((state) => ({
      standards: state.standards.filter((standard) => standard.id !== id),
      accounts: state.accounts.filter((account) => account.standardId !== id),
      rules: state.rules.filter((rule) => rule.standardId !== id),
    }));
  },

  getActiveStandard: () => {
    return get().standards.find((standard) => standard.isActive);
  },

  addAccounts: (newAccounts) => {
    const accounts = newAccounts.map((account) => ({
      ...account,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    set((state) => ({
      accounts: [...state.accounts, ...accounts],
    }));

    return accounts;
  },

  updateAccount: (id, updatedAccount) => {
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === id
          ? { ...account, ...updatedAccount, updatedAt: new Date() }
          : account
      ),
    }));
  },

  deleteAccount: (id) => {
    set((state) => ({
      accounts: state.accounts.filter((account) => account.id !== id),
    }));
  },

  getAccounts: (standardId) => {
    return get().accounts.filter((account) => account.standardId === standardId);
  },

  addRule: (newRule) => {
    const rule: StatementRule = {
      ...newRule,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      rules: [...state.rules, rule],
    }));

    return rule;
  },

  updateRule: (id, updatedRule) => {
    set((state) => ({
      rules: state.rules.map((rule) =>
        rule.id === id
          ? { ...rule, ...updatedRule, updatedAt: new Date() }
          : rule
      ),
    }));
  },

  deleteRule: (id) => {
    set((state) => ({
      rules: state.rules.filter((rule) => rule.id !== id),
    }));
  },

  getRules: (standardId) => {
    return get().rules.filter((rule) => rule.standardId === standardId);
  },

  validateTransaction: (standardId, accountCode, amount, type) => {
    const account = get().accounts.find(
      (a) => a.standardId === standardId && a.code === accountCode
    );

    if (!account) return false;

    const standard = get().standards.find((s) => s.id === standardId);
    if (!standard) return false;

    const convention = standard.signConventions[account.type];
    if (!convention) return false;

    // Validate based on sign convention
    if (amount > 0) {
      return type === convention.increaseBy;
    } else {
      return type !== convention.increaseBy;
    }
  },

  getSignConvention: (standardId, accountType) => {
    const standard = get().standards.find((s) => s.id === standardId);
    return standard?.signConventions[accountType];
  },
}));