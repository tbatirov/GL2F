import { create } from 'zustand';
import { Transaction } from '../types/ledger';
import { useStandardStore } from './standardStore';
import { mappingLogger } from '../services/mappingLogger';
import { mappingOrchestrator } from '../services/mappingOrchestrator';

interface TransactionStore {
  transactions: Transaction[];
  addTransactions: (transactions: Transaction[]) => void;
  updateTransactionMapping: (transactionId: string, debitAccountId: string, creditAccountId: string) => void;
  autoMapTransactions: (companyId: string) => Promise<void>;
  approveTransactions: (companyId: string) => void;
  getTransactionsByCompany: (companyId: string) => Transaction[];
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],

  addTransactions: (newTransactions) => {
    mappingLogger.clear();
    set((state) => ({
      transactions: [...state.transactions, ...newTransactions]
    }));
  },

  updateTransactionMapping: (transactionId, debitAccountId, creditAccountId) => {
    set((state) => ({
      transactions: state.transactions.map(t => {
        if (t.id === transactionId) {
          const updatedEntries = t.entries.map(entry => ({
            ...entry,
            accountId: entry.type === 'debit' ? debitAccountId : creditAccountId,
            status: 'mapped'
          }));

          return {
            ...t,
            entries: updatedEntries,
            status: 'mapped',
            updatedAt: new Date()
          };
        }
        return t;
      })
    }));

    mappingLogger.log('info', `Manual mapping updated for transaction ${transactionId}`, {
      debitAccountId,
      creditAccountId
    });
  },

  autoMapTransactions: async (companyId) => {
    try {
      const { getActiveStandard, getAccounts } = useStandardStore.getState();
      const activeStandard = getActiveStandard();
      
      if (!activeStandard) {
        throw new Error('No active accounting standard found');
      }
      
      const accounts = getAccounts(activeStandard.id!);
      if (!accounts.length) {
        throw new Error('No accounts found in chart of accounts');
      }

      // Initialize orchestrator
      await mappingOrchestrator.initialize(accounts, activeStandard);

      // Get transactions to map
      const transactions = get().transactions.filter(
        t => t.companyId === companyId && t.status === 'pending'
      );

      // Process transactions
      for (const transaction of transactions) {
        try {
          const result = await mappingOrchestrator.mapTransaction(transaction, accounts);
          
          if (result.confidence > 0.7 && result.debitAccount && result.creditAccount) {
            get().updateTransactionMapping(
              transaction.id!,
              result.debitAccount.id!,
              result.creditAccount.id!
            );
          }
        } catch (error) {
          mappingLogger.log('error', `Failed to map transaction ${transaction.id}`, error);
        }
      }

    } catch (error) {
      mappingLogger.log('error', 'Auto-mapping failed', error);
      throw error;
    }
  },

  approveTransactions: (companyId) => {
    set((state) => ({
      transactions: state.transactions.map(t =>
        t.companyId === companyId && t.status === 'mapped'
          ? {
              ...t,
              status: 'approved',
              updatedAt: new Date()
            }
          : t
      )
    }));
  },

  getTransactionsByCompany: (companyId) => {
    return get().transactions.filter(t => t.companyId === companyId);
  }
}));