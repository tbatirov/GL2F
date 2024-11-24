import { create } from 'zustand';
import { FinancialReport } from '../types/reports';
import { useAccountStore } from './accountStore';
import { useTransactionStore } from './transactionStore';

interface ReportStore {
  reports: FinancialReport[];
  generateReport: (type: FinancialReport['type'], period: { start: Date; end: Date }) => FinancialReport;
  getReport: (id: string) => FinancialReport | undefined;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  generateReport: (type, period) => {
    const accounts = useAccountStore.getState().accounts;
    const transactions = useTransactionStore.getState().transactions;
    
    // Filter transactions for the period
    const periodTransactions = transactions.filter(
      (t) => t.date >= period.start && t.date <= period.end && t.status === 'posted'
    );

    // Calculate account balances for the period
    const balances = new Map<string, number>();
    accounts.forEach(account => balances.set(account.id, 0));
    
    periodTransactions.forEach(transaction => {
      transaction.entries.forEach(entry => {
        const currentBalance = balances.get(entry.accountId) || 0;
        balances.set(
          entry.accountId,
          currentBalance + entry.debit - entry.credit
        );
      });
    });

    // Generate report data based on type
    let reportData;
    switch (type) {
      case 'balance-sheet':
        reportData = {
          sections: [
            {
              title: 'Assets',
              items: accounts
                .filter(a => a.type === 'asset')
                .map(a => ({
                  accountId: a.id,
                  accountName: a.name,
                  amount: balances.get(a.id) || 0,
                })),
              total: accounts
                .filter(a => a.type === 'asset')
                .reduce((sum, a) => sum + (balances.get(a.id) || 0), 0),
            },
            {
              title: 'Liabilities',
              items: accounts
                .filter(a => a.type === 'liability')
                .map(a => ({
                  accountId: a.id,
                  accountName: a.name,
                  amount: balances.get(a.id) || 0,
                })),
              total: accounts
                .filter(a => a.type === 'liability')
                .reduce((sum, a) => sum + (balances.get(a.id) || 0), 0),
            },
            {
              title: 'Equity',
              items: accounts
                .filter(a => a.type === 'equity')
                .map(a => ({
                  accountId: a.id,
                  accountName: a.name,
                  amount: balances.get(a.id) || 0,
                })),
              total: accounts
                .filter(a => a.type === 'equity')
                .reduce((sum, a) => sum + (balances.get(a.id) || 0), 0),
            },
          ],
          totals: {
            assets: accounts
              .filter(a => a.type === 'asset')
              .reduce((sum, a) => sum + (balances.get(a.id) || 0), 0),
            liabilitiesAndEquity: accounts
              .filter(a => a.type === 'liability' || a.type === 'equity')
              .reduce((sum, a) => sum + (balances.get(a.id) || 0), 0),
          },
        };
        break;

      case 'income-statement':
        reportData = {
          sections: [
            {
              title: 'Revenue',
              items: accounts
                .filter(a => a.type === 'revenue')
                .map(a => ({
                  accountId: a.id,
                  accountName: a.name,
                  amount: balances.get(a.id) || 0,
                })),
              total: accounts
                .filter(a => a.type === 'revenue')
                .reduce((sum, a) => sum + (balances.get(a.id) || 0), 0),
            },
            {
              title: 'Expenses',
              items: accounts
                .filter(a => a.type === 'expense')
                .map(a => ({
                  accountId: a.id,
                  accountName: a.name,
                  amount: balances.get(a.id) || 0,
                })),
              total: accounts
                .filter(a => a.type === 'expense')
                .reduce((sum, a) => sum + (balances.get(a.id) || 0), 0),
            },
          ],
          totals: {
            revenue: accounts
              .filter(a => a.type === 'revenue')
              .reduce((sum, a) => sum + (balances.get(a.id) || 0), 0),
            expenses: accounts
              .filter(a => a.type === 'expense')
              .reduce((sum, a) => sum + (balances.get(a.id) || 0), 0),
            netIncome: accounts
              .filter(a => a.type === 'revenue')
              .reduce((sum, a) => sum + (balances.get(a.id) || 0), 0) -
              accounts
                .filter(a => a.type === 'expense')
                .reduce((sum, a) => sum + (balances.get(a.id) || 0), 0),
          },
        };
        break;

      default:
        throw new Error(`Unsupported report type: ${type}`);
    }

    const report: FinancialReport = {
      id: crypto.randomUUID(),
      name: `${type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} - ${period.start.toLocaleDateString()} to ${period.end.toLocaleDateString()}`,
      type,
      period,
      data: reportData,
      createdAt: new Date(),
    };

    set(state => ({
      reports: [...state.reports, report],
    }));

    return report;
  },
  getReport: (id) => {
    return get().reports.find(r => r.id === id);
  },
}));