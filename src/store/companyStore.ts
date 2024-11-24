import { create } from 'zustand';
import { Company, CompanyStatement, FiscalPeriod } from '../types/company';

interface CompanyStore {
  companies: Company[];
  fiscalPeriods: FiscalPeriod[];
  statements: CompanyStatement[];
  selectedCompanyId: string | null;
  
  // Company operations
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Company;
  updateCompany: (id: string, company: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  selectCompany: (id: string | null) => void;
  
  // Fiscal Period operations
  addFiscalPeriod: (period: Omit<FiscalPeriod, 'id' | 'createdAt' | 'updatedAt'>) => FiscalPeriod;
  updateFiscalPeriod: (id: string, period: Partial<FiscalPeriod>) => void;
  deleteFiscalPeriod: (id: string) => void;
  getCompanyFiscalPeriods: (companyId: string) => FiscalPeriod[];
  getActiveFiscalPeriod: (companyId: string) => FiscalPeriod | undefined;
  
  // Statement operations
  addStatement: (statement: Omit<CompanyStatement, 'id' | 'createdAt' | 'updatedAt'>) => CompanyStatement;
  getCompanyStatements: (companyId: string) => CompanyStatement[];
  getStatement: (id: string) => CompanyStatement | undefined;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  companies: [],
  fiscalPeriods: [],
  statements: [],
  selectedCompanyId: null,

  addCompany: (newCompany) => {
    const company: Company = {
      ...newCompany,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      companies: [...state.companies, company],
    }));

    return company;
  },

  updateCompany: (id, updatedCompany) => {
    set((state) => ({
      companies: state.companies.map((company) =>
        company.id === id
          ? { ...company, ...updatedCompany, updatedAt: new Date() }
          : company
      ),
    }));
  },

  deleteCompany: (id) => {
    set((state) => ({
      companies: state.companies.filter((company) => company.id !== id),
      fiscalPeriods: state.fiscalPeriods.filter((period) => period.companyId !== id),
      statements: state.statements.filter((statement) => statement.companyId !== id),
      selectedCompanyId: state.selectedCompanyId === id ? null : state.selectedCompanyId,
    }));
  },

  selectCompany: (id) => {
    set({ selectedCompanyId: id });
  },

  addFiscalPeriod: (newPeriod) => {
    // Deactivate other periods for the same company if this one is active
    if (newPeriod.isActive) {
      set((state) => ({
        fiscalPeriods: state.fiscalPeriods.map((period) =>
          period.companyId === newPeriod.companyId
            ? { ...period, isActive: false }
            : period
        ),
      }));
    }

    const period: FiscalPeriod = {
      ...newPeriod,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      fiscalPeriods: [...state.fiscalPeriods, period],
    }));

    return period;
  },

  updateFiscalPeriod: (id, updatedPeriod) => {
    // If updating to active, deactivate other periods for the same company
    if (updatedPeriod.isActive) {
      const period = get().fiscalPeriods.find((p) => p.id === id);
      if (period) {
        set((state) => ({
          fiscalPeriods: state.fiscalPeriods.map((p) =>
            p.companyId === period.companyId && p.id !== id
              ? { ...p, isActive: false }
              : p
          ),
        }));
      }
    }

    set((state) => ({
      fiscalPeriods: state.fiscalPeriods.map((period) =>
        period.id === id
          ? { ...period, ...updatedPeriod, updatedAt: new Date() }
          : period
      ),
    }));
  },

  deleteFiscalPeriod: (id) => {
    set((state) => ({
      fiscalPeriods: state.fiscalPeriods.filter((period) => period.id !== id),
      statements: state.statements.filter((statement) => statement.fiscalPeriodId !== id),
    }));
  },

  getCompanyFiscalPeriods: (companyId) => {
    return get().fiscalPeriods
      .filter((period) => period.companyId === companyId)
      .sort((a, b) => b.year - a.year || b.startMonth - a.startMonth);
  },

  getActiveFiscalPeriod: (companyId) => {
    return get().fiscalPeriods.find(
      (period) => period.companyId === companyId && period.isActive
    );
  },

  addStatement: (newStatement) => {
    const statement: CompanyStatement = {
      ...newStatement,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      statements: [...state.statements, statement],
    }));

    return statement;
  },

  getCompanyStatements: (companyId) => {
    return get().statements.filter((statement) => statement.companyId === companyId);
  },

  getStatement: (id) => {
    return get().statements.find((statement) => statement.id === id);
  },
}));