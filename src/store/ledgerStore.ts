import { create } from 'zustand';
import { Transaction, GeneralLedger, FinancialStatementData } from '../types/ledger';

interface LedgerStore {
  ledgers: GeneralLedger[];
  statements: Map<string, FinancialStatementData>; // key: companyId-fiscalPeriodId

  // Ledger operations
  addTransactions: (
    companyId: string,
    fiscalPeriodId: string,
    transactions: Transaction[]
  ) => GeneralLedger;
  
  getLedger: (companyId: string, fiscalPeriodId: string) => GeneralLedger | undefined;
  
  // Statement operations
  generateStatements: (
    companyId: string,
    fiscalPeriodId: string,
    transactions: Transaction[]
  ) => FinancialStatementData;
  
  saveStatements: (
    companyId: string,
    fiscalPeriodId: string,
    statements: FinancialStatementData
  ) => void;
  
  getStatements: (
    companyId: string,
    fiscalPeriodId: string
  ) => FinancialStatementData | undefined;
}

export const useLedgerStore = create<LedgerStore>((set, get) => ({
  ledgers: [],
  statements: new Map(),

  addTransactions: (companyId, fiscalPeriodId, transactions) => {
    const existingLedger = get().ledgers.find(
      l => l.companyId === companyId && l.fiscalPeriodId === fiscalPeriodId
    );

    if (existingLedger) {
      const updatedLedger = {
        ...existingLedger,
        transactions: [...existingLedger.transactions, ...transactions],
        updatedAt: new Date(),
      };

      set(state => ({
        ledgers: state.ledgers.map(l => 
          l.id === existingLedger.id ? updatedLedger : l
        ),
      }));

      return updatedLedger;
    }

    const newLedger: GeneralLedger = {
      id: crypto.randomUUID(),
      companyId,
      fiscalPeriodId,
      transactions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set(state => ({
      ledgers: [...state.ledgers, newLedger],
    }));

    return newLedger;
  },

  getLedger: (companyId, fiscalPeriodId) => {
    return get().ledgers.find(
      l => l.companyId === companyId && l.fiscalPeriodId === fiscalPeriodId
    );
  },

  generateStatements: (companyId, fiscalPeriodId, transactions) => {
    // This is a simplified example. In a real application, you would:
    // 1. Process transactions according to accounting rules
    // 2. Calculate correct totals for each statement
    // 3. Apply proper accounting principles
    // 4. Handle currency conversions if needed
    // 5. Apply industry-specific rules

    const statements: FinancialStatementData = {
      balanceSheet: {
        assets: {},
        liabilities: {},
        equity: {},
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0,
      },
      incomeStatement: {
        revenues: {},
        expenses: {},
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
      },
      cashFlow: {
        operating: {},
        investing: {},
        financing: {},
        netCashFlow: 0,
      },
      pnl: {
        grossProfit: 0,
        operatingIncome: 0,
        netIncome: 0,
        items: [],
      },
    };

    // Process transactions and generate statements
    // This is where you would implement the actual accounting logic

    return statements;
  },

  saveStatements: (companyId, fiscalPeriodId, statements) => {
    const key = `${companyId}-${fiscalPeriodId}`;
    set(state => {
      const newStatements = new Map(state.statements);
      newStatements.set(key, statements);
      return { statements: newStatements };
    });
  },

  getStatements: (companyId, fiscalPeriodId) => {
    const key = `${companyId}-${fiscalPeriodId}`;
    return get().statements.get(key);
  },
}));