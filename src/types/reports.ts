export interface FinancialReport {
  id: string;
  name: string;
  type: 'balance-sheet' | 'income-statement' | 'cash-flow';
  period: {
    start: Date;
    end: Date;
  };
  data: ReportData;
  createdAt: Date;
}

export interface ReportData {
  sections: ReportSection[];
  totals: {
    [key: string]: number;
  };
}

export interface ReportSection {
  title: string;
  items: ReportItem[];
  total: number;
}

export interface ReportItem {
  accountId: string;
  accountName: string;
  amount: number;
  percentage?: number;
  trend?: number;
}